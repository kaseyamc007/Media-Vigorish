#!/usr/bin/env python3
"""
Script to inject Interactive Service Console, Creative Playground, Final CTA, and JS logic into index.html
"""

import re

SERVICE_CONSOLE_HTML = '''
        <!-- Interactive Service Console -->
        <div class="reveal-on-scroll" style="margin-top: 56px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div class="apple-section-eyebrow">Interactive Capability Console</div>
            <h3 style="font-size: clamp(26px, 3.2vw, 38px); font-weight: 700; color: #fff; letter-spacing: -0.02em;">Inspect Studio Services</h3>
            <p style="font-size: 15.5px; color: #86868b; max-width: 580px; margin: 8px auto 0;">Switch through our core capabilities to inspect deliverables, production timelines, and strategic advantages in real time.</p>
          </div>

          <div class="service-console-container">
            <div class="service-tabs-nav" id="serviceConsoleTabs">
              <button class="service-tab-btn active" onclick="selectConsoleService(0)">Social Media Management</button>
              <button class="service-tab-btn" onclick="selectConsoleService(1)">4K Videography &amp; Photography</button>
              <button class="service-tab-btn" onclick="selectConsoleService(2)">Branding &amp; Identity</button>
              <button class="service-tab-btn" onclick="selectConsoleService(3)">Web Design &amp; Architecture</button>
              <button class="service-tab-btn" onclick="selectConsoleService(4)">Graphic Design &amp; Print</button>
              <button class="service-tab-btn" onclick="selectConsoleService(5)">Digital Marketing &amp; Ads</button>
            </div>

            <div class="service-console-content" id="serviceConsoleBody">
              <!-- Dynamically populated by JS -->
            </div>
          </div>
        </div>
'''

PLAYGROUND_HTML = '''
    <!-- CREATIVE PLAYGROUND / R&D LABS (Dedicated View & Home Showcase) -->
    <section id="view-playground" class="view-page">
      <div class="apple-section-dark ambient-glow-bg">
        <div class="apple-container">
          <div class="apple-section-header">
            <div class="apple-section-eyebrow">STUDIO LABS &amp; R&amp;D</div>
            <h1 class="studio-display-title">Creative Playground.</h1>
            <p class="studio-lead-text">
              Real-time experiments in kinetic typography, cinema color grading, procedural sound design, and 3D physical interactions developed inside the <strong class="brand-name-bold">Vigorish Media</strong> studio.
            </p>
          </div>

          <!-- 4 Interactive Experiments -->
          <div class="playground-grid">
            
            <!-- Exp 1: Kinetic Typography Reactor -->
            <div class="playground-card">
              <span class="playground-badge">Experiment 01 // Typography</span>
              <h3 style="font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 6px;">Kinetic Brand Reactor</h3>
              <p style="font-size: 13.5px; color: #86868b; line-height: 1.5;">Test fluid typographic scales, optical tracking, variable weight, and kinetic shear in real time.</p>

              <div class="kinetic-stage">
                <div id="kineticOutput" class="kinetic-output">VIGORISH MEDIA</div>
              </div>

              <div class="playground-control-row">
                <div class="playground-control-label">
                  <span>Input Headline</span>
                </div>
                <input type="text" id="kineticTextInput" value="VIGORISH MEDIA" oninput="updateKineticTypography()" style="background: #141418; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; padding: 8px 12px; font-size: 13px; outline: none;" />
              </div>

              <div class="playground-control-row">
                <div class="playground-control-label">
                  <span>Font Weight</span>
                  <span id="fontWeightVal">800</span>
                </div>
                <input type="range" class="playground-slider" id="fontWeightSlider" min="200" max="900" step="50" value="800" oninput="updateKineticTypography()" />
              </div>

              <div class="playground-control-row">
                <div class="playground-control-label">
                  <span>Letter Tracking</span>
                  <span id="letterSpacingVal">-0.03em</span>
                </div>
                <input type="range" class="playground-slider" id="letterSpacingSlider" min="-0.08" max="0.35" step="0.01" value="-0.03" oninput="updateKineticTypography()" />
              </div>

              <div class="playground-control-row">
                <div class="playground-control-label">
                  <span>Kinetic Shear (Skew)</span>
                  <span id="skewVal">0°</span>
                </div>
                <input type="range" class="playground-slider" id="skewSlider" min="-18" max="18" step="1" value="0" oninput="updateKineticTypography()" />
              </div>

              <div style="display: flex; gap: 8px; margin-top: 8px;">
                <button class="service-tab-btn" style="padding: 4px 10px; font-size: 11px;" onclick="applyTypoPreset('apple')">Apple Minimal</button>
                <button class="service-tab-btn" style="padding: 4px 10px; font-size: 11px;" onclick="applyTypoPreset('cinema')">4K Cinema</button>
                <button class="service-tab-btn" style="padding: 4px 10px; font-size: 11px;" onclick="applyTypoPreset('brutal')">Brutalist</button>
              </div>
            </div>

            <!-- Exp 2: 4K Cinema LUT Matrix (Split Screen Slider) -->
            <div class="playground-card">
              <span class="playground-badge">Experiment 02 // Color Science</span>
              <h3 style="font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 6px;">4K Cinema LUT Matrix</h3>
              <p style="font-size: 13.5px; color: #86868b; line-height: 1.5;">Drag the comparison divider to examine RAW flat cinema capture versus studio color-graded mastery.</p>

              <div class="lut-split-container" id="lutSplitContainer" onmousemove="handleLutDrag(event)" ontouchmove="handleLutTouch(event)">
                <img class="lut-img-raw" src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80" alt="RAW Log Cinema" />
                <div class="lut-graded-wrapper" id="lutGradedWrapper">
                  <img class="lut-img-graded" id="lutGradedImg" src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80" alt="Graded Cinema" />
                </div>
                <div class="lut-slider-handle" id="lutSliderHandle">&#8644;</div>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 12px; color: #86868b; margin-bottom: 12px;">
                <span>&#9664; Studio Graded</span>
                <span>RAW Cinema Log &#9654;</span>
              </div>

              <div class="playground-control-label" style="margin-bottom: 6px;">
                <span>Active LUT Color Profile:</span>
                <span id="activeLutName" style="color: var(--apple-blue); font-weight: 700;">Obsidian Noir</span>
              </div>

              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="service-tab-btn active" id="lutBtn0" style="padding: 4px 10px; font-size: 11px;" onclick="applyLutProfile('noir', 0)">Obsidian Noir</button>
                <button class="service-tab-btn" id="lutBtn1" style="padding: 4px 10px; font-size: 11px;" onclick="applyLutProfile('sunset', 1)">Zambezi Warmth</button>
                <button class="service-tab-btn" id="lutBtn2" style="padding: 4px 10px; font-size: 11px;" onclick="applyLutProfile('gold', 2)">Cine Gold 800</button>
                <button class="service-tab-btn" id="lutBtn3" style="padding: 4px 10px; font-size: 11px;" onclick="applyLutProfile('highkey', 3)">Clean Editorial</button>
              </div>
            </div>

            <!-- Exp 3: Sound Design Synthesizer Pads -->
            <div class="playground-card">
              <span class="playground-badge">Experiment 03 // Sound Architecture</span>
              <h3 style="font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 6px;">Studio Haptic Synthesizer</h3>
              <p style="font-size: 13.5px; color: #86868b; line-height: 1.5;">Tap the trigger pads to audition real-time synthesized acoustic UI cues and cinema sonic signatures.</p>

              <div class="sound-pads-grid">
                <button class="sound-pad-btn" onclick="playStudioSound('sub', this)">
                  <span style="font-size: 18px;">🔊</span>
                  <span class="sound-pad-label">Sub Drop</span>
                  <span class="sound-pad-type">Cinema 808</span>
                </button>
                <button class="sound-pad-btn" onclick="playStudioSound('shutter', this)">
                  <span style="font-size: 18px;">📷</span>
                  <span class="sound-pad-label">FX Shutter</span>
                  <span class="sound-pad-type">Sony Cinema</span>
                </button>
                <button class="sound-pad-btn" onclick="playStudioSound('pop', this)">
                  <span style="font-size: 18px;">✨</span>
                  <span class="sound-pad-label">Haptic Pop</span>
                  <span class="sound-pad-type">UI Feedback</span>
                </button>
                <button class="sound-pad-btn" onclick="playStudioSound('whoosh', this)">
                  <span style="font-size: 18px;">💨</span>
                  <span class="sound-pad-label">Cinema Whoosh</span>
                  <span class="sound-pad-type">Transition</span>
                </button>
                <button class="sound-pad-btn" onclick="playStudioSound('drone', this)">
                  <span style="font-size: 18px;">⚡</span>
                  <span class="sound-pad-label">Analog Pulse</span>
                  <span class="sound-pad-type">Warm Resonant</span>
                </button>
                <button class="sound-pad-btn" onclick="playStudioSound('vinyl', this)">
                  <span style="font-size: 18px;">📻</span>
                  <span class="sound-pad-label">Studio Tone</span>
                  <span class="sound-pad-type">440Hz Sine</span>
                </button>
              </div>

              <div style="font-size: 11.5px; color: #86868b; line-height: 1.4; background: rgba(255,255,255,0.03); padding: 10px 14px; border-radius: 8px;">
                Synthesized dynamically in real-time via Web Audio API oscillators and biquad filters. Zero audio load latency.
              </div>
            </div>

            <!-- Exp 4: 3D Holographic Studio Pass -->
            <div class="playground-card">
              <span class="playground-badge">Experiment 04 // 3D Physics</span>
              <h3 style="font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 6px;">Interactive Studio Pass</h3>
              <p style="font-size: 13.5px; color: #86868b; line-height: 1.5;">Move your cursor over the card to inspect dynamic perspective tilt, metallic specular reflection, and cryptographic authenticity.</p>

              <div class="pass-3d-wrapper" onmousemove="handlePassTilt(event)" onmouseleave="resetPassTilt()" ontouchmove="handlePassTouch(event)">
                <div id="passCard3D" class="pass-card-3d">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <img src="src/logo/logo.png" alt="Vigorish Media" style="height: 18px; width: auto;" onerror="this.src='public/logo.png';" />
                      <span style="font-size: 10px; letter-spacing: 0.12em; font-weight: 700; color: var(--apple-blue);">ALL-ACCESS</span>
                    </div>
                    <span style="font-size: 10px; color: #86868b; font-family: monospace;">№ VM-2026-LUS</span>
                  </div>

                  <div style="margin-bottom: 20px;">
                    <div style="font-size: 16px; font-weight: 700; letter-spacing: -0.01em;">Enterprise Client Tier</div>
                    <div style="font-size: 11px; color: #86868b;">Lusaka Studio // 15.3875° S, 28.3228° E</div>
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div>
                      <div style="font-size: 9px; text-transform: uppercase; color: #86868b;">Craft Verified</div>
                      <div style="font-size: 12px; font-weight: 600; color: #34d399;">Production Ready</div>
                    </div>
                    <button class="btn-apple-pill" style="font-size: 10px; padding: 4px 10px;" onclick="flipStudioPass()">Flip Card ↺</button>
                  </div>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span id="passAngleReadout" style="font-size: 11px; color: #86868b; font-family: monospace;">Tilt: 0.0° X | 0.0° Y</span>
                <span style="font-size: 11px; color: var(--apple-blue);">Interactive Gyroscope Active</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
'''

FINAL_CTA_HTML = '''
  <!-- Apple Cinematic Final CTA: "Have an idea? Let’s make it real." -->
  <section class="apple-final-cta-section reveal-on-scroll">
    <div class="apple-container">
      <div class="apple-final-cta-eyebrow">COLLABORATE WITH VIGORISH MEDIA</div>
      <h2 class="apple-final-cta-headline">Have an idea? Let’s make it real.</h2>
      <p class="apple-final-cta-desc">
        From bold brand identities and viral social management to high-octane 4K cinema and high-performance web systems — <strong class="brand-name-bold" style="color: #fff;">Vigorish Media</strong> engineers the structural creative advantage your enterprise deserves.
      </p>
      <div class="apple-final-cta-actions">
        <a href="#/contact" class="btn-apple-pill" style="font-size: 16px; padding: 14px 34px;" onclick="navigateTo('/contact'); return false;">Start Your Project</a>
        <a href="https://wa.me/260979894567" target="_blank" rel="noopener" class="btn-apple-secondary" style="font-size: 15px; padding: 14px 28px;">Direct WhatsApp: +260 97 989 4567</a>
        <a href="mailto:mediavigorish@gmail.com" class="apple-link-cta" style="font-size: 15px; color: #2997ff;">Email Studio Direct &gt;</a>
      </div>
    </div>
  </section>
'''

JS_LOGIC = '''
    // =====================================
    // Mobile Drawer Toggle
    // =====================================
    function toggleMobileMenu() {
      const drawer = document.getElementById('mobileDrawer');
      const btn = document.getElementById('appleMobileMenuBtn');
      if (!drawer || !btn) return;
      const isOpen = drawer.classList.contains('open');
      if (isOpen) {
        drawer.classList.remove('open');
        btn.classList.remove('active');
        document.body.style.overflow = '';
      } else {
        drawer.classList.add('open');
        btn.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }
    function closeMobileMenu() {
      const drawer = document.getElementById('mobileDrawer');
      const btn = document.getElementById('appleMobileMenuBtn');
      if (drawer) drawer.classList.remove('open');
      if (btn) btn.classList.remove('active');
      document.body.style.overflow = '';
    }

    // =====================================
    // Scroll Reveal Observer
    // =====================================
    function initScrollReveals() {
      const reveals = document.querySelectorAll('.reveal-on-scroll');
      if (!('IntersectionObserver' in window)) {
        reveals.forEach(el => el.classList.add('revealed'));
        return;
      }
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      }, { threshold: 0.12 });
      reveals.forEach(el => observer.observe(el));
    }

    // =====================================
    // Interactive Service Console Logic
    // =====================================
    const consoleServices = [
      {
        title: 'Social Media Management',
        category: 'GROWTH & COMMUNITY',
        desc: 'Comprehensive social media operations driving organic reach, brand prestige, and active buyer engagement across Facebook, Instagram, and TikTok.',
        deliverables: [
          '16–24 high-retention graphic & short-video assets monthly',
          'Viral-optimized Reel & TikTok storytelling scripts',
          'Active daily audience engagement & response management',
          'Bi-weekly conversion reports & audience demographic insights'
        ],
        timeline: '72hr Initial Onboarding // Continuous Monthly Retainer',
        advantage: 'Builds top-of-mind brand authority so clients choose you before competitors.',
        image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80',
        serviceId: 'Social Media Management'
      },
      {
        title: 'Videography & Photography',
        category: '4K CINEMA PRODUCTION',
        desc: 'Cinema-grade storytelling captured on high-dynamic-range cinema cameras and colored in DaVinci Resolve for broadcast, social, and commercial use.',
        deliverables: [
          'Full-scale 4K commercial productions & corporate documentaries',
          'Pacing-synchronized 9:16 vertical reels for social ads',
          'High-resolution commercial product & executive portraiture',
          'Licensed cinematic sound design & professional color grading'
        ],
        timeline: 'Production: 1–3 shoot days // Post-Production: 5–7 business days',
        advantage: 'Transforms abstract brand value into stunning, visceral visual proof.',
        image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
        serviceId: '4K Videography'
      },
      {
        title: 'Branding & Corporate Identity',
        category: 'BRAND ARCHITECTURE',
        desc: 'Complete corporate visual systems engineered to elevate perceived value, command premium pricing, and project undeniable corporate trust.',
        deliverables: [
          'Primary, secondary, and badge logo variations in full vector suites',
          'Enterprise brand guidelines covering color theory and typography rules',
          'Complete corporate stationery (cards, letterheads, invoice templates)',
          'High-impact company profile presentation and investor pitch deck'
        ],
        timeline: '10–14 business days from kickoff discovery to delivery',
        advantage: 'Gives your business the visual stature of a market-leading enterprise.',
        image: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=800&auto=format&fit=crop&q=80',
        serviceId: 'Brand Identity & Systems'
      },
      {
        title: 'Website Design & Management',
        category: 'DIGITAL ARCHITECTURE',
        desc: 'Lightning-fast, mobile-responsive web platforms engineered for conversion, prestige, and seamless client action. Includes 1-year complimentary hosting.',
        deliverables: [
          'Custom responsive UI/UX architecture optimized for all mobile screens',
          'Direct WhatsApp lead channeling and interactive quote estimators',
          'Search engine optimization (SEO) tuned for Zambian & global search',
          'Complimentary 1-year high-speed managed cloud hosting & domain registration'
        ],
        timeline: '12–18 business days for full architecture, testing, and deployment',
        advantage: 'Turns web visitors into booked consultations and verified inquiries 24/7.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
        serviceId: 'Website Design & Solutions'
      },
      {
        title: 'Graphic Design & Print Collateral',
        category: 'PRINT & EDITORIAL',
        desc: 'Tactile, high-impact printed collateral designed to leave an unforgettable impression in boardrooms, trade expos, and point-of-sale environments.',
        deliverables: [
          'Investor prospectuses, annual corporate reports, and company profiles',
          'Trade exhibition pull-up banners, media backdrops, and event collateral',
          'Product packaging labels, boxes, and retail merchandise graphics',
          '300DPI press-ready CMYK files with strict color separation accuracy'
        ],
        timeline: '3–5 business days per asset batch',
        advantage: 'Delivers physical credibility that digital-only competitors cannot match.',
        image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&auto=format&fit=crop&q=80',
        serviceId: 'Graphic Design & Print'
      },
      {
        title: 'Digital Marketing & Paid Advertising',
        category: 'PERFORMANCE ACQUISITION',
        desc: 'Precision targeted client acquisition campaigns across Meta and Google that deliver measurable inquiries, phone calls, and sales pipeline.',
        deliverables: [
          'Custom demographic and interest targeting mapped to Zambia and Southern Africa',
          'Iterative A/B split-testing of creative ad copy and visual headlines',
          'Retargeting funnels to re-engage past website visitors and profile followers',
          'Bi-weekly conversion reports detailing cost per lead and ROAS'
        ],
        timeline: 'Continuous weekly optimization cycles with bi-weekly reporting',
        advantage: 'Predictably feeds your sales team qualified inquiries month after month.',
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
        serviceId: 'Digital Marketing & Paid Ads'
      }
    ];

    let currentConsoleServiceIdx = 0;

    function selectConsoleService(idx) {
      currentConsoleServiceIdx = idx;
      const tabs = document.querySelectorAll('#serviceConsoleTabs .service-tab-btn');
      tabs.forEach((tab, i) => {
        if (i === idx) tab.classList.add('active');
        else tab.classList.remove('active');
      });

      const s = consoleServices[idx];
      const body = document.getElementById('serviceConsoleBody');
      if (!body) return;

      body.innerHTML = `
        <div>
          <div style="font-size: 11px; font-weight: 700; color: var(--apple-blue); letter-spacing: 0.08em; text-transform: uppercase;">${s.category}</div>
          <h3 style="font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em; margin: 6px 0 12px;">${s.title}</h3>
          <p style="font-size: 15px; color: #a1a1a6; line-height: 1.6; margin-bottom: 20px;">${s.desc}</p>
          
          <div style="font-size: 13px; font-weight: 700; color: #f5f5f7; margin-bottom: 8px;">Studio Deliverables:</div>
          <ul class="service-deliverables-list">
            ${s.deliverables.map(d => `<li><span class="service-check-icon">✓</span> <span>${d}</span></li>`).join('')}
          </ul>

          <div style="background: rgba(255,255,255,0.04); border-radius: 10px; padding: 12px 16px; margin-bottom: 24px;">
            <div style="font-size: 12px; color: #86868b; margin-bottom: 3px;">Production Timeline: <strong style="color: #fff;">${s.timeline}</strong></div>
            <div style="font-size: 12px; color: #86868b;">Strategic Advantage: <span style="color: #34d399;">${s.advantage}</span></div>
          </div>

          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <a href="#/contact" class="btn-apple-pill" onclick="preselectServiceBrief('${s.serviceId}'); navigateTo('/contact'); return false;">Select for Project Brief &gt;</a>
            <a href="https://wa.me/260979894567?text=Hi%20Vigorish%20Media,%20I%20would%20like%20to%20inquire%20about%20${encodeURIComponent(s.title)}" target="_blank" rel="noopener" class="btn-apple-secondary">WhatsApp Studio Direct</a>
          </div>
        </div>
        <div class="service-preview-frame">
          <img src="${s.image}" alt="${s.title}" />
          <div style="position: absolute; bottom: 14px; left: 16px; background: rgba(0,0,0,0.75); backdrop-filter: blur(10px); padding: 4px 12px; border-radius: var(--apple-pill-radius); font-size: 11px; font-weight: 600; color: #fff;">
            ${s.title}
          </div>
        </div>
      `;
    }

    function preselectServiceBrief(serviceName) {
      setTimeout(() => {
        const select = document.getElementById('contactServiceSelect');
        if (select) {
          for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].value.includes(serviceName) || select.options[i].text.includes(serviceName)) {
              select.selectedIndex = i;
              break;
            }
          }
        }
      }, 100);
    }

    // =====================================
    // Creative Playground Interactive Experiments
    // =====================================
    // 1. Kinetic Typography
    function updateKineticTypography() {
      const text = document.getElementById('kineticTextInput')?.value || 'VIGORISH MEDIA';
      const weight = document.getElementById('fontWeightSlider')?.value || '800';
      const tracking = document.getElementById('letterSpacingSlider')?.value || '-0.03';
      const skew = document.getElementById('skewSlider')?.value || '0';

      const output = document.getElementById('kineticOutput');
      if (output) {
        output.textContent = text;
        output.style.fontWeight = weight;
        output.style.letterSpacing = tracking + 'em';
        output.style.transform = `skewX(${skew}deg)`;
      }

      const weightVal = document.getElementById('fontWeightVal');
      if (weightVal) weightVal.textContent = weight;
      const trackVal = document.getElementById('letterSpacingVal');
      if (trackVal) trackVal.textContent = tracking + 'em';
      const skewVal = document.getElementById('skewVal');
      if (skewVal) skewVal.textContent = skew + '°';
    }

    function applyTypoPreset(preset) {
      const weight = document.getElementById('fontWeightSlider');
      const tracking = document.getElementById('letterSpacingSlider');
      const skew = document.getElementById('skewSlider');
      if (!weight || !tracking || !skew) return;

      if (preset === 'apple') {
        weight.value = '600';
        tracking.value = '-0.02';
        skew.value = '0';
      } else if (preset === 'cinema') {
        weight.value = '800';
        tracking.value = '0.14';
        skew.value = '-4';
      } else if (preset === 'brutal') {
        weight.value = '900';
        tracking.value = '-0.06';
        skew.value = '12';
      }
      updateKineticTypography();
    }

    // 2. 4K Cinema LUT Split Slider
    function handleLutDrag(e) {
      const container = document.getElementById('lutSplitContainer');
      const wrapper = document.getElementById('lutGradedWrapper');
      const handle = document.getElementById('lutSliderHandle');
      if (!container || !wrapper || !handle) return;

      const rect = container.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const pct = (x / rect.width) * 100;

      wrapper.style.width = pct + '%';
      handle.style.left = pct + '%';
    }

    function handleLutTouch(e) {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleLutDrag({ clientX: touch.clientX });
      }
    }

    const lutProfiles = {
      noir: { name: 'Obsidian Noir', filter: 'contrast(125%) saturate(110%) brightness(95%)' },
      sunset: { name: 'Zambezi Warmth', filter: 'sepia(30%) saturate(160%) contrast(110%)' },
      gold: { name: 'Cine Gold 800', filter: 'hue-rotate(-15deg) contrast(120%) saturate(145%)' },
      highkey: { name: 'Clean Editorial', filter: 'grayscale(100%) contrast(140%) brightness(105%)' }
    };

    function applyLutProfile(key, btnIdx) {
      const p = lutProfiles[key];
      if (!p) return;
      const img = document.getElementById('lutGradedImg');
      if (img) img.style.filter = p.filter;
      const label = document.getElementById('activeLutName');
      if (label) label.textContent = p.name;

      for (let i = 0; i < 4; i++) {
        const btn = document.getElementById('lutBtn' + i);
        if (btn) {
          if (i === btnIdx) btn.classList.add('active');
          else btn.classList.remove('active');
        }
      }
    }

    // 3. Web Audio Synthesizer Pads
    let studioAudioCtx = null;
    function getStudioAudioContext() {
      if (!studioAudioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) studioAudioCtx = new AudioCtx();
      }
      if (studioAudioCtx && studioAudioCtx.state === 'suspended') {
        studioAudioCtx.resume();
      }
      return studioAudioCtx;
    }

    function playStudioSound(type, btnEl) {
      const ctx = getStudioAudioContext();
      if (!ctx) return;

      if (btnEl) {
        btnEl.classList.add('playing');
        setTimeout(() => btnEl.classList.remove('playing'), 250);
      }

      const now = ctx.currentTime;

      if (type === 'sub') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.35);
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.42);
      } else if (type === 'shutter') {
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2400;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      } else if (type === 'pop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'whoosh') {
        const bufferSize = ctx.sampleRate * 0.35;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(3200, now + 0.18);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.35);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      } else if (type === 'drone') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.65);
      } else if (type === 'vinyl') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      }
    }

    // 4. 3D Studio Pass Gyroscope Physics
    let passIsFlipped = false;
    function handlePassTilt(e) {
      const card = document.getElementById('passCard3D');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotX = -(y / (rect.height / 2)) * 14;
      const rotY = (x / (rect.width / 2)) * 18;

      card.style.transform = `rotateX(${rotX.toFixed(1)}deg) rotateY(${(passIsFlipped ? 180 + rotY : rotY).toFixed(1)}deg)`;

      const readout = document.getElementById('passAngleReadout');
      if (readout) readout.textContent = `Tilt: ${rotX.toFixed(1)}° X | ${rotY.toFixed(1)}° Y`;
    }

    function handlePassTouch(e) {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handlePassTilt({ clientX: touch.clientX, clientY: touch.clientY });
      }
    }

    function resetPassTilt() {
      const card = document.getElementById('passCard3D');
      if (!card) return;
      card.style.transform = passIsFlipped ? 'rotateY(180deg)' : 'rotateX(0deg) rotateY(0deg)';
      const readout = document.getElementById('passAngleReadout');
      if (readout) readout.textContent = 'Tilt: 0.0° X | 0.0° Y';
    }

    function flipStudioPass() {
      passIsFlipped = !passIsFlipped;
      const card = document.getElementById('passCard3D');
      if (!card) return;
      card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform = passIsFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
      setTimeout(() => {
        card.style.transition = 'transform 0.1s ease';
      }, 600);
    }
'''

def run_injection():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Insert Interactive Service Console into Home View right below the bento grid
    if 'Interactive Capability Console' not in html:
        # locate the end of apple-bento-grid section
        pattern = r'(<div class="apple-bento-grid">[\s\S]*?</div>\s*</div>\s*</div>)'
        # Let's see: we can insert right after the bento grid container
        bento_marker = '<!-- End Bento Grid -->'
        if '<!-- End of Bento Grid -->' in html:
            html = html.replace('<!-- End of Bento Grid -->', SERVICE_CONSOLE_HTML)
        else:
            # Look for the section closing after bento grid
            target = '<!-- Apple Creative Principles Strip -->'
            if target in html:
                html = html.replace(target, SERVICE_CONSOLE_HTML + '\n\n' + target)

    # 2. Also insert Creative Playground view into main#appContent
    if 'id="view-playground"' not in html:
        # insert before view-pricing or view-about
        target = '<section id="view-pricing"'
        if target in html:
            html = html.replace(target, PLAYGROUND_HTML + '\n\n    ' + target)

    # 3. Add Final CTA right before the footer
    if 'apple-final-cta-section' not in html:
        html = html.replace('<!-- Apple Multi-Column Footer -->', FINAL_CTA_HTML + '\n\n  <!-- Apple Multi-Column Footer -->')

    # 4. Inject JS logic
    if 'selectConsoleService' not in html:
        # inject inside <script> before </script>
        html = html.replace('</script>', JS_LOGIC + '\n\n  </script>')

    # 5. In navigateTo router function, handle /playground route
    if "'/playground': 'view-playground'" not in html:
        html = html.replace(
            "'/services': 'view-services',",
            "'/services': 'view-services',\n        '/playground': 'view-playground',"
        )

    # 6. Initialize Console and reveals in window.onload or DOMContentLoaded
    init_code = '''
      // Initialize Console & Scroll Reveals
      selectConsoleService(0);
      initScrollReveals();
      updateKineticTypography();
'''
    if 'initScrollReveals()' not in html:
        html = html.replace("window.addEventListener('DOMContentLoaded', () => {", "window.addEventListener('DOMContentLoaded', () => {\n" + init_code)

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)

    print("Successfully injected Service Console, Playground, Final CTA, and JS logic into index.html")

if __name__ == '__main__':
    run_injection()
