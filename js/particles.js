/**
 * Vigorish Media — Digital Media Particle System
 * 
 * Concept: Creative Digital Media Studio (Adobe Creative Cloud + Apple Minimalism + Cinematic Motion Graphics)
 * Metaphor: Digital information, pixels, motion graphics, video frames, camera crosshairs, and connectivity
 * Palette: Strict brand system — Pure White, Soft Grey, Blue-White, and Brand Blue #052F55
 * 
 * Features:
 * - Multi-layered depth (Background, Midground, Foreground 3D parallax)
 * - Digital media archetypes (Luminous nodes, pixels, camera crosshairs, data dots, horizontal cinema streaks)
 * - Inertial mouse deflection & subtle cursor light field (Desktop)
 * - Fluid scroll velocity & layer-based parallax settling
 * - Section-aware intelligence (Social networks, Marketing data streams, Branding grids, Cinema motion)
 * - Battery & CPU friendly: paused when tab is hidden, auto-throttled on mobile, zero-CPU on reduced-motion
 */
(function() {
  'use strict';

  // ==========================================
  // CONFIGURATION & CONSTANTS
  // ==========================================
  const CONFIG = {
    canvasId: 'vmParticleCanvas',
    primaryBrandBlue: '#052F55', // RGB: 5, 47, 85
    accentCyan: '#2997ff',       // RGB: 41, 151, 255
    // Responsive Particle Density Limits
    counts: {
      desktop: 62,
      tablet: 36,
      mobile: 20
    },
    // Particle Archetype Distribution
    archetypes: {
      POINT: 0,        // Luminous digital media nodes
      PIXEL: 1,        // Crisp digital square pixels
      CROSSHAIR: 2,    // Camera autofocus / layout alignment crosshairs (+)
      DATA_DOT: 3,     // Directional metric dots / micro brackets
      CINEMA_STREAK: 4 // Horizontal 24fps motion light streaks
    },
    // Layer Specifications (Depth / 3D Parallax)
    layers: [
      { id: 'bg',  z: 0.3,  sizeScale: 0.7, alphaScale: 0.45, speedScale: 0.4, parallax: 0.05 },
      { id: 'mid', z: 0.65, sizeScale: 1.0, alphaScale: 0.75, speedScale: 0.7, parallax: 0.15 },
      { id: 'fg',  z: 1.0,  sizeScale: 1.25, alphaScale: 1.0,  speedScale: 1.0, parallax: 0.28 }
    ],
    // Mouse Interaction
    mouse: {
      radius: 135,
      force: 0.032,
      lightRadius: 160
    },
    // Proximity Network Lines
    connection: {
      baseDistance: 82,
      socialDistance: 118,
      maxLinesPerNode: 3
    },
    // Click Ripple
    ripple: {
      maxRadius: 155,
      speed: 2.4,
      decay: 0.012
    }
  };

  // State Management
  let canvas = null;
  let ctx = null;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let ripples = [];
  let animId = null;
  let isRunning = false;

  // Mouse & Scroll State
  const mouse = {
    x: -9999,
    y: -9999,
    targetX: -9999,
    targetY: -9999,
    active: false,
    down: false
  };

  let lastScrollY = window.scrollY || window.pageYOffset || 0;
  let scrollVelocity = 0;
  let dampedScrollVelocity = 0;

  // Section Mode State: 'general' | 'social' | 'marketing' | 'branding' | 'cinema'
  let currentSectionMode = 'general';
  let sectionBlendFactor = 0; // 0 (general) to 1 (specialized)

  // Guard: Reduced Motion
  const prefersReducedMotion = () => {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  // Guard: Touch Device
  const isTouchDevice = () => {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (window.matchMedia && !window.matchMedia('(pointer: fine)').matches)
    );
  };

  // ==========================================
  // PARTICLE CONSTRUCTOR & PROTOTYPE
  // ==========================================
  function Particle(w, h, layerIndex) {
    this.layerIndex = layerIndex;
    this.layer = CONFIG.layers[layerIndex];
    this.reset(w, h, true);
  }

  Particle.prototype.reset = function(w, h, initialPlacement) {
    this.x = Math.random() * w;
    this.y = initialPlacement ? Math.random() * h : (Math.random() < 0.5 ? -15 : h + 15);

    // Determine Archetype
    const rand = Math.random();
    if (rand < 0.42) {
      this.type = CONFIG.archetypes.POINT;
    } else if (rand < 0.68) {
      this.type = CONFIG.archetypes.PIXEL;
    } else if (rand < 0.84) {
      this.type = CONFIG.archetypes.CROSSHAIR;
    } else if (rand < 0.94) {
      this.type = CONFIG.archetypes.DATA_DOT;
    } else {
      this.type = CONFIG.archetypes.CINEMA_STREAK;
    }

    // Base Velocities (Subtle drift)
    const baseSpeed = 0.28 * this.layer.speedScale;
    this.vx = (Math.random() - 0.5) * baseSpeed;
    this.vy = (Math.random() - 0.5) * baseSpeed;
    this.baseVx = this.vx;
    this.baseVy = this.vy;

    // Dimensions
    this.size = (1.2 + Math.random() * 1.5) * this.layer.sizeScale;
    if (this.type === CONFIG.archetypes.CINEMA_STREAK) {
      this.streakLength = (16 + Math.random() * 24) * this.layer.sizeScale;
      this.vx = (0.2 + Math.random() * 0.3) * this.layer.speedScale; // Gently drifts horizontally
    }

    // Color Palette Selection (Strict Vigorous Media Palette)
    const colorRoll = Math.random();
    if (colorRoll < 0.35) {
      // Soft Studio Grey / Silver
      this.r = 210; this.g = 218; this.b = 228;
      this.baseAlpha = 0.32 * this.layer.alphaScale;
    } else if (colorRoll < 0.65) {
      // Clean Pure White / Blue-White Highlight
      this.r = 245; this.g = 250; this.b = 255;
      this.baseAlpha = 0.45 * this.layer.alphaScale;
    } else if (colorRoll < 0.85) {
      // Primary Brand Blue #052F55
      this.r = 5; this.g = 47; this.b = 85;
      this.baseAlpha = 0.58 * this.layer.alphaScale;
    } else {
      // Studio Cyan Luminescence #2997ff
      this.r = 41; this.g = 151; this.b = 255;
      this.baseAlpha = 0.42 * this.layer.alphaScale;
    }

    this.alpha = this.baseAlpha;
    this.pulseSpeed = 0.012 + Math.random() * 0.02;
    this.pulsePhase = Math.random() * Math.PI * 2;
  };

  Particle.prototype.update = function(w, h, scrollDelta) {
    this.pulsePhase += this.pulseSpeed;

    // 1. Gentle breathing opacity
    const breathing = Math.sin(this.pulsePhase) * 0.12;
    let targetAlpha = Math.max(0.06, this.baseAlpha + breathing);

    // 2. Section-Aware Modifiers
    let sectionVx = 0;
    let sectionVy = 0;
    if (currentSectionMode === 'marketing') {
      // Upward analytics data stream
      sectionVy = -0.12 * sectionBlendFactor * this.layer.speedScale;
    } else if (currentSectionMode === 'cinema' && this.type === CONFIG.archetypes.CINEMA_STREAK) {
      // Enhanced horizontal glide for cinema streaks
      sectionVx = 0.18 * sectionBlendFactor * this.layer.speedScale;
    }

    // 3. Inertial Mouse Deflection (Desktop only)
    if (mouse.active && this.layerIndex > 0) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONFIG.mouse.radius && dist > 0) {
        const proximity = 1 - (dist / CONFIG.mouse.radius);
        const force = proximity * CONFIG.mouse.force * (this.layerIndex === 2 ? 1.4 : 0.8);
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;

        // Subtle brightening near cursor
        targetAlpha = Math.min(0.9, targetAlpha + (proximity * 0.35));
      }
    }

    // 4. Click Ripple Reaction
    for (let i = 0; i < ripples.length; i++) {
      const r = ripples[i];
      const rdx = this.x - r.x;
      const rdy = this.y - r.y;
      const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
      const diff = Math.abs(rdist - r.currentRadius);

      if (diff < 28 && rdist > 0) {
        const pushForce = (1 - diff / 28) * 0.22 * r.alpha * this.layer.speedScale;
        this.vx += (rdx / rdist) * pushForce;
        this.vy += (rdy / rdist) * pushForce;
        targetAlpha = Math.min(1.0, targetAlpha + (0.25 * r.alpha));
      }
    }

    // 5. Scroll Parallax Shift
    this.y -= scrollDelta * this.layer.parallax;

    // 6. Smooth Velocity Damping toward resting drift
    this.vx += (this.baseVx + sectionVx - this.vx) * 0.025;
    this.vy += (this.baseVy + sectionVy - this.vy) * 0.025;

    this.x += this.vx;
    this.y += this.vy;
    this.alpha = targetAlpha;

    // 7. Screen Wrap with generous padding
    const pad = 40;
    if (this.x < -pad) this.x = w + pad;
    if (this.x > w + pad) this.x = -pad;
    if (this.y < -pad) this.y = h + pad;
    if (this.y > h + pad) this.y = -pad;
  };

  Particle.prototype.draw = function(context) {
    const a = Math.max(0.02, Math.min(1.0, this.alpha));
    context.save();

    switch (this.type) {
      case CONFIG.archetypes.POINT: {
        // Luminous digital media circular node
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${a.toFixed(3)})`;
        context.fill();
        break;
      }

      case CONFIG.archetypes.PIXEL: {
        // Crisp raster/graphic design square pixel
        const s = this.size * 1.6;
        context.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${a.toFixed(3)})`;
        context.fillRect(this.x - s / 2, this.y - s / 2, s, s);
        break;
      }

      case CONFIG.archetypes.CROSSHAIR: {
        // Precision camera autofocus / studio composition crosshair (+)
        const arm = this.size * 2.2;
        context.strokeStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${(a * 0.85).toFixed(3)})`;
        context.lineWidth = 0.65;
        context.beginPath();
        context.moveTo(this.x - arm, this.y);
        context.lineTo(this.x + arm, this.y);
        context.moveTo(this.x, this.y - arm);
        context.lineTo(this.x, this.y + arm);
        context.stroke();
        break;
      }

      case CONFIG.archetypes.DATA_DOT: {
        // Paired micro data dots representing analytics / metric feeds
        const spacing = this.size * 2.2;
        const subSize = Math.max(0.8, this.size * 0.75);
        context.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${a.toFixed(3)})`;
        context.beginPath();
        context.arc(this.x - spacing / 2, this.y, subSize, 0, Math.PI * 2);
        context.arc(this.x + spacing / 2, this.y, subSize, 0, Math.PI * 2);
        context.fill();
        break;
      }

      case CONFIG.archetypes.CINEMA_STREAK: {
        // Anamorphic horizontal video frame light streak
        const len = this.streakLength || 24;
        const grad = context.createLinearGradient(this.x - len / 2, this.y, this.x + len / 2, this.y);
        grad.addColorStop(0, `rgba(${this.r}, ${this.g}, ${this.b}, 0)`);
        grad.addColorStop(0.5, `rgba(${this.r}, ${this.g}, ${this.b}, ${(a * 0.9).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${this.r}, ${this.g}, ${this.b}, 0)`);

        context.strokeStyle = grad;
        context.lineWidth = 0.85;
        context.beginPath();
        context.moveTo(this.x - len / 2, this.y);
        context.lineTo(this.x + len / 2, this.y);
        context.stroke();
        break;
      }
    }

    context.restore();
  };

  // ==========================================
  // INITIALIZATION & RESIZE
  // ==========================================
  function initCanvas() {
    canvas = document.getElementById(CONFIG.canvasId);
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = CONFIG.canvasId;
      canvas.className = 'vm-particle-canvas';
      document.body.insertBefore(canvas, document.body.firstChild);
    }
    ctx = canvas.getContext('2d', { alpha: true });
    resize();
  }

  function resize() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    populateParticles();
  }

  function populateParticles() {
    let totalCount = CONFIG.counts.desktop;
    if (width < 768) {
      totalCount = CONFIG.counts.mobile;
    } else if (width < 1024) {
      totalCount = CONFIG.counts.tablet;
    }

    particles = [];
    // Distribute across layers: 35% bg, 40% mid, 25% fg
    const bgCount = Math.floor(totalCount * 0.35);
    const midCount = Math.floor(totalCount * 0.40);
    const fgCount = totalCount - bgCount - midCount;

    for (let i = 0; i < bgCount; i++) particles.push(new Particle(width, height, 0));
    for (let i = 0; i < midCount; i++) particles.push(new Particle(width, height, 1));
    for (let i = 0; i < fgCount; i++) particles.push(new Particle(width, height, 2));
  }

  function addRipple(x, y) {
    if (ripples.length >= 4) ripples.shift();
    ripples.push({
      x: x,
      y: y,
      currentRadius: 4,
      maxRadius: CONFIG.ripple.maxRadius,
      alpha: 0.36
    });
  }

  // ==========================================
  // SECTION INTELLIGENCE DETECTION
  // ==========================================
  function detectActiveSection() {
    try {
      const hash = (window.location.hash || '').replace('#', '');
      if (hash.includes('social')) {
        currentSectionMode = 'social';
        sectionBlendFactor = 1;
        return;
      }
      if (hash.includes('pricing') || hash.includes('packages') || hash.includes('labs')) {
        currentSectionMode = 'marketing';
        sectionBlendFactor = 1;
        return;
      }
      if (hash.includes('portfolio') || hash.includes('about')) {
        currentSectionMode = 'cinema';
        sectionBlendFactor = 1;
        return;
      }

      // Viewport scroll inspect for heading context
      const headings = document.querySelectorAll('h2, h3, .apple-section-eyebrow, .apple-bento-eyebrow');
      const midY = window.innerHeight * 0.45;
      let matchedMode = 'general';

      for (let i = 0; i < headings.length; i++) {
        const rect = headings[i].getBoundingClientRect();
        if (rect.top <= midY && rect.bottom >= 0) {
          const text = (headings[i].textContent || '').toLowerCase();
          if (text.includes('social') || text.includes('community')) {
            matchedMode = 'social';
            break;
          } else if (text.includes('marketing') || text.includes('growth') || text.includes('package') || text.includes('quote')) {
            matchedMode = 'marketing';
            break;
          } else if (text.includes('cinematography') || text.includes('video') || text.includes('production') || text.includes('film')) {
            matchedMode = 'cinema';
            break;
          } else if (text.includes('brand') || text.includes('identity') || text.includes('design')) {
            matchedMode = 'branding';
            break;
          }
        }
      }

      currentSectionMode = matchedMode;
      sectionBlendFactor = (matchedMode === 'general') ? 0 : 0.85;
    } catch (e) {
      currentSectionMode = 'general';
      sectionBlendFactor = 0;
    }
  }

  // ==========================================
  // ANIMATION LOOP & RENDERING
  // ==========================================
  function render() {
    if (!isRunning || !ctx) return;

    // Smooth inertial mouse tracking
    if (mouse.active) {
      mouse.x += (mouse.targetX - mouse.x) * 0.14;
      mouse.y += (mouse.targetY - mouse.y) * 0.14;
    }

    // Smooth scroll velocity damping
    dampedScrollVelocity += (scrollVelocity - dampedScrollVelocity) * 0.18;
    scrollVelocity *= 0.92; // Decay active velocity impulse
    if (Math.abs(scrollVelocity) < 0.01) scrollVelocity = 0;

    ctx.clearRect(0, 0, width, height);

    // 1. Subtle, Restrained Cursor Light Field (Desktop only)
    if (mouse.active && !isTouchDevice()) {
      const grad = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, CONFIG.mouse.lightRadius
      );
      grad.addColorStop(0, 'rgba(41, 151, 255, 0.045)');
      grad.addColorStop(0.35, 'rgba(5, 47, 85, 0.03)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, CONFIG.mouse.lightRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Render and Update Click Ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.currentRadius += CONFIG.ripple.speed;
      r.alpha -= CONFIG.ripple.decay;

      if (r.alpha <= 0 || r.currentRadius >= r.maxRadius) {
        ripples.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.currentRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(5, 47, 85, ${r.alpha.toFixed(3)})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Delicate secondary inner wave
      if (r.currentRadius > 24) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.currentRadius * 0.68, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(41, 151, 255, ${(r.alpha * 0.45).toFixed(3)})`;
        ctx.lineWidth = 0.75;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Proximity Digital Constellation Lines
    // Active when near mouse or in Social Media / Community section
    const connDist = currentSectionMode === 'social' 
      ? CONFIG.connection.socialDistance 
      : CONFIG.connection.baseDistance;

    const pCount = particles.length;
    for (let i = 0; i < pCount; i++) {
      const p1 = particles[i];
      if (p1.layerIndex === 0) continue; // Keep background layer clean

      let connections = 0;
      for (let j = i + 1; j < pCount; j++) {
        if (connections >= CONFIG.connection.maxLinesPerNode) break;

        const p2 = particles[j];
        if (p2.layerIndex === 0) continue;

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connDist) {
          // Check if lines should appear: cursor proximity OR active social mode
          let showLine = false;
          let lineAlphaFactor = 1;

          if (currentSectionMode === 'social') {
            showLine = true;
            lineAlphaFactor = 1.3;
          } else if (mouse.active) {
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            const mouseDist = Math.sqrt((midX - mouse.x) ** 2 + (midY - mouse.y) ** 2);
            if (mouseDist < CONFIG.mouse.radius * 1.1) {
              showLine = true;
              lineAlphaFactor = 1 - (mouseDist / (CONFIG.mouse.radius * 1.1));
            }
          }

          if (showLine) {
            const distRatio = 1 - (dist / connDist);
            const lineAlpha = distRatio * 0.16 * lineAlphaFactor * Math.min(p1.alpha, p2.alpha);

            if (lineAlpha > 0.015) {
              ctx.save();
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(41, 151, 255, ${lineAlpha.toFixed(3)})`;
              ctx.lineWidth = 0.55;
              ctx.stroke();
              ctx.restore();
              connections++;
            }
          }
        }
      }
    }

    // 4. Update and Render Particles
    for (let i = 0; i < pCount; i++) {
      const p = particles[i];
      p.update(width, height, dampedScrollVelocity);
      p.draw(ctx);
    }

    animId = requestAnimationFrame(render);
  }

  // ==========================================
  // LIFECYCLE & EVENT HANDLERS
  // ==========================================
  function start() {
    if (prefersReducedMotion()) {
      // Single static resting frame for accessibility
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
          particles[i].draw(ctx);
        }
      }
      return;
    }

    if (!isRunning) {
      isRunning = true;
      animId = requestAnimationFrame(render);
    }
  }

  function stop() {
    isRunning = false;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  function bindEvents() {
    // Mouse Movement (Desktop)
    window.addEventListener('mousemove', (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      if (!mouse.active) {
        mouse.x = mouse.targetX;
        mouse.y = mouse.targetY;
        mouse.active = true;
      }
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouse.active = false;
    });

    window.addEventListener('mouseenter', (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    });

    // Soft Click Ripple (in brand blue #052F55)
    window.addEventListener('click', (e) => {
      addRipple(e.clientX, e.clientY);
    }, { passive: true });

    // Touch Support for Mobile / Tablet
    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        addRipple(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Page Scroll Tracking (Parallax & Velocity)
    let scrollTimer = null;
    window.addEventListener('scroll', () => {
      const currentY = window.scrollY || window.pageYOffset || 0;
      const delta = currentY - lastScrollY;
      lastScrollY = currentY;

      // Cap delta impulse to avoid jarring jumps on fast flings
      const clampedDelta = Math.max(-45, Math.min(45, delta));
      scrollVelocity += clampedDelta * 0.35;

      // Throttled Section Detection
      if (!scrollTimer) {
        scrollTimer = setTimeout(() => {
          detectActiveSection();
          scrollTimer = null;
        }, 120);
      }
    }, { passive: true });

    // Resize Event with Debounce
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        if (prefersReducedMotion()) {
          start(); // Refresh static frame
        }
      }, 150);
    });

    // Pause when Tab is Hidden / Backgrounded to strictly preserve CPU & Battery
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stop();
      } else {
        lastScrollY = window.scrollY || window.pageYOffset || 0;
        scrollVelocity = 0;
        dampedScrollVelocity = 0;
        start();
      }
    });

    // Watch for Accessibility Preference Changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', () => {
        if (prefersReducedMotion()) {
          stop();
          start();
        } else {
          start();
        }
      });
    }
  }

  // ==========================================
  // INITIAL ENTRY POINT
  // ==========================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initCanvas();
      bindEvents();
      detectActiveSection();
      start();
    });
  } else {
    initCanvas();
    bindEvents();
    detectActiveSection();
    start();
  }

  // Public Bridge for Navigation Page Transitions
  window.vmParticleTriggerTransition = function() {
    if (!prefersReducedMotion()) {
      addRipple(window.innerWidth / 2, window.innerHeight * 0.35);
      detectActiveSection();
    }
  };
})();
