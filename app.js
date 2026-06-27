/* ============================================================
   TOPSAIL — Direction D interactions
   ============================================================ */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Sea flow-field (cursor-influenced) ----------
     A field of particles advected through a slow vector field with a
     constant rightward wind. The wind is gently influenced by the
     pointer: a smoothed global lean plus a soft local curl near the
     cursor. Never locks to the pointer. Pauses when off-screen.        */
  function SeaField(canvas, opts) {
    opts = opts || {};
    const ctx = canvas.getContext("2d", { alpha: true });
    const DPR = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 700 ? 1.5 : 2);
    const density = opts.density || 340;
    const bias = opts.wind != null ? opts.wind : 1.2;
    const cInfBase = opts.cursor != null ? opts.cursor : 1;
    const bgFill = opts.bg || "#081a2b";
    const trail = opts.trail || 0.085;
    let W = 0, H = 0, lastW = 0, lastH = 0, ps = [], raf = 0, running = false, primed = false;
    const M = { x: 0, y: 0, sx: 0, sy: 0, active: false };

    function seed() {
      ps = [];
      const N = Math.round(density);
      for (let i = 0; i < N; i++) {
        ps.push({ x: Math.random() * W, y: Math.random() * H, red: Math.random() < 0.07 });
      }
    }
    function resize() {
      const rect = canvas.getBoundingClientRect();
      W = rect.width || 1440; H = rect.height || 840;
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.fillStyle = bgFill; ctx.fillRect(0, 0, W, H);
      if (Math.abs(W - lastW) > 2 || Math.abs(H - lastH) > 2 || !ps.length) {
        lastW = W; lastH = H;
        M.x = M.sx = W * 0.5; M.y = M.sy = H * 0.42;
        seed();
      }
    }

    const field = (x, y, t) =>
      (Math.sin(x * 0.0045 + t * 0.00022) +
       Math.cos(y * 0.0055 - t * 0.00028) +
       Math.sin((x + y) * 0.0026 + t * 0.0004)) * 1.05;

    const t0 = performance.now();
    function step(t) {
      const cInf = cInfBase;
      M.sx += (M.x - M.sx) * 0.06;
      M.sy += (M.y - M.sy) * 0.06;
      const gx = (M.sx / W - 0.5) * 2.4 * cInf;   // horizontal lean toward pointer
      const gy = (M.sy / H - 0.42) * 1.7 * cInf;  // lift high / dip low
      const R = 280, R2 = R * R;

      ctx.fillStyle = "rgba(8,26,43," + trail + ")";
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        const a = field(p.x, p.y, t);
        const sp = 0.9 + (i % 5) * 0.2;
        let vx = Math.cos(a) * sp + bias + gx;
        let vy = Math.sin(a) * sp * 0.62 + gy;
        if (M.active && cInf > 0) {
          const dx = M.sx - p.x, dy = M.sy - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / R) * 1.5 * cInf;
            vx += (dx / d) * f; vy += (dy / d) * f;
          }
        }
        const nx = p.x + vx, ny = p.y + vy;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = p.red ? "rgba(224,56,43,0.55)" : "rgba(192,206,218,0.3)";
        ctx.lineWidth = p.red ? 1.5 : 1;
        ctx.stroke();
        p.x = nx; p.y = ny;
        if (p.x > W + 6 || p.x < -6 || p.y < -6 || p.y > H + 6) { p.x = -6; p.y = Math.random() * H; }
      }
    }

    function tick(now) {
      step(now - t0);
      raf = requestAnimationFrame(tick);
    }
    function start() {
      if (running) return;
      running = true;
      if (reduced) { for (let k = 0; k < 240; k++) step(k * 16); return; }
      raf = requestAnimationFrame(tick);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    // pointer mapping via the canvas rect (handles scaling / position)
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const x = (cx - rect.left) / rect.width * W;
      const y = (cy - rect.top) / rect.height * H;
      M.x = x; M.y = y;
      M.active = x >= -40 && y >= -40 && x <= W + 40 && y <= H + 40;
    };
    const onLeave = () => { M.active = false; };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave);

    // prime one static texture so it's visible before rAF / while off-screen
    for (let k = 0; k < 200; k++) step(k * 16);
    primed = true;

    // run only while on screen
    if ("IntersectionObserver" in window && !reduced) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => (en.isIntersecting ? start() : stop()));
      }, { threshold: 0.01 });
      io.observe(canvas);
    } else {
      start();
    }
  }

  // On phones, run only the hero sea (lighter density) and skip the decorative
  // manifesto/CTA fields to save battery and avoid jank.
  const isSmall = window.matchMedia("(max-width: 700px)").matches;
  const seaHero = document.getElementById("seaHero");
  if (seaHero) SeaField(seaHero, { density: isSmall ? 170 : 360, wind: 1.2, cursor: 1 });
  if (!isSmall) {
    const seaMani = document.getElementById("seaManifesto");
    if (seaMani) SeaField(seaMani, { density: 200, wind: 0.8, cursor: 0.7 });
    const seaCta = document.getElementById("seaCta");
    if (seaCta) SeaField(seaCta, { density: 220, wind: 1.0, cursor: 0.8 });
  }

  /* ---------- 2. Nav scroll state ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 3. Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  const revealAll = () => reveals.forEach((el) => el.classList.add("in"));
  if (!("IntersectionObserver" in window)) {
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
    window.addEventListener("load", () => setTimeout(revealAll, 2600));
  }

  /* ---------- 4. FAQ accordion (if present) ---------- */
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

  /* ---------- 5. Mobile menu ---------- */
  const menuBtn = document.getElementById("navMenu");
  const mobileMenu = document.getElementById("mobileMenu");
  if (menuBtn && mobileMenu) {
    const setMenu = (open) => {
      mobileMenu.classList.toggle("open", open);
      menuBtn.textContent = open ? "✕" : "≡";
      menuBtn.setAttribute("aria-expanded", String(open));
      mobileMenu.setAttribute("aria-hidden", String(!open));
    };
    menuBtn.addEventListener("click", () => setMenu(!mobileMenu.classList.contains("open")));
    mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  }
})();
