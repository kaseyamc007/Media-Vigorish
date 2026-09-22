/**
 * VIGORISH MEDIA — FUTURISTIC AI LIVE CUSTOMER SUPPORT SYSTEM
 * Client-Side Controller & UI Widget
 * Apple-inspired minimalism + futuristic AI concierge
 */

(function () {
  'use strict';

  // State Management
  const isStaticHost = window.location.hostname.includes('github.io') ||
                       window.location.hostname.includes('mediavigorish.com') ||
                       window.location.protocol === 'file:';

  const state = {
    isOpen: false,
    soundEnabled: true,
    conversationId: null,
    customerName: null,
    customerContact: null,
    status: 'AI_ACTIVE', // AI_ACTIVE | HUMAN_REQUESTED | HUMAN_ACTIVE | RESOLVED
    messages: [],
    isTyping: false,
    pollTimer: null,
    audioCtx: null,
    isStaticDeployment: isStaticHost
  };

  // Web Audio Synthesizer for high-tech micro haptics
  function playAudioChime(type) {
    if (!state.soundEnabled) return;
    try {
      if (!state.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) state.audioCtx = new AudioContextClass();
      }
      if (!state.audioCtx) return;
      if (state.audioCtx.state === 'suspended') {
        state.audioCtx.resume();
      }

      const ctx = state.audioCtx;
      const now = ctx.currentTime;

      if (type === 'open') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'send') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'receive') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now); // E5
        osc2.frequency.setValueAtTime(987.77, now + 0.08); // B5
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.08);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.28);
      }
    } catch (e) {
      // Audio autoplay policy catch
    }
  }

  // Restore session from sessionStorage if available
  function restoreLocalSession() {
    try {
      const saved = sessionStorage.getItem('vigorish_ai_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.conversationId && parsed.customerName) {
          state.conversationId = parsed.conversationId;
          state.customerName = parsed.customerName;
          state.customerContact = parsed.customerContact || null;
          state.status = parsed.status || 'AI_ACTIVE';
          state.messages = parsed.messages || [];
        }
      }
    } catch (e) {
      console.warn('[Session Restore Warning]', e);
    }
  }

  function persistLocalSession() {
    try {
      sessionStorage.setItem('vigorish_ai_session', JSON.stringify({
        conversationId: state.conversationId,
        customerName: state.customerName,
        customerContact: state.customerContact,
        status: state.status,
        messages: state.messages
      }));
    } catch (e) {}
  }

  // Build UI Elements
  function injectSupportWidget() {
    if (document.getElementById('aiSupportLauncher')) return;

    // 1. Floating Launcher Button
    const launcher = document.createElement('div');
    launcher.id = 'aiSupportLauncher';
    launcher.className = 'ai-support-launcher';
    launcher.setAttribute('role', 'button');
    launcher.setAttribute('aria-label', 'Open Live AI Support');
    launcher.innerHTML = `
      <div class="ai-launcher-aura"></div>
      <div class="ai-launcher-orb">
        <div class="ai-launcher-orb-ring"></div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a8 8 0 0 0-8 8c0 3.37 2.1 6.25 5.09 7.42L8 22l4.8-2.4c.39.05.79.08 1.2.08a8 8 0 0 0 8-8 8 8 0 0 0-8-8z"/>
          <circle cx="9.5" cy="9.5" r="1.5" fill="currentColor"/>
          <circle cx="14.5" cy="9.5" r="1.5" fill="currentColor"/>
        </svg>
      </div>
      <div class="ai-launcher-text">
        <span class="ai-launcher-title">AI Support</span>
        <span class="ai-launcher-status"><span class="ai-status-dot"></span>Online</span>
      </div>
    `;

    // 2. Chat Window Container
    const chatWindow = document.createElement('div');
    chatWindow.id = 'aiChatWindow';
    chatWindow.className = 'ai-chat-window';
    chatWindow.setAttribute('role', 'dialog');
    chatWindow.setAttribute('aria-label', 'Live Customer Support Assistant');
    chatWindow.innerHTML = `
      <div class="ai-chat-glow"></div>
      
      <!-- Header -->
      <header class="ai-chat-header">
        <div class="ai-header-left">
          <div id="aiAvatarOrb" class="ai-avatar-orb">
            <div class="ai-avatar-ring"></div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8c0 3.37 2.1 6.25 5.09 7.42L8 22l4.8-2.4c.39.05.79.08 1.2.08a8 8 0 0 0 8-8 8 8 0 0 0-8-8z"/>
            </svg>
          </div>
          <div class="ai-header-meta">
            <div class="ai-assistant-name">
              <span>Vigorish AI</span>
              <span class="ai-verified-badge">STUDIO CONCIERGE</span>
            </div>
            <div class="ai-header-status">
              <span class="ai-status-dot"></span>
              <span id="aiStatusText">Live Online Support</span>
            </div>
          </div>
        </div>
        <div class="ai-header-actions">
          <button id="aiSoundToggle" class="ai-action-btn" title="Toggle Sound Haptics" aria-label="Toggle Sound">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          </button>
          <button id="aiResetBtn" class="ai-action-btn" title="Reset / Clear Chat" aria-label="Reset Conversation">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
          </button>
          <button id="aiCloseBtn" class="ai-action-btn" title="Close Live Support" aria-label="Close">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Welcome Gate (Name before chat) -->
      <div id="aiWelcomeGate" class="ai-welcome-gate">
        <div class="ai-gate-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
            <path d="M12 2a8 8 0 0 0-8 8c0 3.37 2.1 6.25 5.09 7.42L8 22l4.8-2.4c.39.05.79.08 1.2.08a8 8 0 0 0 8-8 8 8 0 0 0-8-8z"/>
          </svg>
        </div>
        <h3 class="ai-gate-heading">Before we get started, what should we call you?</h3>
        <p class="ai-gate-subtext">Connect with our live studio intelligence. We’ll personalize your session and notify our team if human assistance is required.</p>
        
        <form id="aiNameForm" class="ai-gate-form">
          <div class="ai-input-group">
            <label class="ai-input-label" for="aiCustomerNameInput">Your Name *</label>
            <input type="text" id="aiCustomerNameInput" class="ai-text-input" placeholder="e.g., Peter Kalumba Chishala" required autocomplete="name" />
          </div>
          <div class="ai-input-group">
            <label class="ai-input-label" for="aiCustomerContactInput">Phone or Email (Optional)</label>
            <input type="text" id="aiCustomerContactInput" class="ai-text-input" placeholder="For priority follow-ups" autocomplete="email" />
          </div>
          <button type="submit" id="aiStartChatBtn" class="ai-btn-primary">
            <span>Start Live Chat</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </form>
        <div class="ai-gate-footnote">🔒 Confidential live session. Encrypted studio concierge.</div>
      </div>

      <!-- Active Chat Body -->
      <div id="aiChatBody" class="ai-chat-body" style="display: none;">
        <!-- Metadata bar -->
        <div class="ai-chat-meta-banner">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span id="aiSessionIdBadge" class="ai-session-id">ID: CHAT-INIT</span>
          </div>
          <div id="aiStatusPill" style="display: flex; align-items: center; gap: 4px;">
            <span class="ai-status-dot"></span>
            <span style="font-size: 11px;">AI Active</span>
          </div>
        </div>

        <!-- Messages Scroll -->
        <div id="aiMessagesContainer" class="ai-messages-scroll">
          <!-- Dynamic messages go here -->
        </div>

        <!-- Suggested Questions -->
        <div id="aiSuggestionsWrap" class="ai-suggestions-wrap">
          <button class="ai-suggestion-chip" data-query="Tell me about Social Media Management packages">📱 Social Media (from K1,200)</button>
          <button class="ai-suggestion-chip" data-query="What creative services do you offer?">Services Overview</button>
          <button class="ai-suggestion-chip" data-query="Do you deliver 4K video productions?">4K Cinema Videography</button>
          <button class="ai-suggestion-chip" data-query="Where is your studio located?">Studio Address</button>
          <button class="ai-suggestion-chip" data-query="Can I speak to someone from your team?" style="border-color: rgba(255, 159, 10, 0.4); color: #ffd60a;">Speak with Human Rep</button>
        </div>

        <!-- Footer / Input Form -->
        <footer class="ai-chat-footer">
          <form id="aiMessageForm" class="ai-input-bar">
            <textarea id="aiMessageInput" class="ai-msg-textarea" rows="1" placeholder="Type your inquiry here... (Enter to send)" required></textarea>
            <button type="submit" id="aiSendBtn" class="ai-send-btn" title="Send message" aria-label="Send">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
          <div class="ai-footer-bar">
            <div class="ai-footer-security">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#86868b" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Vigorish Studio Architecture</span>
            </div>
            <button id="aiEscalateActionBtn" type="button" style="background: none; border: none; font-size: 11px; color: #2997ff; cursor: pointer; text-decoration: underline;">Request Human Representative</button>
          </div>
        </footer>
      </div>
    `;

    // Unified Floating Digital Interface (Live Clock + AI Support Launcher)
    const floatingDock = document.createElement('div');
    floatingDock.id = 'vmFloatingDock';
    floatingDock.className = 'vm-floating-dock';
    floatingDock.setAttribute('aria-label', 'Vigorish Studio Floating Interface');

    // Live Digital Studio Clock directly above the AI Support Button
    const clockWidget = document.createElement('div');
    clockWidget.id = 'vmLiveClock';
    clockWidget.className = 'vm-live-clock';
    clockWidget.setAttribute('role', 'timer');
    clockWidget.setAttribute('aria-label', 'Lusaka Studio Live Clock');
    clockWidget.innerHTML = `
      <div class="vm-clock-pill" id="vmClockPill" title="Vigorish Media Studio Headquarters • Lusaka (CAT)">
        <span class="vm-clock-pulse-dot"></span>
        <span class="vm-clock-city">LUSAKA HQ</span>
        <span class="vm-clock-time" id="vmClockTime">--:--:--</span>
        <span class="vm-clock-tz">CAT</span>
      </div>
    `;

    floatingDock.appendChild(clockWidget);
    floatingDock.appendChild(launcher);
    document.body.appendChild(floatingDock);
    document.body.appendChild(chatWindow);

    initStudioLiveClock();

    bindEvents();
    restoreLocalSession();

    if (state.conversationId && state.customerName) {
      renderActiveSession();
    }
  }

  // Live Studio Digital Clock
  function initStudioLiveClock() {
    const timeEl = document.getElementById('vmClockTime');
    if (!timeEl) return;

    function updateTime() {
      const now = new Date();
      try {
        const timeStr = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Africa/Lusaka',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(now);
        timeEl.textContent = timeStr;
      } catch (e) {
        // High-precision fallback for UTC+2 (Central Africa Time)
        const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
        const catDate = new Date(utcMs + (2 * 3600000));
        const hh = String(catDate.getHours()).padStart(2, '0');
        const mm = String(catDate.getMinutes()).padStart(2, '0');
        const ss = String(catDate.getSeconds()).padStart(2, '0');
        timeEl.textContent = `${hh}:${mm}:${ss}`;
      }
    }

    updateTime();
    setInterval(updateTime, 1000);
  }

  // Format timestamp e.g. "14:28"
  function formatTime(isoStr) {
    try {
      const d = isoStr ? new Date(isoStr) : new Date();
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  // Event Listeners
  function bindEvents() {
    const launcher = document.getElementById('aiSupportLauncher');
    const chatWindow = document.getElementById('aiChatWindow');
    const closeBtn = document.getElementById('aiCloseBtn');
    const resetBtn = document.getElementById('aiResetBtn');
    const soundToggle = document.getElementById('aiSoundToggle');
    const nameForm = document.getElementById('aiNameForm');
    const msgForm = document.getElementById('aiMessageForm');
    const textarea = document.getElementById('aiMessageInput');
    const suggestionsWrap = document.getElementById('aiSuggestionsWrap');
    const escalateBtn = document.getElementById('aiEscalateActionBtn');

    // Toggle Chat Window
    launcher.addEventListener('click', () => {
      state.isOpen = !state.isOpen;
      if (state.isOpen) {
        chatWindow.classList.add('ai-open');
        playAudioChime('open');
        if (state.conversationId) {
          setTimeout(() => textarea.focus(), 300);
        } else {
          setTimeout(() => {
            const nameInput = document.getElementById('aiCustomerNameInput');
            if (nameInput) nameInput.focus();
          }, 300);
        }
      } else {
        chatWindow.classList.remove('ai-open');
      }
    });

    closeBtn.addEventListener('click', () => {
      state.isOpen = false;
      chatWindow.classList.remove('ai-open');
    });

    // Sound toggle
    soundToggle.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      soundToggle.style.opacity = state.soundEnabled ? '1' : '0.4';
      if (state.soundEnabled) playAudioChime('send');
    });

    // Reset Chat
    resetBtn.addEventListener('click', () => {
      if (confirm('Start a fresh conversation? This will clear your current chat.')) {
        sessionStorage.removeItem('vigorish_ai_session');
        state.conversationId = null;
        state.customerName = null;
        state.customerContact = null;
        state.status = 'AI_ACTIVE';
        state.messages = [];
        document.getElementById('aiWelcomeGate').style.display = 'flex';
        document.getElementById('aiChatBody').style.display = 'none';
        const msgs = document.getElementById('aiMessagesContainer');
        if (msgs) msgs.innerHTML = '';
      }
    });

    // Name Gate Submission
    nameForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('aiCustomerNameInput');
      const contactInput = document.getElementById('aiCustomerContactInput');
      const startBtn = document.getElementById('aiStartChatBtn');

      const nameVal = nameInput.value.trim();
      const contactVal = contactInput.value.trim();

      if (!nameVal) return;

      const welcomeText = `Hi ${nameVal} 👋 Welcome to Vigorish Media Live Support! How can I assist you today? Whether you're exploring our Website Design & Management packages (from K6,500/Yr), Social Media Management (from K1,200/mo), 4K videography, Graphic Design & Print Collateral, or visiting our studio at Chibuluma Road in New Kasama, I'm here to help!`;

      if (state.isStaticDeployment) {
        state.conversationId = `CHAT-${Date.now().toString().slice(-6)}`;
        state.customerName = nameVal;
        state.customerContact = contactVal || null;
        state.status = 'AI_ACTIVE';
        state.messages = [{
          id: `MSG-${Date.now()}`,
          sender: 'ai',
          senderName: 'Vigorish AI Concierge',
          text: welcomeText,
          timestamp: new Date().toISOString()
        }];
        persistLocalSession();
        renderActiveSession();
        playAudioChime('receive');
        return;
      }

      startBtn.disabled = true;
      startBtn.innerHTML = '<span>Initializing AI Concierge...</span>';

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch('/api/chat/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            customerName: nameVal,
            customerContact: contactVal,
            pageUrl: window.location.href
          })
        });
        clearTimeout(timeoutId);

        const data = await res.json().catch(() => null);
        if (res.ok && data && data.success) {
          state.conversationId = data.conversationId;
          state.customerName = data.customerName;
          state.customerContact = contactVal || null;
          state.status = data.status || 'AI_ACTIVE';
          state.messages = [data.welcomeMessage];
          persistLocalSession();
          renderActiveSession();
          playAudioChime('receive');
        } else {
          // Seamless fallback so the user is NEVER blocked on published or static hosting
          state.isStaticDeployment = true;
          state.conversationId = `CHAT-${Date.now().toString().slice(-6)}`;
          state.customerName = nameVal;
          state.customerContact = contactVal || null;
          state.status = 'AI_ACTIVE';
          state.messages = [{
            id: `MSG-${Date.now()}`,
            sender: 'ai',
            senderName: 'Vigorish AI Concierge',
            text: welcomeText,
            timestamp: new Date().toISOString()
          }];
          persistLocalSession();
          renderActiveSession();
          playAudioChime('receive');
        }
      } catch (err) {
        console.warn('[AI Support] Running in resilient direct mode:', err);
        state.isStaticDeployment = true;
        // Resilient fallback entry
        state.conversationId = `CHAT-${Date.now().toString().slice(-6)}`;
        state.customerName = nameVal;
        state.customerContact = contactVal || null;
        state.status = 'AI_ACTIVE';
        state.messages = [{
          id: `MSG-${Date.now()}`,
          sender: 'ai',
          senderName: 'Vigorish AI Concierge',
          text: welcomeText,
          timestamp: new Date().toISOString()
        }];
        persistLocalSession();
        renderActiveSession();
        playAudioChime('receive');
      } finally {
        startBtn.disabled = false;
        startBtn.innerHTML = `<span>Start Live Chat</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>`;
      }
    });

    // Message Form Submission
    msgForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitUserMessage();
    });

    // Textarea Enter to send
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitUserMessage();
      }
    });

    // Auto resize textarea
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    });

    // Suggested Questions
    suggestionsWrap.addEventListener('click', (e) => {
      const chip = e.target.closest('.ai-suggestion-chip');
      if (chip) {
        const q = chip.getAttribute('data-query');
        if (q) {
          textarea.value = q;
          submitUserMessage();
        }
      }
    });

    // Explicit Request Human button
    escalateBtn.addEventListener('click', () => {
      triggerHumanEscalation('Customer clicked Request Human Representative in chat footer');
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isOpen) {
        state.isOpen = false;
        chatWindow.classList.remove('ai-open');
      }
    });
  }

  // Switch from Name Gate to Active Chat
  function renderActiveSession() {
    const welcomeGate = document.getElementById('aiWelcomeGate');
    const chatBody = document.getElementById('aiChatBody');
    const sessionIdBadge = document.getElementById('aiSessionIdBadge');

    welcomeGate.style.display = 'none';
    chatBody.style.display = 'flex';

    if (sessionIdBadge) {
      sessionIdBadge.textContent = state.conversationId;
    }

    updateStatusUI();

    const container = document.getElementById('aiMessagesContainer');
    container.innerHTML = '';
    state.messages.forEach(msg => appendMessageUI(msg, false));
    scrollMessagesBottom();

    startPolling();
  }

  function updateStatusUI() {
    const statusPill = document.getElementById('aiStatusPill');
    const statusText = document.getElementById('aiStatusText');

    if (state.status === 'HUMAN_REQUESTED' || state.status === 'HUMAN_ACTIVE') {
      if (statusPill) {
        statusPill.innerHTML = `
          <span class="ai-status-dot" style="background: #ff9f0a; box-shadow: 0 0 6px #ff9f0a;"></span>
          <span style="font-size: 11px; color: #ff9f0a; font-weight: 600;">Team Alerted</span>
        `;
      }
      if (statusText) statusText.textContent = 'Support Representative Alerted';
    } else {
      if (statusPill) {
        statusPill.innerHTML = `
          <span class="ai-status-dot"></span>
          <span style="font-size: 11px;">AI Active</span>
        `;
      }
      if (statusText) statusText.textContent = 'Live Online Support';
    }
  }

  // Append single message bubble
  function appendMessageUI(msg, animate = true) {
    const container = document.getElementById('aiMessagesContainer');
    if (!container) return;

    const row = document.createElement('div');
    const isUser = msg.sender === 'customer';
    const isAgent = msg.sender === 'agent';
    const isSystem = msg.sender === 'system';

    row.className = `ai-msg-row ${isUser ? 'user' : isAgent ? 'agent' : isSystem ? 'system' : 'assistant'}`;

    let senderLabel = isUser ? 'You' : isAgent ? (msg.senderName || 'Studio Representative') : (msg.senderName || 'Vigorish AI');
    let timeText = formatTime(msg.timestamp);

    // Markdown-like bold formatting
    let formattedText = msg.text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');

    let whatsappActionHtml = '';
    if (msg.whatsappLink) {
      whatsappActionHtml = `
        <div style="margin-top: 10px;">
          <a href="${msg.whatsappLink}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: #25D366; color: #ffffff; border-radius: 20px; font-size: 12.5px; font-weight: 600; text-decoration: none; box-shadow: 0 2px 8px rgba(37, 211, 102, 0.35);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.182-.076.356.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.044.101-.116.433-.506.549-.679.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z"/></svg>
            <span>Chat on WhatsApp (+260 97 989 4567)</span>
          </a>
        </div>
      `;
    }

    row.innerHTML = `
      <div class="ai-msg-bubble">
        ${formattedText}
        ${whatsappActionHtml}
      </div>
      <div class="ai-msg-meta">
        <span>${senderLabel}</span>
        <span>•</span>
        <span>${timeText}</span>
        ${msg.escalationTriggered ? '<span style="color: #ff9f0a; font-weight: 600;">[Support Notified]</span>' : ''}
      </div>
    `;

    container.appendChild(row);
    if (animate) scrollMessagesBottom();
  }

  function showTypingIndicator() {
    state.isTyping = true;
    const container = document.getElementById('aiMessagesContainer');
    const orb = document.getElementById('aiAvatarOrb');
    if (orb) orb.classList.add('thinking');

    let existing = document.getElementById('aiTypingRow');
    if (existing) existing.remove();

    const typingDiv = document.createElement('div');
    typingDiv.id = 'aiTypingRow';
    typingDiv.className = 'ai-typing-indicator';
    typingDiv.innerHTML = `
      <span class="ai-typing-label">AI Support is thinking</span>
      <div class="ai-typing-dots">
        <div class="ai-typing-dot"></div>
        <div class="ai-typing-dot"></div>
        <div class="ai-typing-dot"></div>
      </div>
    `;
    container.appendChild(typingDiv);
    scrollMessagesBottom();
  }

  function hideTypingIndicator() {
    state.isTyping = false;
    const typing = document.getElementById('aiTypingRow');
    if (typing) typing.remove();
    const orb = document.getElementById('aiAvatarOrb');
    if (orb) orb.classList.remove('thinking');
  }

  function scrollMessagesBottom() {
    const container = document.getElementById('aiMessagesContainer');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  // Send Customer Inquiry
  async function submitUserMessage() {
    const textarea = document.getElementById('aiMessageInput');
    const sendBtn = document.getElementById('aiSendBtn');
    const text = textarea.value.trim();

    if (!text || state.isTyping) return;

    // Reset input
    textarea.value = '';
    textarea.style.height = 'auto';

    // Add user message to UI
    const userMsg = {
      id: `USER-${Date.now()}`,
      sender: 'customer',
      senderName: state.customerName,
      text: text,
      timestamp: new Date().toISOString()
    };
    state.messages.push(userMsg);
    appendMessageUI(userMsg);
    persistLocalSession();
    playAudioChime('send');

    showTypingIndicator();
    sendBtn.disabled = true;

    if (state.isStaticDeployment) {
      setTimeout(() => {
        hideTypingIndicator();
        const kb = getStudioKnowledgeResponse(text, state.customerName);
        const replyMsg = {
          id: `AI-KB-${Date.now()}`,
          sender: 'ai',
          senderName: 'Vigorish AI Concierge',
          text: kb.text,
          whatsappLink: kb.whatsappLink,
          timestamp: new Date().toISOString(),
          escalationTriggered: kb.escalate
        };
        if (kb.escalate) {
          state.status = 'HUMAN_REQUESTED';
          updateStatusUI();
        }
        state.messages.push(replyMsg);
        persistLocalSession();
        appendMessageUI(replyMsg);
        playAudioChime('receive');
        sendBtn.disabled = false;
        textarea.focus();
      }, 350);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          conversationId: state.conversationId,
          message: text,
          pageUrl: window.location.href
        })
      });
      clearTimeout(timeoutId);

      const data = await res.json().catch(() => null);
      hideTypingIndicator();

      if (res.ok && data && data.success && data.message) {
        state.status = data.status || state.status;
        state.messages.push(data.message);
        persistLocalSession();
        updateStatusUI();

        // Natural typing delay illusion
        setTimeout(() => {
          appendMessageUI(data.message);
          playAudioChime('receive');
        }, 120);
      } else {
        state.isStaticDeployment = true;
        // Fall back seamlessly to studio knowledge base
        const kb = getStudioKnowledgeResponse(text, state.customerName);
        const fallbackMsg = {
          id: `AI-KB-${Date.now()}`,
          sender: 'ai',
          senderName: 'Vigorish AI Concierge',
          text: kb.text,
          whatsappLink: kb.whatsappLink,
          timestamp: new Date().toISOString(),
          escalationTriggered: kb.escalate
        };
        if (kb.escalate) {
          state.status = 'HUMAN_REQUESTED';
          updateStatusUI();
        }
        state.messages.push(fallbackMsg);
        persistLocalSession();
        setTimeout(() => {
          appendMessageUI(fallbackMsg);
          playAudioChime('receive');
        }, 120);
      }
    } catch (err) {
      hideTypingIndicator();
      state.isStaticDeployment = true;
      console.warn('[AI Support] Dispatch handled via local studio engine:', err);
      // Fall back seamlessly to studio knowledge base
      const kb = getStudioKnowledgeResponse(text, state.customerName);
      const fallbackMsg = {
        id: `AI-KB-${Date.now()}`,
        sender: 'ai',
        senderName: 'Vigorish AI Concierge',
        text: kb.text,
        whatsappLink: kb.whatsappLink,
        timestamp: new Date().toISOString(),
        escalationTriggered: kb.escalate
      };
      if (kb.escalate) {
        state.status = 'HUMAN_REQUESTED';
        updateStatusUI();
      }
      state.messages.push(fallbackMsg);
      persistLocalSession();
      setTimeout(() => {
        appendMessageUI(fallbackMsg);
        playAudioChime('receive');
      }, 120);
    } finally {
      sendBtn.disabled = false;
      textarea.focus();
    }
  }

  // Comprehensive in-browser studio knowledge engine (works 100% offline & on static hosting)
  function getStudioKnowledgeResponse(query, name) {
    const q = (query || '').toLowerCase().trim();

    // Human escalation request
    if (/\b(human|person|agent|representative|advisor|manager|call me|speak to someone|talk to someone)\b/i.test(q)) {
      return {
        text: `I’d like to make sure you get immediate direct assistance, ${name}. Our creative leads are on standby and can be reached directly via WhatsApp or phone at **+260 97 989 4567** or email at **mediavigorish@gmail.com**.\n\nClick below to connect with us instantly on WhatsApp:`,
        escalate: true,
        whatsappLink: `https://wa.me/260979894567?text=${encodeURIComponent('Hello Vigorish Media team, my name is ' + name + ' and I am inquiring about your creative services.')}`
      };
    }

    // Social Media Management (exact user specification)
    if (/social|facebook|instagram|tiktok|post|posts|reel|reels|social media/i.test(q)) {
      return {
        text: `Your Facebook & Instagram should make your business look active, professional and credible not forgotten.\nVigorish Media can manage it for you.\n\n**We handle:**\n✓ Strategy & consistent posting\n✓ Professional post designs & captions\n✓ Community building\n✓ Facebook & Instagram boosting\n✓ Photo editing & Reels\n✓ Product & location showcasing\n✓ Branding & website management\n\n📱 **SOCIAL MEDIA MANAGEMENT FROM K1,200/MONTH**\n• **5 Posts** — **K1,200/month**\n• **10 Posts** — **K2,500/month**\n• **20 Posts** — **K4,000/month**\n\n*Every post includes a professional design + caption.*\n\nWould you like to get started with one of these packages today?`,
        escalate: false
      };
    }

    // Pricing / Cost
    if (/price|pricing|cost|how much|quote|rates|packages|plans/i.test(q)) {
      return {
        text: `Here is our transparent pricing guide in Zambian Kwacha (ZMW):\n\n📢 **Paid Facebook & Instagram Advertising:**\n• **Campaigns from just K450** per campaign\n*(Setup, targeting, monitoring & optimisation: Lead Gen, Followers, Video Views, Engagement, Awareness, Traffic)*\n\n🌐 **Website Design & Management Packages (Annual):**\n• **Starter Website**: **K6,500/Year**\n• **Professional Website**: **K8,500/Year**\n• **Business Website**: **K10,500/Year**\n• **Enterprise Website**: **K37,000/Year**\n*(Includes Free Domain for 1 Year, Cloud Hosting, Pro Design, Marketing Tools & SEO)*\n\n📱 **Social Media Management Monthly Plans:**\n• **5 Posts**: **K1,200/month**\n• **10 Posts**: **K2,500/month**\n• **20 Posts**: **K4,000/month**\n*(Every post includes professional design + caption + boosting)*\n\n💼 **Comprehensive Brand Packages:**\n• **Starter Brand Spec**: K5,500\n• **Growth Accelerator**: K12,500\n• **Enterprise Suite**: K28,000\n\nWhich service or package would you like to get started with?`,
        escalate: false
      };
    }

    // Digital Marketing / Paid Ads / Performance Advertising
    if (/ad|ads|advertising|digital marketing|paid ads|facebook ads|instagram ads|meta ads|boost|leads|lead generation|k450|campaign/i.test(q)) {
      return {
        text: `📢 **PAID FACEBOOK & INSTAGRAM ADVERTISING**\n\nPut your brand in front of the right people.\nReach more potential customers, grow your audience and generate meaningful results with targeted Facebook & Instagram advertising from Vigorish Media.\n\nWhether your goal is to generate leads, grow your page, increase video views or drive engagement, we create and manage campaigns designed around your objective.\n\n🔥 **Campaigns from just K450**\n\n🎯 **Lead Generation** – Reach potential customers and generate enquiries.\n👍 **Page Likes & Followers** – Build your social media audience.\n▶️ **Video Views** – Get more people watching your brand videos.\n💬 **Post Engagement** – Increase likes, comments, shares and interactions.\n📢 **Brand Awareness** – Put your business in front of more potential customers.\n🔗 **Traffic Campaigns** – Drive people to your website, WhatsApp or other online destinations.\n\nFrom campaign setup and audience targeting to monitoring and optimisation, Vigorish Media helps you get more from your advertising budget.\n\nWould you like to launch a targeted campaign starting from K450 today?`,
        escalate: false
      };
    }

    // Graphic Design & Print Collateral / Editorial / Brochure
    if (/graphic|graphics|print|editorial|brochure|flyer|banner|poster|collateral|packaging|business card/i.test(q)) {
      return {
        text: `📄 **GRAPHIC DESIGN & PRINT COLLATERAL**\nGreat design doesn’t just make your business look good it builds credibility, captures attention, tells your story, and makes your brand memorable.\n\nAt Vigorish Media, we turn ideas into powerful visuals that help your business stand out:\n✓ **Branding & Visual Identity**\n✓ **Social Media Designs**\n✓ **Marketing & Advertising Collateral**\n✓ **Triple Fold Brochures** (A4 Gloss Paper)\n✓ **Print Materials & Product Packaging**\n✓ **Digital & Web Design Assets**\n✓ **300DPI press-ready CMYK files** with strict color separation accuracy\n\nWe create designs that work as hard as your business does. Would you like a custom quote for your print or graphic project?`,
        escalate: false
      };
    }

    // Videography / Photography
    if (/video|videography|photo|photography|film|camera|shoot|drone/i.test(q)) {
      return {
        text: `Our visual production department operates high-dynamic-range 4K cinema cameras, prime cinema lenses, wireless audio, and Hollywood-standard DaVinci Resolve color science. We produce brand commercials, documentary films, 9:16 vertical Reels for social feeds, executive leadership portraits, and multi-camera live corporate events. Commercial delivery is completed within 5–7 business days.`,
        escalate: false
      };
    }

    // Branding / Logo
    if (/brand|branding|logo|identity|stationery/i.test(q)) {
      return {
        text: `Our Branding & Corporate Identity services establish lasting market authority with complete primary, secondary, and sub-mark vector logo suites, custom color palettes, typography systems, business stationery (cards, letterhead, invoice templates), and brand guidelines books. Delivery is 10–14 business days.`,
        escalate: false
      };
    }

    // Websites / Web design
    if (/website|web|hosting|domain|developer|seo|ecommerce|online store/i.test(q)) {
      return {
        text: `🌐 **WEBSITE DESIGN & MANAGEMENT**\nYour website is often the first impression customers have of your business. Make it count.\n\nWhether you're a startup, growing business, or established company, Vigorish Media has a website solution designed to help you build credibility, attract customers, and grow online:\n\n✅ **Free Domain for 1 Year**\n✅ **Professional Design**\n✅ **Cloud Hosting**\n✅ **Marketing Tools**\n✅ **eCommerce & Online Payments Available**\n✅ **Scalable Solutions for Every Business**\n\n🔹 **Starter Website** – **K6,500/Year**\n🔹 **Professional Website** – **K8,500/Year**\n🔹 **Business Website** – **K10,500/Year**\n🔹 **Enterprise Website** – **K37,000/Year**\n\nChoose the package that fits your goals and let us help you create a website that works as hard as you do!`,
        escalate: false
      };
    }

    // Location / Address / Lusaka
    if (/where|location|office|address|located|lusaka|new kasama/i.test(q)) {
      return {
        text: `Vigorish Media is an independent 100% Zambian creative studio physically located at **Chibuluma Road, New Kasama, Lusaka, Zambia**. We welcome scheduled client visits and creative discovery meetings!`,
        escalate: false
      };
    }

    // Contact
    if (/contact|email|phone|call|whatsapp|reach|number/i.test(q)) {
      return {
        text: `You can reach our creative team directly:\n• **Phone / WhatsApp**: +260 97 989 4567\n• **Email**: mediavigorish@gmail.com\n• **Studio Address**: Chibuluma Road, New Kasama, Lusaka, Zambia\n\nYou can also click the WhatsApp button below to start an instant direct chat:`,
        escalate: false,
        whatsappLink: `https://wa.me/260979894567?text=${encodeURIComponent('Hello Vigorish Media team, my name is ' + name + ' and I am reaching out from your website.')}`
      };
    }

    // Greetings
    if (/^(hi|hello|hey|good day|muli bwanji|greetings)/i.test(q)) {
      return {
        text: `Hello ${name}! 👋 How can I help you today? Whether you're exploring our new Social Media Management packages (starting at K1,200/mo), 4K videography, branding, or visiting our Lusaka studio, I'm here to assist!`,
        escalate: false
      };
    }

    // Default
    return {
      text: `Thank you for asking, ${name}. At Vigorish Media, we build brands that add value through Social Media Management (from K1,200/mo), 4K cinema videography, bespoke branding, and web design. Could you tell me a little more about your brand or what you would like to achieve?`,
      escalate: false
    };
  }

  // Trigger Human Support Escalation
  async function triggerHumanEscalation(reason) {
    if (state.status === 'HUMAN_REQUESTED' || state.status === 'HUMAN_ACTIVE') {
      alert('Our support team has already been notified and is currently reviewing your conversation.');
      return;
    }

    showTypingIndicator();

    try {
      const res = await fetch('/api/chat/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: state.conversationId,
          reason: reason || 'Customer requested human assistance'
        })
      });

      const data = await res.json().catch(() => null);
      hideTypingIndicator();

      if (res.ok && data && data.success && data.message) {
        state.status = data.status || 'HUMAN_REQUESTED';
        state.messages.push(data.message);
        persistLocalSession();
        updateStatusUI();
        appendMessageUI(data.message);
        playAudioChime('receive');
      } else {
        throw new Error('Fallback escalate');
      }
    } catch (err) {
      hideTypingIndicator();
      const escMsg = {
        id: `ESC-${Date.now()}`,
        sender: 'ai',
        senderName: 'Vigorish AI Concierge',
        text: `I’ve alerted our support team now, ${state.customerName}. A creative lead is reviewing your inquiry. You can also chat directly with us on WhatsApp at +260 97 989 4567:`,
        whatsappLink: `https://wa.me/260979894567?text=${encodeURIComponent('Hello Vigorish Media team, my name is ' + state.customerName + ' and I am requesting human assistance.')}`,
        timestamp: new Date().toISOString(),
        escalationTriggered: true
      };
      state.status = 'HUMAN_REQUESTED';
      state.messages.push(escMsg);
      persistLocalSession();
      updateStatusUI();
      appendMessageUI(escMsg);
      playAudioChime('receive');
    }
  }

  // Poll for human agent replies or status updates
  function startPolling() {
    if (state.pollTimer) clearInterval(state.pollTimer);
    state.pollTimer = setInterval(async () => {
      if (!state.conversationId) return;

      try {
        const res = await fetch(`/api/chat/status?conversationId=${encodeURIComponent(state.conversationId)}`);
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        if (!data) return;

        if (data.status && data.status !== state.status) {
          state.status = data.status;
          updateStatusUI();
        }

        // Check if new agent messages arrived
        if (data.messages && data.messages.length > state.messages.length) {
          const newMessages = data.messages.slice(state.messages.length);
          newMessages.forEach(msg => {
            state.messages.push(msg);
            appendMessageUI(msg);
            playAudioChime('receive');
          });
          persistLocalSession();
        }
      } catch (e) {}
    }, 4000);
  }

  // Public API
  window.VigorishAI = {
    open: () => {
      const launcher = document.getElementById('aiSupportLauncher');
      const chatWindow = document.getElementById('aiChatWindow');
      if (chatWindow) {
        chatWindow.classList.add('ai-open');
        chatWindow.setAttribute('aria-hidden', 'false');
        if (launcher) launcher.classList.add('ai-active');
        playAudioChime('receive');
        setTimeout(() => {
          const textarea = document.getElementById('aiMessageInput');
          const nameInput = document.getElementById('aiCustomerNameInput');
          if (textarea && textarea.offsetParent !== null) textarea.focus();
          else if (nameInput && nameInput.offsetParent !== null) nameInput.focus();
        }, 300);
      } else {
        injectSupportWidget();
        setTimeout(() => {
          if (window.VigorishAI && window.VigorishAI.open) window.VigorishAI.open();
        }, 150);
      }
    },
    close: () => {
      const closeBtn = document.getElementById('aiCloseBtn');
      if (closeBtn) closeBtn.click();
    },
    ask: (questionText) => {
      window.VigorishAI.open();
      setTimeout(() => {
        const textarea = document.getElementById('aiMessageInput');
        if (textarea) {
          textarea.value = questionText;
          submitUserMessage();
        }
      }, 400);
    },
    escalate: () => triggerHumanEscalation('Triggered via developer action')
  };

  window.openLiveSupportChat = window.VigorishAI.open;

  // Safe auto-init
  function safeInit() {
    if (document.body) {
      injectSupportWidget();
    } else {
      document.addEventListener('DOMContentLoaded', injectSupportWidget);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInit);
  } else {
    safeInit();
  }
})();
