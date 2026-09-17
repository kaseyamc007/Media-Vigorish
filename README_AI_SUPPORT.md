# Vigorish Media — Futuristic AI Live Customer Support System
**Enterprise-Grade AI Concierge with Background WhatsApp Support Routing**

This document outlines the complete architecture, setup, configuration, and API reference for the AI-powered live customer support system built for **Vigorish Media**.

---

## 1. System Overview

The system presents website visitors with a **native, futuristic live customer support experience** ("Apple-level simplicity + futuristic AI interface + premium customer service").

### Key Principles:
1. **Proprietary Studio Aesthetic**: Fixed floating AI support button in the bottom-right corner with smooth ambient glowing rings, animated AI orb, and status indicator.
2. **Customer Name-Gate Experience**: Before entering the live conversation, visitors provide their name (and optional phone/email) so every session is personalized and traceable.
3. **Hidden WhatsApp Notification Routing**: 
   - Customers **NEVER** see mentions of WhatsApp, WhatsApp API, or external redirect links.
   - All WhatsApp alerts are dispatched **strictly server-side in the background** to the studio support hotline: **`+260979894567`**.
   - When escalation occurs, the AI tells the customer: *"I’d like to make sure you get the right assistance. I’ve notified our support team now, and someone will assist you shortly."*
4. **Official WhatsApp Business Platform / Cloud API**: Built directly on Meta's official Graph API endpoint (`https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages`), not fragile browser automation or scraping.

---

## 2. Project Structure

```
├── .env.example                # Documented secrets & WhatsApp Cloud API credentials
├── metadata.json               # Platform capabilities & permissions
├── package.json                # Dependencies & build scripts (tsx server.ts, esbuild)
├── server.ts                   # Full-Stack Express Server & Vite integration
├── server/
│   ├── types.ts                # TypeScript data schemas (Session, ChatMessage, WhatsAppAlert)
│   ├── config.ts               # Brand settings, WhatsApp target, business hours, escalation triggers
│   ├── knowledge.ts            # Official Vigorish Media studio knowledge base
│   ├── whatsapp.ts             # Meta Cloud API dispatcher & alert template formats
│   ├── ai.ts                   # Gemini 2.5 Flash SDK integration + local intent engine
│   └── store.ts                # In-memory & file-persisted session store with rate limiting
├── src/chat/
│   ├── ai-support.css          # Futuristic glassmorphism styles & animations
│   └── ai-support.js           # Modular client widget script & Web Audio haptics
├── public/chat/
│   ├── ai-support.css          # Standalone public asset for easy external embedding
│   └── ai-support.js           # Standalone public asset for easy external embedding
└── index.html                  # Main website entry point with embedded AI Support
```

---

## 3. Environment Variables Configuration

Create or update `.env` in the root directory:

```bash
# GEMINI_API_KEY (Server-side only)
# Used for intelligent conversational reasoning and context memory
GEMINI_API_KEY="your_gemini_api_key_here"

# WHATSAPP NOTIFICATION TARGET (Default: +260979894567)
WHATSAPP_RECIPIENT_PHONE="+260979894567"

# META WHATSAPP BUSINESS CLOUD API
# 1. From developers.facebook.com > My Apps > WhatsApp > API Setup
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id"

# 2. System User Access Token with 'whatsapp_business_messaging' permission
WHATSAPP_ACCESS_TOKEN="your_meta_system_user_token"

# 3. WhatsApp Business Account ID (WABA ID)
WHATSAPP_BUSINESS_ACCOUNT_ID="your_waba_account_id"

# Optional administrative API secret
API_SECRET="your_optional_secret_token"
```

> **Note**: When running in preview or development mode without WhatsApp credentials, the server **gracefully logs the formatted notification payloads** to the server console and archives them in the internal dispatch queue with status `SIMULATED_LOGGED`. As soon as credentials are added, live WhatsApp messages are delivered directly to `+260979894567`.

---

## 4. API Endpoints Reference

### `POST /api/chat/start`
Initializes a new session. Customer name is mandatory.
- **Request Body**:
  ```json
  {
    "customerName": "Kaseya Banda",
    "customerContact": "kaseya@example.com",
    "pageUrl": "https://vigorishmedia.com/#/services"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "conversationId": "CHAT-20260917-4821",
    "customerName": "Kaseya Banda",
    "status": "AI_ACTIVE",
    "welcomeMessage": {
      "id": "MSG-1726573821-124",
      "sender": "ai",
      "text": "Hi Kaseya Banda 👋 Welcome! I’m your AI Support Assistant. How can I help you today?",
      "timestamp": "2026-09-17T18:42:00.000Z"
    }
  }
  ```

### `POST /api/chat/message`
Submits a customer inquiry. Handles rate limiting, context memory, AI reasoning, escalation triggers, and first-message alert dispatch.
- **Request Body**:
  ```json
  {
    "conversationId": "CHAT-20260917-4821",
    "message": "Do you offer 4K cinema videography in Kitwe?"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": {
      "id": "MSG-1726573850-891",
      "sender": "ai",
      "text": "Yes! Our visual production department travels nationwide across Zambia, including Kitwe and the Copperbelt...",
      "timestamp": "2026-09-17T18:42:30.000Z"
    },
    "status": "AI_ACTIVE",
    "escalated": false
  }
  ```

### `POST /api/chat/escalate`
Explicitly requests human assistance. Transitions status to `HUMAN_REQUESTED` and sends an urgent formatted alert to `+260979894567`.
- **Request Body**:
  ```json
  {
    "conversationId": "CHAT-20260917-4821",
    "reason": "Customer requested human representative"
  }
  ```

### `POST /api/chat/end`
Resolves the chat, generates a 4-line executive AI conversation summary, and dispatches the summary alert to WhatsApp.

### `GET /api/chat/status?conversationId=...`
Polls current status and message stream (supports live agent replies in the UI).

### `GET /api/chat/admin/conversations`
Inspects all active sessions, messages, and the WhatsApp dispatch audit log.

### `POST /api/chat/admin/reply`
Allows a studio representative to inject a reply directly into the customer's live chat session.

---

## 5. WhatsApp Alert Formats (Dispatched to +260979894567)

### Alert 1: New Chat Started
```
━━━━━━━━━━━━━━━━━━
🔔 NEW WEBSITE SUPPORT CHAT
━━━━━━━━━━━━━━━━━━

👤 Customer:
John Banda
📞 Contact: +260971234567

🆔 Conversation:
CHAT-20260917-4821

🕒 Started:
17 Sep 2026, 20:42 (CAT)

📍 Source:
Vigorish Media Live Support (https://vigorishmedia.com/#/services)

━━━━━━━━━━━━━━━━━━

💬 CUSTOMER MESSAGE:
"Do you deliver 4K videography to Ndola?"

━━━━━━━━━━━━━━━━━━

🤖 AI RESPONSE:
"Yes! We operate cinema gear and travel across Zambia including Ndola..."

━━━━━━━━━━━━━━━━━━

📌 STATUS:
AI SUPPORT ACTIVE (Monitoring)
━━━━━━━━━━━━━━━━━━
```

### Alert 2: Human Support Request (Escalation)
```
━━━━━━━━━━━━━━━━━━
🚨 HUMAN SUPPORT REQUEST
━━━━━━━━━━━━━━━━━━

👤 Customer:
Sarah Banda
📞 Client Contact: +260979112233

🆔 Conversation ID:
CHAT-20260917-9281

🕒 Escalated:
17 Sep 2026, 20:44 (CAT)

⚠️ Trigger Reason:
Customer requested to speak with a human representative

━━━━━━━━━━━━━━━━━━

💬 LATEST MESSAGE:
"Can someone from your team give me a custom quotation?"

━━━━━━━━━━━━━━━━━━

📜 RECENT CONVERSATION TRAIL:
CUSTOMER (Sarah Banda):
"What does a corporate rebranding package include?"

AI (Vigorish AI Concierge):
"Our corporate identity systems include primary/secondary vector suites..."

CUSTOMER (Sarah Banda):
"Can someone from your team give me a custom quotation?"

━━━━━━━━━━━━━━━━━━

📌 ACTION REQUIRED:
Customer is waiting in live chat on the website.
Please review conversation or reply directly!
━━━━━━━━━━━━━━━━━━
```

---

## 6. How to Embed on Any Webpage

To embed the AI live support widget into any HTML page or sub-application, simply include:

```html
<!-- 1. Vigorish AI Support Stylesheet -->
<link rel="stylesheet" href="/chat/ai-support.css" />

<!-- 2. Vigorish AI Support Controller -->
<script src="/chat/ai-support.js" defer></script>
```

### JavaScript API:
The widget exposes a global `window.VigorishAI` helper:
```javascript
// Open the support window
window.VigorishAI.open();

// Close the support window
window.VigorishAI.close();

// Programmatically ask a question
window.VigorishAI.ask("How much does website development cost?");

// Trigger human escalation
window.VigorishAI.escalate();
```

---

## 7. Security & Spam Protection

1. **Credentials Isolation**: `WHATSAPP_ACCESS_TOKEN` and `GEMINI_API_KEY` are strictly held in Node environment memory and never sent across the network to client browsers.
2. **Rate Limiting**: Integrated token bucket algorithm limits each IP to a configurable maximum of requests per minute (default: 45 req/min).
3. **Input Sanitization**: Messages and names are trimmed, HTML-escaped, and length-capped to prevent XSS and buffer injection attacks.
4. **Confidentiality**: Customer sessions are scoped to ephemeral session storage.
