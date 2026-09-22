/* Old-film light pass for the hero, hero only.
   Two canvases: "light" (mix-blend-mode: screen) carries light leaks and halation; "dark" (normal blend) carries the vignette, dust and hairs.
   Runs at 30fps, pauses when hidden or off-screen, freezes to a still frame
   under prefers-reduced-motion. */
(() => {
  const hero = document.querySelector('.hero');
  const light = document.querySelector('.hero-film-light');
  const dark = document.querySelector('.hero-film-dark');
  if (!hero || !(light instanceof HTMLCanvasElement) || !(dark instanceof HTMLCanvasElement)) return;
  const lc = light.getContext('2d'), dc = dark.getContext('2d');
  if (!lc || !dc) return;

  const FPS = 30;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let W = 0, H = 0, raf = 0, last = 0, visible = true, t0 = performance.now();
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* Dust: short-lived specks and hairs. Scratches: taller lines that jitter for a few frames. */
  const marks = [];

  function resize() {
    const b = hero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = Math.max(1, Math.round(b.width * dpr)); H = Math.max(1, Math.round(b.height * dpr));
    for (const c of [light, dark]) { c.width = W; c.height = H; }
    paint(performance.now());
  }

  /* 0 at the top of the page, 1 once the hero has fully scrolled away (set by app.js). */
  const progress = () => Math.min(1, Math.max(0, parseFloat(hero.style.getPropertyValue('--grain-scroll')) || 0));
  const A = (v) => Math.min(1, v).toFixed(3);

  function paintLight(now) {
    const t = now - t0;
    const k = progress();
    /* light: gentle at rest, blooming to ~2x as you scroll away */
    const gain = .24 + k * 1.6;    // soft at rest, ~2x once scrolled away
    lc.clearRect(0, 0, W, H);
    lc.globalCompositeOperation = 'lighter';
    /* Edge leak, after the reference frame: light bleeds in from the left edge,
       orange to deep red, hottest (near white) at the bottom-left corner, with a thin
       chromatic fringe (cyan/blue to warm) running along the top and bottom edges.
       It breathes slowly instead of drifting. */
    const br = (.85 + .15 * Math.sin(t * .00035)) * gain;   // breathing, scaled by scroll
    const reach = W * (.24 + .04 * Math.sin(t * .00022) + k * .3);  // reaches further in as you scroll
    // main left band
    const lg = lc.createLinearGradient(0, 0, reach, 0);
    lg.addColorStop(0, `rgba(255,120,40,${A(.85 * br)})`);
    lg.addColorStop(.18, `rgba(235,60,30,${A(.55 * br)})`);
    lg.addColorStop(.55, `rgba(150,30,20,${A(.22 * br)})`);
    lg.addColorStop(1, 'rgba(120,20,20,0)');
    lc.fillStyle = lg; lc.fillRect(0, 0, reach, H);
    // bottom-left hot core
    const hot = lc.createRadialGradient(W * .02, H * .9, 0, W * .02, H * .9, Math.max(W, H) * .42);
    hot.addColorStop(0, `rgba(255,250,230,${A(.95 * br)})`);
    hot.addColorStop(.18, `rgba(255,225,150,${A(.6 * br)})`);
    hot.addColorStop(.5, `rgba(255,140,60,${A(.22 * br)})`);
    hot.addColorStop(1, 'rgba(255,120,40,0)');
    lc.fillStyle = hot; lc.fillRect(0, 0, W, H);
    // warm bottom band creeping right from the hot corner
    const bg = lc.createLinearGradient(0, H, 0, H * .72);
    bg.addColorStop(0, `rgba(255,150,60,${A(.55 * br)})`); bg.addColorStop(1, 'rgba(255,120,40,0)');
    const bx = lc.createLinearGradient(0, 0, W * .85, 0);
    lc.save(); lc.fillStyle = bg; lc.fillRect(0, H * .72, W, H * .28);
    lc.globalCompositeOperation = 'destination-out';
    bx.addColorStop(0, 'rgba(0,0,0,0)'); bx.addColorStop(1, 'rgba(0,0,0,1)');
    lc.fillStyle = bx; lc.fillRect(0, H * .72, W, H * .28); lc.restore();
    lc.globalCompositeOperation = 'lighter';
    // chromatic fringe along top and bottom edges, fading toward the right
    const fr = Math.max(3, H * .012);
    for (const [y0, y1] of [[0, fr * 2.2], [H, H - fr * 2.2]]) {
      const eg = lc.createLinearGradient(0, y0, 0, y1);
      eg.addColorStop(0, `rgba(120,200,255,${A(.75 * br)})`);
      eg.addColorStop(.35, `rgba(90,140,255,${A(.45 * br)})`);
      eg.addColorStop(.7, `rgba(255,160,90,${A(.25 * br)})`);
      eg.addColorStop(1, 'rgba(255,120,40,0)');
      const fx = lc.createLinearGradient(0, 0, W * .95, 0);
      fx.addColorStop(0, 'rgba(0,0,0,0)'); fx.addColorStop(.25, 'rgba(0,0,0,0)'); fx.addColorStop(1, 'rgba(0,0,0,1)');
      lc.save(); lc.fillStyle = eg; lc.fillRect(0, Math.min(y0, y1), W, Math.abs(y1 - y0));
      lc.globalCompositeOperation = 'destination-out'; lc.fillStyle = fx; lc.fillRect(0, Math.min(y0, y1), W, Math.abs(y1 - y0)); lc.restore();
      lc.globalCompositeOperation = 'lighter';
    }
    /* Halation: warm bloom where the sky and the water are brightest. */
    const hg = lc.createRadialGradient(W * .45, H * .12, 0, W * .45, H * .12, Math.max(W, H) * .7);
    const h = .5 + k * .9;   // halation also lifts with scroll
    hg.addColorStop(0, `rgba(255,190,130,${A(.08 * h)})`); hg.addColorStop(.5, `rgba(255,150,100,${A(.03 * h)})`); hg.addColorStop(1, 'rgba(255,150,100,0)');
    lc.fillStyle = hg; lc.fillRect(0, 0, W, H);
    const wg = lc.createLinearGradient(0, H * .48, 0, H * .7);
    wg.addColorStop(0, 'rgba(255,215,170,0)'); wg.addColorStop(.5, `rgba(255,215,170,${A(.07 * h)})`); wg.addColorStop(1, 'rgba(255,215,170,0)');
    lc.fillStyle = wg; lc.fillRect(0, 0, W, H);
    /* Light scratches. */
    lc.globalCompositeOperation = 'source-over';
    for (const m of marks) if (m.kind === 'scratch') {
      lc.strokeStyle = `rgba(255,245,225,${A(m.a * (.35 + k * 1.35))})`; lc.lineWidth = m.w;
      lc.beginPath(); lc.moveTo(m.x + rnd(-.6, .6), m.y); lc.lineTo(m.x + rnd(-.6, .6), m.y + m.len); lc.stroke();
    }
  }

  function paintDark() {
    dc.clearRect(0, 0, W, H);
    const vg = dc.createRadialGradient(W * .5, H * .5, Math.min(W, H) * .35, W * .5, H * .5, Math.max(W, H) * .78);
    vg.addColorStop(0, 'rgba(18,22,16,0)'); vg.addColorStop(1, 'rgba(18,22,16,.62)');
    dc.fillStyle = vg; dc.fillRect(0, 0, W, H);
    for (const m of marks) {
      if (m.kind === 'speck') {
        dc.fillStyle = `rgba(20,18,14,${m.a})`;
        dc.beginPath(); dc.ellipse(m.x, m.y, m.w, m.w * rnd(.5, 1.4), rnd(0, 3), 0, Math.PI * 2); dc.fill();
      } else if (m.kind === 'hair') {
        dc.strokeStyle = `rgba(20,18,14,${m.a})`; dc.lineWidth = m.w; dc.beginPath(); dc.moveTo(m.x, m.y);
        dc.bezierCurveTo(m.x + m.dx * .3, m.y + m.dy * .1, m.x + m.dx * .7, m.y + m.dy * .9, m.x + m.dx, m.y + m.dy); dc.stroke();
      }
    }
  }

  function spawn() {
    for (let i = marks.length - 1; i >= 0; i--) if (--marks[i].life <= 0) marks.splice(i, 1);
    if (reduced.matches) return;
    const k = progress();
    if (Math.random() < .25 + k * .35) marks.push({ kind: 'speck', x: rnd(0, W), y: rnd(0, H), w: rnd(.8, 2.6), a: rnd(.35, .8), life: rnd(1, 3) | 0 });
    if (Math.random() < .08 + k * .2) marks.push({ kind: 'hair', x: rnd(0, W), y: rnd(0, H), dx: rnd(-40, 40), dy: rnd(20, 90), w: rnd(.6, 1.2), a: rnd(.35, .7), life: rnd(1, 4) | 0 });
    for (let n = 0; n < 1 + (k * 3 | 0); n++) if (Math.random() < .015 + k * .45) marks.push({ kind: 'scratch', x: rnd(0, W), y: rnd(-H * .2, H * .6), len: rnd(H * .3, H * 1.2), w: rnd(.5, 1.3), a: rnd(.18, .45), life: rnd(3, 14) | 0 });
  }

  function paint(now) { spawn(); paintLight(now); paintDark(); }

  function loop(now) {
    raf = 0;
    if (reduced.matches || document.hidden || !visible) return;
    if (now - last >= 1000 / FPS) { last = now; paint(now); }
    raf = requestAnimationFrame(loop);
  }
  const start = () => { if (!raf) raf = requestAnimationFrame(loop); };

  let rt; const onResize = () => { clearTimeout(rt); rt = setTimeout(resize, 150); };
  resize(); start();
  new ResizeObserver(onResize).observe(hero);
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) start(); }).observe(hero);
  document.addEventListener('visibilitychange', start);
  reduced.addEventListener('change', () => { marks.length = 0; paint(performance.now()); start(); });
})();
