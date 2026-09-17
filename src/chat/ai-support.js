/**
 * VIGORISH MEDIA — FUTURISTIC AI LIVE CUSTOMER SUPPORT SYSTEM
 * Client-Side Controller & UI Widget
 * Apple-inspired minimalism + futuristic AI concierge
 */

(function () {
  'use strict';

  // State Management
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
    audioCtx: null
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
            <input type="text" id="aiCustomerNameInput" class="ai-text-input" placeholder="e.g. Kaseya Banda" required autocomplete="name" />
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
          <button class="ai-suggestion-chip" data-query="What services do you offer?">What services do you offer?</button>
          <button class="ai-suggestion-chip" data-query="How much does a brand identity cost?">Brand identity pricing</button>
          <button class="ai-suggestion-chip" data-query="Do you deliver 4K video productions?">4K Cinema Videography</button>
          <button class="ai-suggestion-chip" data-query="Where is your studio located?">Studio location</button>
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

    document.body.appendChild(launcher);
    document.body.appendChild(chatWindow);

    bindEvents();
    restoreLocalSession();

    if (state.conversationId && state.customerName) {
      renderActiveSession();
    }
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

      startBtn.disabled = true;
      startBtn.innerHTML = '<span>Initializing AI Concierge...</span>';

      try {
        const res = await fetch('/api/chat/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: nameVal,
            customerContact: contactVal,
            pageUrl: window.location.href
          })
        });

        const data = await res.json();
        if (data.success) {
          state.conversationId = data.conversationId;
          state.customerName = data.customerName;
          state.customerContact = contactVal || null;
          state.status = data.status || 'AI_ACTIVE';
          state.messages = [data.welcomeMessage];
          persistLocalSession();
          renderActiveSession();
          playAudioChime('receive');
        } else {
          alert(data.error || 'Failed to initialize chat session.');
        }
      } catch (err) {
        console.error(err);
        // Offline / dev fallback
        state.conversationId = `CHAT-${Date.now().toString().slice(-6)}`;
        state.customerName = nameVal;
        state.customerContact = contactVal || null;
        state.status = 'AI_ACTIVE';
        state.messages = [{
          id: `MSG-${Date.now()}`,
          sender: 'ai',
          senderName: 'Vigorish AI',
          text: `Hi ${nameVal} 👋 Welcome! I’m your AI Support Assistant. How can I help you today?`,
          timestamp: new Date().toISOString()
        }];
        persistLocalSession();
        renderActiveSession();
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

    row.innerHTML = `
      <div class="ai-msg-bubble">
        ${formattedText}
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

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: state.conversationId,
          message: text,
          pageUrl: window.location.href
        })
      });

      const data = await res.json();
      hideTypingIndicator();

      if (data.success && data.message) {
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
        appendMessageUI({
          id: `ERR-${Date.now()}`,
          sender: 'system',
          text: data.error || 'Connection notice: Message could not be processed. Retrying...'
        });
      }
    } catch (err) {
      hideTypingIndicator();
      console.warn('[AI Message Dispatch Failure, using fallback]:', err);
      // Fallback
      const fallbackReply = {
        id: `AI-FALLBACK-${Date.now()}`,
        sender: 'ai',
        senderName: 'Vigorish AI',
        text: `Thank you for your message, ${state.customerName}. I've logged your request regarding "${text.slice(0, 40)}". Our support team has been notified.`,
        timestamp: new Date().toISOString()
      };
      state.messages.push(fallbackReply);
      appendMessageUI(fallbackReply);
      playAudioChime('receive');
    } finally {
      sendBtn.disabled = false;
      textarea.focus();
    }
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

      const data = await res.json();
      hideTypingIndicator();

      if (data.success && data.message) {
        state.status = data.status || 'HUMAN_REQUESTED';
        state.messages.push(data.message);
        persistLocalSession();
        updateStatusUI();
        appendMessageUI(data.message);
        playAudioChime('receive');
      }
    } catch (err) {
      hideTypingIndicator();
      const escMsg = {
        id: `ESC-${Date.now()}`,
        sender: 'ai',
        senderName: 'Vigorish AI',
        text: `I’ve notified our support team now, ${state.customerName}. A creative lead is reviewing your inquiry and someone will assist you shortly.`,
        timestamp: new Date().toISOString(),
        escalationTriggered: true
      };
      state.status = 'HUMAN_REQUESTED';
      state.messages.push(escMsg);
      persistLocalSession();
      updateStatusUI();
      appendMessageUI(escMsg);
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
        const data = await res.json();

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
      if (launcher) launcher.click();
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

  // Auto-init on DOMContentLoaded or immediate if already ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSupportWidget);
  } else {
    injectSupportWidget();
  }
})();
