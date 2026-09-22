/* Animated film grain. A handful of small noise tiles are generated once;
   each frame paints one of them as a repeating pattern at a random offset,
   so the whole screen flickers like film at ~12fps for almost no CPU. */
function mountHeroGrain(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const TILE = 192, FRAMES = 6;
  const settings = { fps: 30, contrast: Number(canvas.dataset.contrast) || 1, size: Number(canvas.dataset.size) || 1 };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let tiles = [];
  let resizeTimer, raf = 0, last = 0, disposed = false, frame = 0;

  function makeTile() {
    const c = document.createElement('canvas');
    c.width = c.height = TILE;
    const tctx = c.getContext('2d');
    const image = tctx.createImageData(TILE, TILE);
    const px = image.data;
    for (let i = 0; i < px.length; i += 4) {
      const v = Math.max(0, Math.min(255, Math.round(128 + (Math.random() * 256 - 128) * settings.contrast)));
      px[i] = px[i + 1] = px[i + 2] = v;
      px[i + 3] = 255;
    }
    tctx.putImageData(image, 0, 0);
    return ctx.createPattern(c, 'repeat');
  }
  function rebuild() { tiles = []; for (let i = 0; i < FRAMES; i++) tiles.push(makeTile()); }
  rebuild();

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(bounds.width * dpr));
    const height = Math.max(1, Math.round(bounds.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    paint();
  }

  function paint() {
    ctx.save();
    ctx.scale(settings.size, settings.size);
    ctx.translate(-Math.floor(Math.random() * TILE), -Math.floor(Math.random() * TILE));
    ctx.fillStyle = tiles[frame];
    ctx.fillRect(0, 0, canvas.width / settings.size + TILE, canvas.height / settings.size + TILE);
    ctx.restore();
    frame = (frame + 1) % FRAMES;
  }

  function loop(now) {
    raf = 0;
    if (disposed || reduced.matches || document.hidden) return;
    if (now - last >= 1000 / settings.fps) { last = now; paint(); }
    raf = requestAnimationFrame(loop);
  }
  function start() { if (!raf) raf = requestAnimationFrame(loop); }

  function scheduleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }

  resize();
  start();

  const observer = new ResizeObserver(scheduleResize);
  observer.observe(canvas);
  window.addEventListener('resize', scheduleResize);
  document.addEventListener('visibilitychange', start);
  reduced.addEventListener('change', start);

  return function cleanup() {
    disposed = true;
    cancelAnimationFrame(raf);
    clearTimeout(resizeTimer);
    observer.disconnect();
    window.removeEventListener('resize', scheduleResize);
    document.removeEventListener('visibilitychange', start);
  };
}

document.querySelectorAll('.hero-grain, .hero-grain-scroll').forEach((c) => {
  if (c instanceof HTMLCanvasElement) mountHeroGrain(c);
});
