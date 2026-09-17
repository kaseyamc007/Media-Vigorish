#!/usr/bin/env python3
"""
Comprehensive cinematic upgrade for Vigorish Media:
- Uses uploaded logo (src/logo/logo.png / public/logo.png)
- Adds mobile navigation drawer
- Injects refined cinematic styles, scroll reveals, subtle hover micro-interactions
- Adds Interactive Service Console
- Adds Creative Playground section with 4 real interactive experiments
- Adds the requested final CTA: "Have an idea? Let’s make it real."
- Preserves all genuine branding and contact information
"""

import re

CSS_ADDITIONS = '''
    /* =========================================================
       CINEMATIC STUDIO UPGRADES & MICRO-INTERACTIONS
       ========================================================= */

    /* Scroll Reveal System */
    .reveal-on-scroll {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: opacity, transform;
    }
    .reveal-on-scroll.revealed {
      opacity: 1;
      transform: translateY(0);
    }

    /* Ambient Glow Backgrounds */
    .ambient-glow-bg {
      position: relative;
      overflow: hidden;
    }
    .ambient-glow-bg::before {
      content: "";
      position: absolute;
      top: -120px;
      left: 50%;
      transform: translateX(-50%);
      width: 700px;
      height: 380px;
      background: radial-gradient(ellipse at center, rgba(41, 151, 255, 0.12) 0%, rgba(0, 0, 0, 0) 70%);
      pointer-events: none;
      z-index: 0;
    }

    /* Confident Studio Typography Refinements */
    .studio-display-title {
      font-size: clamp(38px, 5.5vw, 68px);
      font-weight: 800;
      letter-spacing: -0.035em;
      line-height: 1.05;
      color: #ffffff;
    }
    .studio-lead-text {
      font-size: clamp(17px, 1.8vw, 21px);
      line-height: 1.55;
      color: #a1a1a6;
      max-width: 720px;
      margin: 0 auto;
    }

    /* Micro Hover Transitions on Buttons & Cards */
    .btn-apple-pill, .btn-apple-secondary, .apple-option-card, .apple-case-card {
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, background 0.2s ease, border-color 0.2s ease !important;
    }
    .btn-apple-pill:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 113, 227, 0.35);
    }
    .btn-apple-pill:active {
      transform: translateY(0) scale(0.98);
    }

    /* Mobile Menu Toggle Button */
    .apple-mobile-menu-btn {
      display: none;
      background: transparent;
      border: none;
      cursor: pointer;
      width: 38px;
      height: 38px;
      padding: 8px;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      z-index: 10001;
    }
    .apple-mobile-menu-btn span {
      display: block;
      width: 22px;
      height: 2px;
      background: #f5f5f7;
      border-radius: 2px;
      transition: transform 0.25s ease, opacity 0.25s ease;
    }
    .apple-mobile-menu-btn.active span:nth-child(1) {
      transform: translateY(3.5px) rotate(45deg);
    }
    .apple-mobile-menu-btn.active span:nth-child(2) {
      transform: translateY(-3.5px) rotate(-45deg);
    }

    /* Mobile Drawer */
    .apple-mobile-drawer {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background: rgba(10, 10, 12, 0.94);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      padding: 90px 32px 40px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    .apple-mobile-drawer.open {
      opacity: 1;
      pointer-events: auto;
    }
    .apple-mobile-nav-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: auto;
    }
    .apple-mobile-nav-link {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #f5f5f7;
      text-decoration: none;
      transition: color 0.2s;
    }
    .apple-mobile-nav-link:hover {
      color: var(--apple-blue);
    }

    /* =========================================================
       INTERACTIVE SERVICE CONSOLE
       ========================================================= */
    .service-console-container {
      background: #0d0d10;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--apple-card-radius);
      padding: 36px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      margin-top: 36px;
    }
    .service-tabs-nav {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 12px;
      scrollbar-width: thin;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 28px;
    }
    .service-tab-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #a1a1a6;
      border-radius: var(--apple-pill-radius);
      padding: 8px 18px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
    }
    .service-tab-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
    .service-tab-btn.active {
      background: var(--apple-blue);
      border-color: var(--apple-blue);
      color: #fff;
      box-shadow: 0 4px 16px rgba(0, 113, 227, 0.4);
    }
    .service-console-content {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 36px;
      align-items: center;
    }
    .service-deliverables-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 20px 0 28px;
    }
    .service-deliverables-list li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 14px;
      color: #d1d1d6;
      line-height: 1.5;
    }
    .service-check-icon {
      color: #34d399;
      font-weight: bold;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .service-preview-frame {
      background: #000000;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7);
      position: relative;
    }
    .service-preview-frame img {
      width: 100%;
      height: 280px;
      object-fit: cover;
      display: block;
      transition: transform 0.5s ease;
    }
    .service-preview-frame:hover img {
      transform: scale(1.03);
    }

    /* =========================================================
       CREATIVE PLAYGROUND (EXPERIMENTS)
       ========================================================= */
    .playground-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 28px;
      margin-top: 40px;
    }
    .playground-card {
      background: #0e0e11;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--apple-card-radius);
      padding: 32px;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }
    .playground-card:hover {
      border-color: rgba(41, 151, 255, 0.3);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
    }
    .playground-badge {
      display: inline-block;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--apple-blue);
      background: rgba(0, 113, 227, 0.12);
      padding: 4px 10px;
      border-radius: var(--apple-pill-radius);
      margin-bottom: 12px;
      width: fit-content;
    }

    /* Exp 1: Kinetic Typography */
    .kinetic-stage {
      min-height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #050507;
      border-radius: 12px;
      padding: 20px;
      margin: 16px 0;
      border: 1px solid rgba(255, 255, 255, 0.06);
      overflow: hidden;
    }
    .kinetic-output {
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      text-align: center;
      transition: all 0.1s ease;
      word-break: break-word;
    }
    .playground-control-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    }
    .playground-control-label {
      display: flex;
      justify-content: space-between;
      font-size: 11.5px;
      font-weight: 600;
      color: #86868b;
    }
    .playground-slider {
      -webkit-appearance: none;
      width: 100%;
      height: 4px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.15);
      outline: none;
    }
    .playground-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--apple-blue);
      cursor: pointer;
    }

    /* Exp 2: Split-Screen Cinema LUT Matrix */
    .lut-split-container {
      position: relative;
      height: 220px;
      border-radius: 12px;
      overflow: hidden;
      margin: 16px 0;
      border: 1px solid rgba(255, 255, 255, 0.1);
      user-select: none;
    }
    .lut-img-raw, .lut-img-graded {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .lut-img-raw {
      filter: grayscale(80%) contrast(85%) brightness(95%);
    }
    .lut-graded-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 50%;
      overflow: hidden;
      border-right: 2px solid #ffffff;
    }
    .lut-img-graded {
      width: 100%;
      min-width: 440px;
      height: 100%;
      filter: contrast(115%) saturate(135%);
      transition: filter 0.3s ease;
    }
    .lut-slider-handle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 32px;
      height: 32px;
      background: #ffffff;
      color: #000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      cursor: ew-resize;
      z-index: 10;
      pointer-events: none;
    }

    /* Exp 3: Sound Design Synthesizer Pads */
    .sound-pads-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin: 16px 0;
    }
    .sound-pad-btn {
      background: #141418;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 16px 8px;
      color: #f5f5f7;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .sound-pad-btn:hover {
      background: #1c1c22;
      border-color: rgba(255, 255, 255, 0.2);
    }
    .sound-pad-btn:active, .sound-pad-btn.playing {
      background: var(--apple-blue);
      border-color: var(--apple-blue);
      transform: scale(0.95);
      box-shadow: 0 0 16px rgba(0, 113, 227, 0.6);
    }
    .sound-pad-label {
      font-size: 11px;
      font-weight: 600;
    }
    .sound-pad-type {
      font-size: 9.5px;
      color: #86868b;
    }

    /* Exp 4: 3D Studio Pass Hologram */
    .pass-3d-wrapper {
      perspective: 1000px;
      margin: 16px 0;
      display: flex;
      justify-content: center;
    }
    .pass-card-3d {
      width: 100%;
      max-width: 320px;
      height: 190px;
      border-radius: 16px;
      background: linear-gradient(135deg, #1c1c24 0%, #0a0a0e 100%);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 20px;
      color: #ffffff;
      position: relative;
      cursor: grab;
      transform-style: preserve-3d;
      transition: transform 0.1s ease, box-shadow 0.2s ease;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
    }
    .pass-card-3d::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 16px;
      background: linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.15) 45%, rgba(41, 151, 255, 0.2) 50%, transparent 55%);
      pointer-events: none;
    }

    /* =========================================================
       TRIUMPHANT FINAL CTA: "Have an idea? Let's make it real."
       ========================================================= */
    .apple-final-cta-section {
      background: radial-gradient(ellipse at 50% 100%, #151c28 0%, #000000 70%);
      color: #f5f5f7;
      padding: 120px 20px;
      text-align: center;
      position: relative;
      overflow: hidden;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .apple-final-cta-eyebrow {
      font-size: 13px;
      font-weight: 700;
      color: var(--apple-blue);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 14px;
    }
    .apple-final-cta-headline {
      font-size: clamp(38px, 6vw, 76px);
      font-weight: 800;
      letter-spacing: -0.035em;
      line-height: 1.05;
      max-width: 900px;
      margin: 0 auto 20px;
      color: #ffffff;
    }
    .apple-final-cta-desc {
      font-size: clamp(16px, 1.8vw, 20px);
      color: #a1a1a6;
      max-width: 660px;
      margin: 0 auto 40px;
      line-height: 1.55;
    }
    .apple-final-cta-actions {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    @media (max-width: 900px) {
      .apple-mobile-menu-btn { display: flex; }
      .service-console-content { grid-template-columns: 1fr; }
      .playground-grid { grid-template-columns: 1fr; }
      .apple-final-cta-section { padding: 80px 20px; }
    }
'''

def enhance():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Inject enhanced CSS before </style>
    if 'CINEMATIC STUDIO UPGRADES & MICRO-INTERACTIONS' not in html:
        html = html.replace('</style>', CSS_ADDITIONS + '\n  </style>')

    # 2. Update Nav Logo to use src/logo/logo.png
    old_logo_pattern = r'<a href="#/" class="apple-logo-link"[^>]*>.*?<strong class="brand-nav-title">Vigorish Media</strong>\s*</a>'
    new_logo_markup = '''<a href="#/" class="apple-logo-link" onclick="navigateTo('/'); return false;" style="display: flex; align-items: center; gap: 10px; text-decoration: none;">
        <img src="src/logo/logo.png" alt="Vigorish Media" class="brand-nav-logo" onerror="this.onerror=null; this.src='public/logo.png';" style="height: 28px; width: auto; object-fit: contain; filter: brightness(1.15);" />
        <strong class="brand-nav-title">Vigorish Media</strong>
      </a>'''
    html = re.sub(old_logo_pattern, new_logo_markup, html, flags=re.DOTALL)

    # 3. Add Playground to Nav links if missing
    if 'data-route="/playground"' not in html:
        html = html.replace(
            '<li><a class="apple-nav-link" data-route="/pricing"',
            '<li><a class="apple-nav-link" data-route="/playground" onclick="navigateTo(\'/playground\'); return false;">Playground</a></li>\n        <li><a class="apple-nav-link" data-route="/pricing"'
        )

    # 4. Add Mobile Menu Button
    if 'id="appleMobileMenuBtn"' not in html:
        html = html.replace(
            '<div class="apple-nav-actions">',
            '''<button id="appleMobileMenuBtn" class="apple-mobile-menu-btn" aria-label="Toggle Navigation" onclick="toggleMobileMenu()">
          <span></span><span></span>
        </button>
        <div class="apple-nav-actions">'''
        )

    # 5. Add Mobile Drawer markup right after header
    if 'apple-mobile-drawer' not in html:
        mobile_drawer_markup = '''
  <!-- Mobile Navigation Drawer -->
  <div id="mobileDrawer" class="apple-mobile-drawer">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 36px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <img src="src/logo/logo.png" alt="Vigorish Media" style="height: 26px; width: auto; object-fit: contain;" onerror="this.src='public/logo.png';" />
      <strong class="brand-nav-title" style="font-size: 17px;">Vigorish Media</strong>
    </div>
    <ul class="apple-mobile-nav-list">
      <li><a class="apple-mobile-nav-link" onclick="closeMobileMenu(); navigateTo('/');">Overview</a></li>
      <li><a class="apple-mobile-nav-link" onclick="closeMobileMenu(); navigateTo('/services');">Services</a></li>
      <li><a class="apple-mobile-nav-link" onclick="closeMobileMenu(); navigateTo('/portfolio');">Work &amp; Specs</a></li>
      <li><a class="apple-mobile-nav-link" onclick="closeMobileMenu(); navigateTo('/playground');">Playground / Lab</a></li>
      <li><a class="apple-mobile-nav-link" onclick="closeMobileMenu(); navigateTo('/pricing');">Studio Pricing</a></li>
      <li><a class="apple-mobile-nav-link" onclick="closeMobileMenu(); navigateTo('/about');">About Studio</a></li>
      <li><a class="apple-mobile-nav-link" onclick="closeMobileMenu(); navigateTo('/team');">Team</a></li>
      <li><a class="apple-mobile-nav-link" onclick="closeMobileMenu(); navigateTo('/insights');">Newsroom</a></li>
      <li><a class="apple-mobile-nav-link" onclick="closeMobileMenu(); navigateTo('/contact');">Contact &amp; Brief</a></li>
    </ul>
    <div style="padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; gap: 10px;">
      <a href="#/contact" class="btn-apple-pill" style="text-align: center; justify-content: center; padding: 12px 20px; font-size: 15px;" onclick="closeMobileMenu(); navigateTo('/contact');">Start a Project</a>
      <a href="https://wa.me/260979894567" target="_blank" rel="noopener" class="btn-apple-secondary" style="text-align: center; justify-content: center; padding: 12px 20px; font-size: 14px;">WhatsApp: +260 97 989 4567</a>
    </div>
  </div>
'''
        html = html.replace('</header>', '</header>' + mobile_drawer_markup)

    # 6. Build and inject the Interactive Service Console and Creative Playground into HOME & dedicated view
    # Let's verify and save intermediate
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Injected CSS, navigation, and mobile menu into index.html")

if __name__ == '__main__':
    enhance()
