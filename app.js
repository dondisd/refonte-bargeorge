// Reveals au scroll + scroll-scrub du film du manoir (H9). Vanilla, rien de bloquant.
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveals
  var items = document.querySelectorAll('[data-reveal]');
  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var siblings = el.parentElement ? el.parentElement.querySelectorAll('[data-reveal]') : [];
        var idx = Array.prototype.indexOf.call(siblings, el);
        el.style.transitionDelay = (idx > 0 ? Math.min(idx * 90, 450) : 0) + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Scroll-scrub : la frame suit la progression du scroll dans la section hero
  var sec = document.querySelector('.scrub');
  if (!sec || reduced) return;
  var img = sec.querySelector('.scrub-img');
  var overlay = sec.querySelector('.hero-overlay');
  var n = parseInt(sec.dataset.frames, 10);
  var base = sec.dataset.path;
  var pad = function (i) { return ('00' + i).slice(-3); };
  // Préchargement progressif (après le premier paint)
  window.addEventListener('load', function () {
    for (var i = 2; i <= n; i++) { var im = new Image(); im.src = base + pad(i) + '.webp'; }
  });
  var ticking = false;
  function update() {
    var r = sec.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    var progress = Math.min(1, Math.max(0, -r.top / (total || 1)));
    var idx = 1 + Math.round(progress * (n - 1));
    img.src = base + pad(idx) + '.webp';
    // le texte s'efface doucement pendant que le film avance
    if (overlay) overlay.style.opacity = String(1 - Math.min(1, progress * 1.4) * 0.9);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();
