(() => {
  const trail = document.querySelector('.trail');
  const svg = document.querySelector('.trail-line');
  const path = svg.querySelector('path');
  const nodes = Array.from(document.querySelectorAll('.node'));
  const thumbs = nodes.map((n) => n.querySelector('.thumb'));

  // ---------- Build the static curve through thumb centers ----------
  function buildCurve() {
    const trailRect = trail.getBoundingClientRect();
    const trailTop = trailRect.top + window.scrollY;
    const w = trailRect.width;
    const h = trail.offsetHeight;

    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);

    const points = thumbs.map((t) => {
      const r = t.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 - trailRect.left,
        y: r.top + window.scrollY + r.height / 2 - trailTop,
      };
    });

    if (points.length < 2) return;

    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const midY = (a.y + b.y) / 2;
      // Smooth S-curve between consecutive thumbs
      d += ` C ${a.x.toFixed(1)} ${midY.toFixed(1)}, ${b.x.toFixed(1)} ${midY.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
    }
    path.setAttribute('d', d);
  }

  // ---------- Mark the node closest to viewport center as active ----------
  function updateActive() {
    const viewportCenter = window.scrollY + window.innerHeight / 2;
    let activeIdx = -1;
    let minDist = Infinity;

    nodes.forEach((node, i) => {
      const r = node.getBoundingClientRect();
      const center = r.top + window.scrollY + r.height / 2;
      const dist = Math.abs(center - viewportCenter);
      if (dist < minDist) {
        minDist = dist;
        activeIdx = i;
      }
    });

    nodes.forEach((n, i) => n.classList.toggle('active', i === activeIdx));
  }

  // ---------- Wire up ----------
  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildCurve();
      updateActive();
    }, 80);
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateActive();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('load', () => {
    buildCurve();
    updateActive();
  });

  // First paint
  buildCurve();
  updateActive();
})();
