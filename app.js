/* ============================================================
   TOPSAIL — interactions
   ============================================================ */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Interactive dot grid (reactbits-style) ----------
     A field of dots. Dots near the cursor are pushed outward and
     brightened toward the accent color, with a springy return.     */
  function DotGrid(canvas, opts) {
    opts = opts || {};
    const ctx = canvas.getContext("2d");
    const GAP = opts.gap || 30;
    const BASE_R = opts.dot || 1.4;
    const INFLUENCE = opts.influence || 150;
    const PUSH = opts.push || 26;
    const baseColor = opts.base || [122, 142, 158];   // muted slate
    const accent = [240, 101, 62];                    // signal coral
    let dots = [], w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999, active: false };

    function build() {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      const cols = Math.ceil(w / GAP) + 1;
      const rows = Math.ceil(h / GAP) + 1;
      const offX = (w - (cols - 1) * GAP) / 2;
      const offY = (h - (rows - 1) * GAP) / 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offX + c * GAP, y = offY + r * GAP;
          dots.push({ ox: x, oy: y, x: x, y: y, vx: 0, vy: 0 });
        }
      }
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        let glow = 0;
        if (mouse.active) {
          const dx = d.ox - mouse.x, dy = d.oy - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < INFLUENCE) {
            const f = (1 - dist / INFLUENCE);
            glow = f;
            const ang = Math.atan2(dy, dx);
            const force = f * f * PUSH;
            d.vx += Math.cos(ang) * force * 0.12;
            d.vy += Math.sin(ang) * force * 0.12;
          }
        }
        // spring home
        d.vx += (d.ox - d.x) * 0.06;
        d.vy += (d.oy - d.y) * 0.06;
        d.vx *= 0.86; d.vy *= 0.86;
        d.x += d.vx; d.y += d.vy;

        const cr = baseColor[0] + (accent[0] - baseColor[0]) * glow;
        const cg = baseColor[1] + (accent[1] - baseColor[1]) * glow;
        const cb = baseColor[2] + (accent[2] - baseColor[2]) * glow;
        const alpha = 0.28 + glow * 0.7;
        const radius = BASE_R + glow * 1.7;

        ctx.beginPath();
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + (cr|0) + "," + (cg|0) + "," + (cb|0) + "," + alpha + ")";
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      const cx = (e.touches ? e.touches[0].clientX : e.clientX);
      const cy = (e.touches ? e.touches[0].clientY : e.clientY);
      mouse.x = cx - rect.left; mouse.y = cy - rect.top; mouse.active = true;
    }
    function onLeave() { mouse.active = false; }

    build();
    window.addEventListener("resize", build);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave);
    if (!reduced) requestAnimationFrame(frame);
    else frame(); // single static paint
  }

  const g1 = document.getElementById("dotgrid");
  if (g1) DotGrid(g1, { gap: 32, dot: 1.5, influence: 160, push: 30 });
  const g2 = document.getElementById("dotgrid2");
  if (g2) DotGrid(g2, { gap: 40, dot: 1.2, influence: 130, push: 18, base: [90, 110, 128] });

  /* ---------- 2. Nav scroll state ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 3. Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  const revealAll = () => reveals.forEach((el) => el.classList.add("in"));
  if (!("IntersectionObserver" in window)) {
    // No IO support: just show everything.
    revealAll();
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el, i) => {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 0.07) + "s";
      io.observe(el);
    });
    // Failsafe: never leave content hidden if a section is loaded but never scrolled into view.
    window.addEventListener("load", () => setTimeout(revealAll, 2600));
  }

  /* ---------- 4. FAQ accordion ---------- */
  document.querySelectorAll(".acc__q").forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.parentElement;
      const ans = item.querySelector(".acc__a");
      const open = item.classList.contains("open");
      document.querySelectorAll(".acc.open").forEach((o) => {
        o.classList.remove("open");
        o.querySelector(".acc__a").style.maxHeight = null;
      });
      if (!open) { item.classList.add("open"); ans.style.maxHeight = ans.scrollHeight + "px"; }
    });
  });

  /* ---------- 5. Animated stat counters ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const dur = 1400, start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.innerHTML = prefix + val + '<span class="u">' + suffix + "</span>";
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const statIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { animateCount(en.target); statIO.unobserve(en.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll(".stat__num[data-count]").forEach((el) => statIO.observe(el));

  /* ---------- 6. Mobile menu (simple anchor scroll fallback) ---------- */
  const menuBtn = document.getElementById("navMenu");
  if (menuBtn) menuBtn.addEventListener("click", () => {
    document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
  });
})();
