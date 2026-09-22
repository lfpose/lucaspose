(()=>{
'use strict';
const hero=document.querySelector('.hero');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const hover=matchMedia('(hover: hover) and (pointer: fine)');
/* targets from input, current values eased toward them every frame */
let tx=0,ty=0,cx=0,cy=0,cs=0,frame=0,visible=true;
const set=(k,v)=>hero.style.setProperty(k,v.toFixed(2)+'px');
function tick(){
 frame=0;
 if(reduced.matches){for(const v of['--bg-shift','--fg-shift','--bg-x','--fg-x'])hero.style.setProperty(v,'0px');return;}
 const ts=Math.min(Math.max(scrollY,0),hero.offsetHeight);
 cs+=(ts-cs)*.25; cx+=(tx-cx)*.08; cy+=(ty-cy)*.08;
 /* The foreground PNG ends at the hero's bottom edge, so it stays pinned.
    The background drifts DOWN as you scroll (slower than the page = farther away);
    the strip it uncovers is at the top of the hero, which has already scrolled off-screen,
    so the hero's bottom edge is always covered. Pointer only nudges the foreground sideways. */
 set('--bg-shift',cs*.07+cy*8); set('--fg-shift',0);
 set('--bg-x',cx*5); set('--fg-x',cx*10);
 hero.style.setProperty('--grain-scroll',(cs/hero.offsetHeight).toFixed(3));
 if(Math.abs(ts-cs)>.05||Math.abs(tx-cx)>.005||Math.abs(ty-cy)>.005)schedule();
}
function schedule(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(tick);}
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',schedule,{passive:true});
if(hover.matches){
 /* window-level so hovering the nav or leaving the hero never snaps the layers */
 addEventListener('pointermove',e=>{tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5;schedule();},{passive:true});
}
reduced.addEventListener('change',schedule);
document.addEventListener('visibilitychange',schedule);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)schedule();}).observe(hero);
function reveal(el,delay=0){
 if(reduced.matches||!el.animate)return;
 el.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],
 {duration:850,delay,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
}
document.querySelectorAll('.enter').forEach((el,i)=>reveal(el,100+i*80));
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){reveal(e.target);observer.unobserve(e.target);}},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
tick();
})();
