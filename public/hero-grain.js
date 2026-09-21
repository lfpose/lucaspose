function mountHeroGrain(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  let resizeTimer;
  let disposed = false;

  function draw() {
    if (disposed) return;

    const bounds = canvas.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(bounds.width * dpr));
    const height = Math.max(1, Math.round(bounds.height * dpr));

    if (canvas.width === width && canvas.height === height) return;

    canvas.width = width;
    canvas.height = height;

    const image = ctx.createImageData(width, height);
    const pixels = image.data;

    for (let i = 0; i < pixels.length; i += 4) {
      const value = Math.floor(Math.random() * 256);
      pixels[i] = value;
      pixels[i + 1] = value;
      pixels[i + 2] = value;
      pixels[i + 3] = 255;
    }

    ctx.putImageData(image, 0, 0);
  }

  function scheduleDraw() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(draw, 150);
  }

  canvas.width = 0;
  canvas.height = 0;
  draw();

  const observer = new ResizeObserver(scheduleDraw);
  observer.observe(canvas);
  window.addEventListener('resize', scheduleDraw);

  return function cleanup() {
    disposed = true;
    clearTimeout(resizeTimer);
    observer.disconnect();
    window.removeEventListener('resize', scheduleDraw);
  };
}

const heroGrain = document.querySelector('.hero-grain');
if (heroGrain instanceof HTMLCanvasElement) mountHeroGrain(heroGrain);
