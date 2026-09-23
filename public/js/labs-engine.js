/**
 * VIGORISH LABS // CREATIVE TECHNOLOGY LABORATORY ENGINE
 * High-performance interactive generative visual & scroll-driven process visualizer.
 * Architecture:
 * - Experiment 001: Generative Motion System (Kinetic Mesh, Signal Wave, Pixel Matrix)
 * - Scroll-Driven Creative Process (01 IDEA -> 02 BUILD -> 03 TEST -> 04 REFINE -> 05 RELEASE)
 * - Low CPU / GPU-friendly: requestAnimationFrame, DPR capping, IntersectionObserver auto-pause
 * - Respects prefers-reduced-motion
 */

(function () {
  'use strict';

  // ==========================================
  // CONFIGURATION & STATE
  // ==========================================
  const BRAND_BLUE = '#052F55';
  const LUMINOUS_BLUE = '#2997ff';
  const CYAN_ACCENT = '#64d2ff';
  const EMERALD_GREEN = '#30d158';

  const state = {
    exp001: {
      canvas: null,
      ctx: null,
      width: 0,
      height: 0,
      dpr: 1,
      mode: 'kinetic', // 'kinetic' | 'wave' | 'matrix'
      nodes: [],
      trails: [],
      ripples: [],
      mouse: { x: -1000, y: -1000, prevX: -1000, prevY: -1000, vx: 0, vy: 0, isDown: false, active: false },
      animId: null,
      isVisible: false,
      lastTime: performance.now(),
      fps: 60,
      frameCount: 0,
      reducedMotion: false,
      interactionTimer: null
    },
    process: {
      canvas: null,
      ctx: null,
      width: 0,
      height: 0,
      dpr: 1,
      currentStage: 1, // 1 to 5
      targetStage: 1,
      morphProgress: 1,
      animId: null,
      isVisible: false,
      time: 0
    }
  };

  // Check reduced motion preference
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  state.exp001.reducedMotion = mediaQuery.matches;
  mediaQuery.addEventListener('change', (e) => {
    state.exp001.reducedMotion = e.matches;
  });

  // ==========================================
  // 1. LIVE EXPERIMENT 001: GENERATIVE MOTION SYSTEM
  // ==========================================

  function initExperiment001() {
    const canvas = document.getElementById('labsExp001Canvas');
    if (!canvas) return;

    state.exp001.canvas = canvas;
    state.exp001.ctx = canvas.getContext('2d', { alpha: true });

    resizeExp001();
    window.addEventListener('resize', debounce(resizeExp001, 150));

    // Interaction listeners
    const container = canvas.parentElement || canvas;

    function handlePointerMove(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const newX = clientX - rect.left;
      const newY = clientY - rect.top;

      state.exp001.mouse.vx = newX - state.exp001.mouse.x;
      state.exp001.mouse.vy = newY - state.exp001.mouse.y;
      state.exp001.mouse.prevX = state.exp001.mouse.x;
      state.exp001.mouse.prevY = state.exp001.mouse.y;
      state.exp001.mouse.x = newX;
      state.exp001.mouse.y = newY;
      state.exp001.mouse.active = true;

      if (state.exp001.mouse.isDown) {
        triggerInteractionUI(newX, newY, 'DRAGGING // FORCE WARP', 'drag');
      } else {
        triggerInteractionUI(newX, newY, 'TRACKING // POINTER ACTIVE', 'active');
      }

      // Add to ribbon trail if mouse is dragging
      if (state.exp001.mouse.isDown) {
        state.exp001.trails.push({
          x: newX,
          y: newY,
          vx: state.exp001.mouse.vx * 0.2,
          vy: state.exp001.mouse.vy * 0.2,
          life: 1.0,
          decay: 0.02
        });
        if (state.exp001.trails.length > 50) state.exp001.trails.shift();
      }
    }

    container.addEventListener('mousemove', (e) => {
      handlePointerMove(e.clientX, e.clientY);
    });

    container.addEventListener('mousedown', (e) => {
      state.exp001.mouse.isDown = true;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      createRipple(x, y);
      burstNodes(x, y);
      triggerInteractionUI(x, y, 'BURST // DISPERSION WAVE', 'burst');
    });

    window.addEventListener('mouseup', () => {
      if (state.exp001.mouse.isDown) {
        state.exp001.mouse.isDown = false;
        triggerInteractionUI(state.exp001.mouse.x, state.exp001.mouse.y, 'TRACKING // POINTER ACTIVE', 'active');
      }
    });

    container.addEventListener('mouseleave', () => {
      state.exp001.mouse.active = false;
      state.exp001.mouse.isDown = false;
      state.exp001.mouse.x = -1000;
      state.exp001.mouse.y = -1000;
      state.exp001.mouse.vx = 0;
      state.exp001.mouse.vy = 0;
      const coords = document.getElementById('labsTelemetryCoords');
      if (coords) coords.textContent = 'X: --- | Y: ---';
      const badge = document.getElementById('labsTelemetryInteraction');
      if (badge) {
        badge.className = 'labs-hud-status';
        badge.textContent = 'READY // OPERATIONAL';
      }
      const velEl = document.getElementById('labsTelemetryVelocity');
      if (velEl) velEl.textContent = '0.0 px/f';
    });

    // Touch events for mobile
    container.addEventListener('touchstart', (e) => {
      if (!e.touches || !e.touches[0]) return;
      state.exp001.mouse.isDown = true;
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      handlePointerMove(touch.clientX, touch.clientY);
      createRipple(x, y);
      burstNodes(x, y);
      triggerInteractionUI(x, y, 'TOUCH // RADIAL BURST', 'burst');
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (!e.touches || !e.touches[0]) return;
      const touch = e.touches[0];
      handlePointerMove(touch.clientX, touch.clientY);
      triggerInteractionUI(state.exp001.mouse.x, state.exp001.mouse.y, 'TOUCH // KINETIC DRAG', 'drag');
    }, { passive: true });

    container.addEventListener('touchend', () => {
      state.exp001.mouse.isDown = false;
      setTimeout(() => {
        state.exp001.mouse.active = false;
        const coords = document.getElementById('labsTelemetryCoords');
        if (coords) coords.textContent = 'X: --- | Y: ---';
        const badge = document.getElementById('labsTelemetryInteraction');
        if (badge) {
          badge.className = 'labs-hud-status';
          badge.textContent = 'READY // OPERATIONAL';
        }
        const velEl = document.getElementById('labsTelemetryVelocity');
        if (velEl) velEl.textContent = '0.0 px/f';
      }, 700);
    });

    // Setup mode buttons
    setupExp001Controls();

    // IntersectionObserver to avoid background CPU usage
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        state.exp001.isVisible = entry.isIntersecting;
        if (state.exp001.isVisible && !state.exp001.animId) {
          state.exp001.lastTime = performance.now();
          renderExp001();
        }
      });
    }, { threshold: 0.05 });

    observer.observe(container);

    // Initial populate
    populateNodes();
  }

  function resizeExp001() {
    const canvas = state.exp001.canvas;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    state.exp001.width = rect.width;
    state.exp001.height = rect.height;
    state.exp001.dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(state.exp001.width * state.exp001.dpr);
    canvas.height = Math.floor(state.exp001.height * state.exp001.dpr);

    state.exp001.ctx.scale(state.exp001.dpr, state.exp001.dpr);
    populateNodes();
  }

  function populateNodes() {
    const w = state.exp001.width;
    const h = state.exp001.height;
    if (w === 0 || h === 0) return;

    // Node count scales dynamically with screen width
    let count = 110;
    if (w < 600) count = 42;
    else if (w < 900) count = 75;

    state.exp001.nodes = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = Math.random() * (Math.min(w, h) * 0.42);
      const baseX = w / 2 + Math.cos(angle) * radius;
      const baseY = h / 2 + Math.sin(angle) * radius;

      state.exp001.nodes.push({
        x: baseX,
        y: baseY,
        baseX: baseX,
        baseY: baseY,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2 + 1.2,
        phase: Math.random() * Math.PI * 2,
        freq: 0.001 + Math.random() * 0.002,
        energy: 0,
        type: Math.random() > 0.8 ? 'data' : 'node'
      });
    }

    const nodeCountEl = document.getElementById('labsTelemetryNodes');
    if (nodeCountEl) nodeCountEl.textContent = count.toString();
  }

  function createRipple(x, y) {
    state.exp001.ripples.push({
      x,
      y,
      radius: 4,
      maxRadius: Math.min(state.exp001.width, state.exp001.height) * 0.55,
      alpha: 0.9,
      speed: 7
    });
  }

  function burstNodes(x, y) {
    const nodes = state.exp001.nodes;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const dx = n.x - x;
      const dy = n.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 260 && dist > 0) {
        const force = (1 - dist / 260) * 16;
        n.vx += (dx / dist) * force;
        n.vy += (dy / dist) * force;
        n.energy = 1.0;
      }
    }
  }

  function triggerInteractionUI(x, y, label, type) {
    const badge = document.getElementById('labsTelemetryInteraction');
    const coords = document.getElementById('labsTelemetryCoords');
    const velEl = document.getElementById('labsTelemetryVelocity');
    if (badge) {
      badge.textContent = label || 'TRACKING // POINTER ACTIVE';
      badge.className = 'labs-hud-status ' + (type || 'active');
      clearTimeout(state.exp001.interactionTimer);
      state.exp001.interactionTimer = setTimeout(() => {
        badge.className = 'labs-hud-status';
        badge.textContent = 'READY // OPERATIONAL';
      }, 1400);
    }
    if (coords && x >= 0 && y >= 0) {
      coords.textContent = `X: ${Math.round(x).toString().padStart(3, '0')} | Y: ${Math.round(y).toString().padStart(3, '0')}`;
    }
    if (velEl) {
      const vx = state.exp001.mouse.vx || 0;
      const vy = state.exp001.mouse.vy || 0;
      const speed = Math.sqrt(vx * vx + vy * vy);
      velEl.textContent = `${speed.toFixed(1)} px/f`;
    }
  }

  function setupExp001Controls() {
    const btnKinetic = document.getElementById('labsModeBtnKinetic');
    const btnWave = document.getElementById('labsModeBtnWave');
    const btnMatrix = document.getElementById('labsModeBtnMatrix');
    const btnReset = document.getElementById('labsBtnReset');

    const modeBtns = [btnKinetic, btnWave, btnMatrix];

    function setMode(mode, activeBtn) {
      state.exp001.mode = mode;
      modeBtns.forEach(btn => btn && btn.classList.remove('active'));
      if (activeBtn) activeBtn.classList.add('active');

      const modeLabel = document.getElementById('labsActiveModeLabel');
      if (modeLabel) {
        modeLabel.textContent = mode.toUpperCase() + ' SYSTEM';
      }

      createRipple(state.exp001.width / 2, state.exp001.height / 2);
      triggerInteractionUI(state.exp001.width / 2, state.exp001.height / 2, `MODE // ${mode.toUpperCase()}`, 'active');
    }

    if (btnKinetic) btnKinetic.addEventListener('click', () => setMode('kinetic', btnKinetic));
    if (btnWave) btnWave.addEventListener('click', () => setMode('wave', btnWave));
    if (btnMatrix) btnMatrix.addEventListener('click', () => setMode('matrix', btnMatrix));

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        // Smoothly re-settle all nodes
        state.exp001.nodes.forEach(n => {
          n.x = n.baseX;
          n.y = n.baseY;
          n.vx = 0;
          n.vy = 0;
          n.energy = 0;
        });
        state.exp001.trails = [];
        state.exp001.ripples = [];
        createRipple(state.exp001.width / 2, state.exp001.height / 2);
        triggerInteractionUI(state.exp001.width / 2, state.exp001.height / 2, 'HARMONIC RESET', 'active');
      });
    }
  }

  // ==========================================
  // REAL-TIME HIGH-PRECISION REQUESTANIMATIONFRAME FPS ENGINE
  // ==========================================
  const fpsEngine = {
    rafId: null,
    lastTimestamp: 0,
    samples: [],
    maxSamples: 24, // 24-frame rolling sample window
    lastUiUpdate: 0,
    currentFps: 60.0,
    currentFrameTime: 16.6
  };

  function updateFpsCounter(timestamp) {
    if (!fpsEngine.lastTimestamp) {
      fpsEngine.lastTimestamp = timestamp;
      fpsEngine.rafId = requestAnimationFrame(updateFpsCounter);
      return;
    }

    const delta = timestamp - fpsEngine.lastTimestamp;
    fpsEngine.lastTimestamp = timestamp;

    // Filter out aberrant delta from background tab suspension (> 1s) or zero delta
    if (delta > 0 && delta < 1000) {
      const instantFps = 1000 / delta;
      fpsEngine.samples.push(instantFps);
      if (fpsEngine.samples.length > fpsEngine.maxSamples) {
        fpsEngine.samples.shift();
      }

      // High-precision rolling calculation
      const avgFps = fpsEngine.samples.reduce((a, b) => a + b, 0) / fpsEngine.samples.length;
      fpsEngine.currentFps = avgFps;
      fpsEngine.currentFrameTime = delta;

      // Update HUD at optimal human-readable interval (~80ms, ~12 updates/sec)
      if (timestamp - fpsEngine.lastUiUpdate >= 80) {
        fpsEngine.lastUiUpdate = timestamp;

        const fpsEl = document.getElementById('labsTelemetryFPS');
        const timeEl = document.getElementById('labsTelemetryFrameTime');
        const dotEl = document.getElementById('labsFpsStatusDot');

        if (fpsEl) {
          fpsEl.textContent = avgFps.toFixed(1);
        }
        if (timeEl) {
          timeEl.textContent = `(${delta.toFixed(1)}ms)`;
        }
        if (dotEl) {
          if (avgFps >= 50) {
            dotEl.className = 'labs-hud-dot';
          } else if (avgFps >= 28) {
            dotEl.className = 'labs-hud-dot warning';
          } else {
            dotEl.className = 'labs-hud-dot danger';
          }
        }
      }
    }

    fpsEngine.rafId = requestAnimationFrame(updateFpsCounter);
  }

  function startFpsEngine() {
    if (!fpsEngine.rafId) {
      fpsEngine.lastTimestamp = performance.now();
      fpsEngine.lastUiUpdate = performance.now();
      fpsEngine.samples = [];
      fpsEngine.rafId = requestAnimationFrame(updateFpsCounter);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (fpsEngine.rafId) {
        cancelAnimationFrame(fpsEngine.rafId);
        fpsEngine.rafId = null;
      }
      fpsEngine.lastTimestamp = 0;
    } else {
      startFpsEngine();
    }
  });

  function renderExp001() {
    if (!state.exp001.isVisible) {
      state.exp001.animId = null;
      return;
    }

    const now = performance.now();
    const dt = Math.min((now - state.exp001.lastTime) / 1000, 0.1);
    state.exp001.lastTime = now;

    // Real-time canvas cycle telemetry
    state.exp001.frameCount++;
    if (state.exp001.frameCount % 4 === 0) {
      const cycleEl = document.getElementById('labsTelemetryCycle');
      if (cycleEl) {
        cycleEl.textContent = `#${state.exp001.frameCount.toString().padStart(6, '0')}`;
      }
    }

    // Decay pointer velocity when idle
    if (!state.exp001.mouse.active || Math.abs(state.exp001.mouse.vx) > 0.05 || Math.abs(state.exp001.mouse.vy) > 0.05) {
      state.exp001.mouse.vx *= 0.88;
      state.exp001.mouse.vy *= 0.88;
      if (state.exp001.frameCount % 8 === 0) {
        const velEl = document.getElementById('labsTelemetryVelocity');
        if (velEl) {
          const speed = Math.sqrt(state.exp001.mouse.vx * state.exp001.mouse.vx + state.exp001.mouse.vy * state.exp001.mouse.vy);
          velEl.textContent = `${Math.max(0, speed).toFixed(1)} px/f`;
        }
      }
    }

    const ctx = state.exp001.ctx;
    const w = state.exp001.width;
    const h = state.exp001.height;
    const m = state.exp001.mouse;

    ctx.clearRect(0, 0, w, h);

    // Subtle background grid lines
    drawLabGrid(ctx, w, h);

    if (state.exp001.mode === 'kinetic') {
      renderKineticField(ctx, w, h, m, dt);
    } else if (state.exp001.mode === 'wave') {
      renderSignalWave(ctx, w, h, m, now);
    } else if (state.exp001.mode === 'matrix') {
      renderPixelMatrix(ctx, w, h, m, now);
    }

    // Render interactive ripples & ribbons
    renderRipples(ctx);
    renderTrails(ctx);

    // Crosshair on cursor if active inside canvas
    if (m.active && m.x > 0 && m.x < w && m.y > 0 && m.y < h) {
      drawInteractiveCrosshair(ctx, m.x, m.y);
    }

    state.exp001.animId = requestAnimationFrame(renderExp001);
  }

  function drawLabGrid(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    const step = 48;

    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Corner tick marks
    ctx.strokeStyle = 'rgba(41, 151, 255, 0.4)';
    ctx.lineWidth = 1.5;
    const pad = 16;
    const tickLen = 12;

    // Top Left
    ctx.beginPath();
    ctx.moveTo(pad, pad + tickLen); ctx.lineTo(pad, pad); ctx.lineTo(pad + tickLen, pad);
    ctx.stroke();

    // Top Right
    ctx.beginPath();
    ctx.moveTo(w - pad - tickLen, pad); ctx.lineTo(w - pad, pad); ctx.lineTo(w - pad, pad + tickLen);
    ctx.stroke();

    // Bottom Left
    ctx.beginPath();
    ctx.moveTo(pad, h - pad - tickLen); ctx.lineTo(pad, h - pad); ctx.lineTo(pad + tickLen, h - pad);
    ctx.stroke();

    // Bottom Right
    ctx.beginPath();
    ctx.moveTo(w - pad - tickLen, h - pad); ctx.lineTo(w - pad, h - pad); ctx.lineTo(w - pad, h - pad - tickLen);
    ctx.stroke();

    ctx.restore();
  }

  function renderKineticField(ctx, w, h, m, dt) {
    const nodes = state.exp001.nodes;
    const maxConnectDist = w < 600 ? 75 : 110;
    const isReduced = state.exp001.reducedMotion;

    // Update nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];

      if (!isReduced) {
        // Natural harmonic oscillation
        n.phase += n.freq;
        const driftX = Math.cos(n.phase) * 0.35;
        const driftY = Math.sin(n.phase * 0.8) * 0.35;

        // Mouse magnetic repulsion / vortex
        if (m.active) {
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influenceRadius = 180;

          if (dist < influenceRadius && dist > 0) {
            const force = (1 - dist / influenceRadius) * 4.2;
            n.vx += (dx / dist) * force;
            n.vy += (dy / dist) * force;

            // Swirl tangent force
            n.vx += (-dy / dist) * force * 0.6;
            n.vy += (dx / dist) * force * 0.6;
            n.energy = Math.min(n.energy + 0.08, 1);
          }
        }

        // Apply friction & spring back to home
        n.vx *= 0.92;
        n.vy *= 0.92;
        n.vx += (n.baseX - n.x) * 0.02;
        n.vy += (n.baseY - n.y) * 0.02;

        n.x += n.vx + driftX;
        n.y += n.vy + driftY;

        // Energy decay
        n.energy *= 0.96;
      }
    }

    // Draw filaments between near nodes
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const n1 = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const n2 = nodes[j];
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxConnectDist) {
          const alpha = (1 - dist / maxConnectDist) * 0.35;
          const energetic = Math.max(n1.energy, n2.energy);
          if (energetic > 0.2) {
            ctx.strokeStyle = `rgba(100, 210, 255, ${alpha * (1 + energetic * 0.8)})`;
          } else {
            ctx.strokeStyle = `rgba(41, 151, 255, ${alpha})`;
          }
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const glow = n.energy;

      // Outer glow when energized
      if (glow > 0.1) {
        ctx.fillStyle = `rgba(41, 151, 255, ${glow * 0.35})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = glow > 0.2 ? '#64d2ff' : '#ffffff';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.size + glow * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Data label tag on specialized nodes
      if (n.type === 'data') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '9px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.fillText(`P${i}`, n.x + 6, n.y - 4);
      }
    }
  }

  function renderSignalWave(ctx, w, h, m, now) {
    const t = now * 0.0018;
    const waveCount = 5;
    const centerY = h / 2;

    ctx.lineWidth = 1.5;

    for (let i = 0; i < waveCount; i++) {
      const offset = (i / waveCount) * Math.PI;
      const freq = 0.008 + i * 0.003;
      const baseAmp = 35 + i * 18;

      ctx.beginPath();
      const alpha = 0.25 + (i / waveCount) * 0.55;
      ctx.strokeStyle = i === 2 ? LUMINOUS_BLUE : `rgba(41, 151, 255, ${alpha})`;

      for (let x = 0; x <= w; x += 6) {
        let mouseDisplace = 0;
        if (m.active) {
          const dx = x - m.x;
          const dist = Math.abs(dx);
          if (dist < 180) {
            mouseDisplace = (1 - dist / 180) * 50 * Math.sin(t * 4 + dx * 0.05);
          }
        }

        const y = centerY + Math.sin(x * freq + t + offset) * baseAmp +
          Math.cos(x * 0.015 - t * 0.7) * (baseAmp * 0.4) + mouseDisplace;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  function renderPixelMatrix(ctx, w, h, m, now) {
    const step = 28;
    const t = now * 0.001;

    for (let x = step; x < w; x += step) {
      for (let y = step; y < h; y += step) {
        let size = 1.5;
        let alpha = 0.22;
        let px = x;
        let py = y;

        if (m.active) {
          const dx = x - m.x;
          const dy = y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const factor = 1 - dist / 150;
            // Lens distortion outward
            px += (dx / dist) * factor * 14;
            py += (dy / dist) * factor * 14;
            size = 1.5 + factor * 3.5;
            alpha = 0.35 + factor * 0.65;
          }
        }

        ctx.fillStyle = alpha > 0.5 ? LUMINOUS_BLUE : `rgba(255, 255, 255, ${alpha})`;
        ctx.fillRect(px - size / 2, py - size / 2, size, size);
      }
    }
  }

  function renderRipples(ctx) {
    const ripples = state.exp001.ripples;
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.radius += r.speed;
      r.alpha *= 0.94;

      ctx.save();
      ctx.strokeStyle = `rgba(100, 210, 255, ${r.alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (r.alpha < 0.02 || r.radius > r.maxRadius) {
        ripples.splice(i, 1);
      }
    }
  }

  function renderTrails(ctx) {
    const trails = state.exp001.trails;
    if (trails.length < 2) return;

    ctx.save();
    for (let i = 1; i < trails.length; i++) {
      const p1 = trails[i - 1];
      const p2 = trails[i];
      p1.life -= p1.decay;

      if (p1.life > 0) {
        ctx.strokeStyle = `rgba(41, 151, 255, ${p1.life * 0.7})`;
        ctx.lineWidth = p1.life * 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }

    // Clean dead points
    while (trails.length > 0 && trails[0].life <= 0) {
      trails.shift();
    }
    ctx.restore();
  }

  function drawInteractiveCrosshair(ctx, x, y) {
    ctx.save();
    ctx.strokeStyle = 'rgba(100, 210, 255, 0.45)';
    ctx.lineWidth = 1;
    const len = 14;

    ctx.beginPath();
    ctx.moveTo(x - len, y); ctx.lineTo(x + len, y);
    ctx.moveTo(x, y - len); ctx.lineTo(x, y + len);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(41, 151, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================
  // 2. SCROLL-DRIVEN CREATIVE PROCESS VISUALIZER
  // Stages: 01 IDEA -> 02 BUILD -> 03 TEST -> 04 REFINE -> 05 RELEASE
  // ==========================================

  function initProcessVisualizer() {
    const canvas = document.getElementById('labsProcessCanvas');
    if (!canvas) return;

    state.process.canvas = canvas;
    state.process.ctx = canvas.getContext('2d', { alpha: true });

    resizeProcess();
    window.addEventListener('resize', debounce(resizeProcess, 150));

    // Connect Stage Stepper buttons & Scroll Observer
    setupProcessStageListeners();

    // IntersectionObserver to only animate when in view
    const container = canvas.parentElement || canvas;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        state.process.isVisible = entry.isIntersecting;
        if (state.process.isVisible && !state.process.animId) {
          renderProcess();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(container);
  }

  function resizeProcess() {
    const canvas = state.process.canvas;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    state.process.width = rect.width;
    state.process.height = rect.height;
    state.process.dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(state.process.width * state.process.dpr);
    canvas.height = Math.floor(state.process.height * state.process.dpr);
    state.process.ctx.scale(state.process.dpr, state.process.dpr);
  }

  function setProcessStage(stageNum) {
    if (stageNum < 1 || stageNum > 5) return;
    state.process.targetStage = stageNum;
    state.process.currentStage = stageNum;

    // Update UI Stage indicators
    const stageItems = document.querySelectorAll('.labs-process-item');
    stageItems.forEach((item, idx) => {
      if (idx + 1 === stageNum) {
        item.classList.add('active');
        item.setAttribute('aria-current', 'step');
      } else {
        item.classList.remove('active');
        item.removeAttribute('aria-current');
      }
    });

    const progressEl = document.getElementById('labsTelemetryProgress');
    const stageNumEl = document.getElementById('labsTelemetryStage');
    if (progressEl) progressEl.textContent = `${stageNum * 20}%`;
    if (stageNumEl) stageNumEl.textContent = `0${stageNum} / 05`;

    // Trigger visual morph ripple
    state.process.morphProgress = 0;
  }

  function setupProcessStageListeners() {
    const stageItems = document.querySelectorAll('.labs-process-item');
    stageItems.forEach((item, idx) => {
      const stage = idx + 1;
      item.addEventListener('click', () => {
        setProcessStage(stage);
      });
    });

    // Scroll-driven spy: detect which stage card is nearest viewport center
    const stageCards = document.querySelectorAll('.labs-stage-card');
    if (stageCards.length > 0) {
      window.addEventListener('scroll', debounce(() => {
        const viewLabs = document.getElementById('view-labs');
        if (!viewLabs || !viewLabs.classList.contains('active')) return;

        const viewportCenter = window.innerHeight / 2;
        let closestStage = state.process.currentStage;
        let minDiff = Infinity;

        stageCards.forEach((card, idx) => {
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.top + rect.height / 2;
          const diff = Math.abs(cardCenter - viewportCenter);

          if (diff < minDiff && rect.top < window.innerHeight && rect.bottom > 0) {
            minDiff = diff;
            closestStage = idx + 1;
          }
        });

        if (closestStage !== state.process.currentStage) {
          setProcessStage(closestStage);
        }
      }, 50), { passive: true });
    }
  }

  function renderProcess() {
    if (!state.process.isVisible) {
      state.process.animId = null;
      return;
    }

    state.process.time += 0.02;
    if (state.process.morphProgress < 1) {
      state.process.morphProgress += 0.04;
    }

    const ctx = state.process.ctx;
    const w = state.process.width;
    const h = state.process.height;
    const t = state.process.time;
    const stage = state.process.currentStage;

    ctx.clearRect(0, 0, w, h);

    // Subtle background circular aperture
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.42, 0, Math.PI * 2);
    ctx.stroke();

    // Stage specific visualizations
    switch (stage) {
      case 1:
        // STAGE 01: IDEA (A small point of light appears in void)
        renderStageIdea(ctx, w, h, t);
        break;
      case 2:
        // STAGE 02: BUILD (The point begins forming structures & wireframes)
        renderStageBuild(ctx, w, h, t);
        break;
      case 3:
        // STAGE 03: TEST (Structure becomes interactive, reacts dynamically)
        renderStageTest(ctx, w, h, t);
        break;
      case 4:
        // STAGE 04: REFINE (The visual becomes cleaner, sharper, mathematically aligned)
        renderStageRefine(ctx, w, h, t);
        break;
      case 5:
        // STAGE 05: RELEASE (The final form becomes a polished digital composition)
        renderStageRelease(ctx, w, h, t);
        break;
    }

    ctx.restore();

    state.process.animId = requestAnimationFrame(renderProcess);
  }

  function renderStageIdea(ctx, w, h, t) {
    const cx = w / 2;
    const cy = h / 2;

    // Concentric breathing ripples
    for (let i = 1; i <= 3; i++) {
      const radius = (Math.sin(t * 1.5 + i) * 0.5 + 0.5) * 60 + i * 28;
      const alpha = (1 - radius / 160) * 0.25;
      ctx.strokeStyle = `rgba(41, 151, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Focal luminous point
    const corePulse = Math.sin(t * 3) * 2 + 5;
    ctx.fillStyle = 'rgba(41, 151, 255, 0.35)';
    ctx.beginPath();
    ctx.arc(cx, cy, corePulse * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, corePulse, 0, Math.PI * 2);
    ctx.fill();

    // Subtitle annotation
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '10px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('INCEPTION // SINGLE LIGHT SOURCE', cx, cy + 90);
  }

  function renderStageBuild(ctx, w, h, t) {
    const cx = w / 2;
    const cy = h / 2;
    const size = Math.min(w, h) * 0.28;

    ctx.strokeStyle = 'rgba(41, 151, 255, 0.6)';
    ctx.lineWidth = 1.5;

    // Structural wireframe cube / polygon rotating
    const numPoints = 6;
    const points = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2 + t * 0.5;
      const x = cx + Math.cos(angle) * size;
      const y = cy + Math.sin(angle) * size;
      points.push({ x, y });
    }

    // Connect perimeter & internal lattice
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
      // Connect to center
      ctx.moveTo(cx, cy);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.stroke();

    // Draw vertex joints
    points.forEach((p, idx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(100, 210, 255, 0.6)';
      ctx.font = '8px ui-monospace, monospace';
      ctx.fillText(`V${idx}`, p.x + 6, p.y - 4);
    });

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '10px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('STRUCTURE // WIREFRAME SCAFFOLDING', cx, cy + size + 40);
  }

  function renderStageTest(ctx, w, h, t) {
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.28;

    // Kinetic stress wave distorting boundary
    ctx.beginPath();
    ctx.strokeStyle = '#64d2ff';
    ctx.lineWidth = 2;

    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const distortion = Math.sin(angle * 6 + t * 4) * 14 + Math.cos(angle * 3 - t * 2) * 8;
      const r = radius + distortion;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Frequency vectors
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + t;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * (radius * 1.2), cy + Math.sin(angle) * (radius * 1.2));
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '10px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('STRESS TEST // DYNAMIC OSCILLATION', cx, cy + radius + 40);
  }

  function renderStageRefine(ctx, w, h, t) {
    const cx = w / 2;
    const cy = h / 2;
    const size = Math.min(w, h) * 0.25;

    // Golden ratio disciplined grid & concentric circles
    ctx.strokeStyle = 'rgba(41, 151, 255, 0.7)';
    ctx.lineWidth = 1.5;

    // Precise bounding boxes
    ctx.strokeRect(cx - size, cy - size, size * 2, size * 2);
    ctx.strokeRect(cx - size * 0.618, cy - size * 0.618, size * 1.236, size * 1.236);

    // Diagonal axis guides
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(cx - size * 1.2, cy - size * 1.2);
    ctx.lineTo(cx + size * 1.2, cy + size * 1.2);
    ctx.moveTo(cx + size * 1.2, cy - size * 1.2);
    ctx.lineTo(cx - size * 1.2, cy + size * 1.2);
    ctx.stroke();

    // Center focal aperture
    ctx.fillStyle = LUMINOUS_BLUE;
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '10px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PRECISION // GOLDEN RATIO HARMONY', cx, cy + size + 40);
  }

  function renderStageRelease(ctx, w, h, t) {
    const cx = w / 2;
    const cy = h / 2;
    const size = Math.min(w, h) * 0.26;

    // Polished luminous badge
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, size * 1.4);
    grad.addColorStop(0, 'rgba(41, 151, 255, 0.35)');
    grad.addColorStop(0.6, 'rgba(5, 47, 85, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Precision outer ring
    ctx.strokeStyle = '#30d158';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, size, 0, Math.PI * 2);
    ctx.stroke();

    // Inner diamond & checkmark
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy);
    ctx.lineTo(cx - 4, cy + 10);
    ctx.lineTo(cx + 16, cy - 10);
    ctx.stroke();

    ctx.fillStyle = '#30d158';
    ctx.font = '11px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PRODUCTION READY // VERIFIED CRAFT', cx, cy + size + 40);
  }

  // ==========================================
  // 3. LIVE LAB TELEMETRY BAR & CLOCK
  // ==========================================

  function initLiveTelemetryClock() {
    const clockEl = document.getElementById('labsTelemetryClock');
    if (!clockEl) return;

    function updateClock() {
      // Lusaka is UTC+2 (Central Africa Time)
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const lusakaTime = new Date(utc + (3600000 * 2));

      const h = String(lusakaTime.getHours()).padStart(2, '0');
      const m = String(lusakaTime.getMinutes()).padStart(2, '0');
      const s = String(lusakaTime.getSeconds()).padStart(2, '0');

      clockEl.textContent = `${h}:${m}:${s} CAT`;
    }

    updateClock();
    setInterval(updateClock, 1000);
  }

  // Utility Debounce
  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // ==========================================
  // INITIALIZATION ON DOM READY
  // ==========================================
  function bootLabsEngine() {
    startFpsEngine();
    initExperiment001();
    initProcessVisualizer();
    initLiveTelemetryClock();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootLabsEngine);
  } else {
    bootLabsEngine();
  }

  // Export to global for modal/tab resets
  window.VigorishLabsEngine = {
    setProcessStage,
    startFpsEngine,
    getFps: () => fpsEngine.currentFps,
    resizeAll: () => {
      resizeExp001();
      resizeProcess();
    }
  };
})();
