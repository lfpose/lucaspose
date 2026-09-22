(()=>{
'use strict';
const hero=document.querySelector('.hero');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let frame=0,visible=true;
function render(){
 frame=0;
 const progress=Math.min(Math.max(scrollY,0),hero.offsetHeight);
 hero.style.setProperty('--photo-shift',reduced.matches?'0px':(-progress*.035).toFixed(2)+'px');
}
function schedule(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render);}
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',schedule,{passive:true});
reduced.addEventListener('change',render);
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
render();
})();