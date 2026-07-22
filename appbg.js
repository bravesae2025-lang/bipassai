/* Interactive dot-cloud background — shared by app.html (inline) and the
   plans page. On pages without a #workspace mode toggle it stays in the
   'level' (constellation network) mode. Extracted from app.html. */
/* Interactive background — two modes: dot-cloud (level) + geodesic globe (humanize) */
  (function () {
    const bg     = document.getElementById('appbg');
    const canvas = document.getElementById('appbg-canvas');
    const ws     = document.getElementById('workspace');
    if (!bg || !canvas) return;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const MR  = 150, MR2 = MR * MR;     // cursor radius (screen space)
    const TAU = 6.2831853;

    let mode = 'level';       // current render mode
    let pts = [], hpts = [], hstars = [];
    let W = 0, H = 0, cx = 0, cy = 0, dpr = 1;
    let R = 0, F = 0, D3D = 0, D2 = 0;
    let mx = -9999, my = -9999, active = false, raf = null;
    let angY = 0;
    let gt = 0;               // galaxy time (humanize mode)
    const tiltX = 0.32;

    // ── build ────────────────────────────────────────────────
    function build() {
      W = bg.offsetWidth;
      H = bg.offsetHeight;
      if (!W || !H) return;
      cx = W / 2; cy = H / 2;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Sphere sized so its silhouette covers the whole page (incl corners)
      R = 0.5 * Math.hypot(W, H);
      F = R * 2.2;

      if (mode === 'humanize') buildHumanize();
      else if (mode === 'both') { buildLevel(); buildHumanize(); }
      else buildLevel();

      if (reduced) step(true);
    }

    function buildLevel() {
      const n = Math.round((mode === 'both' ? 0.6 : 1) * Math.max(360, Math.min(520, Math.round(R * 0.6))));
      const spacing = Math.cbrt((4 / 3 * Math.PI * R * R * R) / n);
      D3D = spacing * 1.05;
      D2  = D3D * D3D;
      pts = [];
      for (let i = 0; i < n; i++) {
        const u = Math.random() * 2 - 1;
        const phi = Math.random() * TAU;
        // mild outward bias so the visible page margins (sphere edge) stay filled
        const r = R * Math.cbrt(0.12 + 0.88 * Math.random());
        const s = Math.sqrt(1 - u * u);
        pts.push({
          x: r * s * Math.cos(phi), y: r * s * Math.sin(phi), z: r * u,
          vx: (Math.random() - 0.5) * 0.38, vy: (Math.random() - 0.5) * 0.38, vz: (Math.random() - 0.5) * 0.38,
          sx: 0, sy: 0, sc: 1,
        });
      }
    }

    function buildHumanize() {
      // Rotating 3D nebula / spiral galaxy of fine dots (no lines)
      const diskR = 0.62 * Math.hypot(W, H);
      const thickness = diskR * 0.16;
      const n = Math.round((mode === 'both' ? 0.72 : 1) * Math.max(600, Math.min(1600, Math.round(W * H / 1500))));
      const ARMS = 3;
      hpts = [];
      for (let i = 0; i < n; i++) {
        const rn = Math.pow(Math.random(), 1.3);          // 0..1, denser core
        const arm = i % ARMS;
        const ang0 = arm * (TAU / ARMS) + rn * 5.0 + (Math.random() - 0.5) * 0.7;
        hpts.push({
          rn: rn,
          r: rn * diskR,
          ang0: ang0,
          // real vertical thickness — fat bulge at the core, thin in the arms
          zh: (Math.random() - 0.5) * thickness * (0.35 + 0.65 * (1 - rn)),
          w: 0.0009 + 0.0022 * (1 - rn),                  // inner orbits faster
          size: 0.7 + Math.random() * 1.1,
          ph: Math.random() * TAU,                         // twinkle phase
          tws: 0.8 + Math.random() * 0.8,                  // twinkle speed
          ox: 0, oy: 0,                                    // eased cursor warp
          sx: 0, sy: 0, sc: 1,
        });
      }
      // faint deep-space starfield behind the galaxy (parallax depth)
      const sn = Math.round((mode === 'both' ? 0.62 : 1) * W * H / 9000);
      hstars = [];
      for (let i = 0; i < sn; i++) {
        hstars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          dz: 0.2 + Math.random() * 0.8,                   // parallax depth factor
          size: 0.5 + Math.random() * 0.6,
          ph: Math.random() * TAU,
        });
      }
    }

    // ── step / render ────────────────────────────────────────
    function step(still) {
      ctx.clearRect(0, 0, W, H);
      if (!still) angY += 0.0011;
      const cosY = Math.cos(angY), sinY = Math.sin(angY);
      const cosX = Math.cos(tiltX), sinX = Math.sin(tiltX);
      if (mode === 'humanize') stepHumanize(still);
      else if (mode === 'both') {
        // Mix of both backgrounds: galaxy as an atmospheric base, the
        // dot-cloud network layered on top — each dimmed so it reads clean.
        ctx.globalAlpha = 0.62; stepHumanize(still);
        ctx.globalAlpha = 0.7;  stepLevel(still, cosY, sinY, cosX, sinX);
        ctx.globalAlpha = 1;
      }
      else stepLevel(still, cosY, sinY, cosX, sinX);
    }

    function stepLevel(still, cosY, sinY, cosX, sinX) {
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (!still) {
          if (active) {
            const ddx = mx - p.sx, ddy = my - p.sy;
            const d2 = ddx * ddx + ddy * ddy;
            if (d2 < MR2) {
              const d = Math.sqrt(d2) || 1;
              const f = (1 - d / MR) * 0.10;
              const fx = (ddx / d) * f, fy = (ddy / d) * f;
              const ryf = cosX * fy, z1f = -sinX * fy;
              p.vx += cosY * fx - sinY * z1f;
              p.vy += ryf;
              p.vz += sinY * fx + cosY * z1f;
            }
          }
          p.vx *= 0.95; p.vy *= 0.95; p.vz *= 0.95;
          p.x += p.vx; p.y += p.vy; p.z += p.vz;
          const sp = Math.abs(p.vx) + Math.abs(p.vy) + Math.abs(p.vz);
          if (sp < 0.25) { p.vx += (Math.random() - 0.5) * 0.05; p.vy += (Math.random() - 0.5) * 0.05; p.vz += (Math.random() - 0.5) * 0.05; }
          const len2 = p.x * p.x + p.y * p.y + p.z * p.z;
          if (len2 > R * R) {
            const len = Math.sqrt(len2) || 1;
            const nx = p.x / len, ny = p.y / len, nz = p.z / len;
            const dot = p.vx * nx + p.vy * ny + p.vz * nz;
            p.vx -= 2 * dot * nx; p.vy -= 2 * dot * ny; p.vz -= 2 * dot * nz;
            p.x = nx * R; p.y = ny * R; p.z = nz * R;
          }
        }
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y1 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;
        const sc = F / (F + z2);
        p.sx = cx + x1 * sc; p.sy = cy + y1 * sc; p.sc = sc;
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < D2) {
            const al = (1 - Math.sqrt(d2) / D3D) * 0.42 * ((a.sc + b.sc) * 0.5);
            ctx.strokeStyle = 'rgba(32,32,32,' + al.toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
          }
        }
      }
      if (active && !still) {
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          const dx = p.sx - mx, dy = p.sy - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < MR2) {
            const al = (1 - Math.sqrt(d2) / MR) * 0.45;
            ctx.strokeStyle = 'rgba(28,28,28,' + al.toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(p.sx, p.sy); ctx.lineTo(mx, my); ctx.stroke();
          }
        }
      }
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const rad = Math.max(0.5, 1.7 * p.sc);
        let near = false;
        if (active && !still) { const dx = p.sx - mx, dy = p.sy - my; near = (dx * dx + dy * dy) < MR2; }
        const alpha = Math.max(0.44, Math.min(0.95, 0.64 + (p.sc - 0.6) * 0.6));
        ctx.beginPath(); ctx.arc(p.sx, p.sy, rad, 0, TAU);
        ctx.fillStyle = near ? 'rgba(18,18,18,0.9)' : 'rgba(32,32,32,' + alpha.toFixed(3) + ')';
        ctx.fill();
      }
    }

    function stepHumanize(still) {
      if (!still) gt += 1;
      // galaxy orientation: slowly nodding tilt (nutation) + slow spin
      const AX = 1.02 + 0.16 * Math.sin(gt * 0.0008);
      const ay = gt * 0.0006;
      const cosY = Math.cos(ay), sinY = Math.sin(ay);
      const cosX = Math.cos(AX), sinX = Math.sin(AX);
      const tw = gt * 0.05;
      const pgx = active ? (mx - cx) : 0;
      const pgy = active ? (my - cy) : 0;

      // ── faint deep-space starfield (behind, parallax) ──
      for (let i = 0; i < hstars.length; i++) {
        const s = hstars[i];
        const sx = s.x + pgx * 0.015 * s.dz;
        const sy = s.y + pgy * 0.015 * s.dz;
        const twk = still ? 1 : (0.6 + 0.4 * Math.sin(tw * 0.7 + s.ph));
        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, TAU);
        ctx.fillStyle = 'rgba(60,60,60,' + (0.07 + 0.13 * s.dz * twk).toFixed(3) + ')';
        ctx.fill();
      }

      // ── galaxy dots (true 3D volume) ──
      for (let i = 0; i < hpts.length; i++) {
        const p = hpts[i];
        const a = p.ang0 + gt * p.w;          // differential rotation → spiral arms
        const px = Math.cos(a) * p.r, py = Math.sin(a) * p.r, pz = p.zh;
        // rotate X (tilt) then Y (spin) — full 3D, pz gives real depth
        const y1 = py * cosX - pz * sinX;
        const z1 = py * sinX + pz * cosX;
        const x2 = px * cosY + z1 * sinY;
        const z2 = -px * sinY + z1 * cosY;
        const sc = F / (F + z2);
        p.sx = cx + x2 * sc;
        p.sy = cy + y1 * sc;
        p.sc = sc;

        // cursor gravity-lens — push nearby dots outward, ease back
        let tox = 0, toy = 0;
        if (active && !still) {
          const dx = p.sx - mx, dy = p.sy - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < MR2) {
            const d = Math.sqrt(d2) || 1;
            const push = (1 - d / MR) * 26;
            tox = (dx / d) * push; toy = (dy / d) * push;
          }
        }
        if (!still) { p.ox += (tox - p.ox) * 0.10; p.oy += (toy - p.oy) * 0.10; }

        const twk = still ? 1 : (0.7 + 0.3 * Math.sin(tw * p.tws + p.ph));
        const rad = Math.max(0.5, p.size * p.sc * (0.85 + 0.15 * twk));
        const depth = 0.34 + (p.sc - 0.6) * 0.7;        // near brighter
        const core = 0.2 * (1 - p.rn);                   // core a touch brighter
        const alpha = Math.max(0.12, Math.min(0.85, (depth + core) * twk));
        ctx.beginPath();
        ctx.arc(p.sx + p.ox, p.sy + p.oy, rad, 0, TAU);
        ctx.fillStyle = 'rgba(48,48,48,' + alpha.toFixed(3) + ')';
        ctx.fill();
      }
    }

    function tick() { raf = requestAnimationFrame(tick); step(false); }

    function setMode(m) {
      if (m === mode) return;
      mode = m;
      build();
      // soft cross-fade
      canvas.style.opacity = '0';
      requestAnimationFrame(() => { canvas.style.opacity = '1'; });
      if (reduced) step(true);
    }

    // ── input / lifecycle ────────────────────────────────────
    window.addEventListener('pointermove', e => {
      const r = bg.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      active = mx >= -MR && mx <= W + MR && my >= 0 && my <= H + MR;
    }, { passive: true });
    window.addEventListener('pointerout', () => { active = false; }, { passive: true });

    let rz = null;
    const onResize = () => { clearTimeout(rz); rz = setTimeout(build, 150); };
    if (window.ResizeObserver) new ResizeObserver(onResize).observe(bg);
    window.addEventListener('resize', onResize, { passive: true });

    // watch the editor mode toggle (workspace gets .mode-humanize)
    if (ws && window.MutationObserver) {
      new MutationObserver(() => {
        setMode(ws.classList.contains('mode-both') ? 'both'
              : ws.classList.contains('mode-humanize') ? 'humanize' : 'level');
      }).observe(ws, { attributes: true, attributeFilter: ['class'] });
    }

    build();
    if (!reduced) raf = requestAnimationFrame(tick);
  })();
