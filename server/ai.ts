import { GoogleGenAI } from '@google/genai';
import { CHAT_CONFIG } from './config';
import { STUDIO_KNOWLEDGE_BASE } from './knowledge';
import { ChatMessage, ConversationSession } from './types';

let genAIClient: GoogleGenAI | null = null;

function getGenAIClient(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    try {
      genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('[Gemini Client Init Warning]', e);
    }
  }
  return genAIClient;
}

/**
 * Checks if client's message contains human escalation triggers
 */
export function checkEscalationIntent(text: string): { shouldEscalate: boolean; reason: string } {
  const normalized = text.toLowerCase().trim();

  for (const trigger of CHAT_CONFIG.escalationTriggers) {
    if (normalized.includes(trigger)) {
      return {
        shouldEscalate: true,
        reason: `Client triggered escalation with phrase matching: "${trigger}"`
      };
    }
  }

  // Regex patterns for human requests
  if (/\b(human|person|agent|representative|advisor|manager|call me)\b/i.test(normalized)) {
    return {
      shouldEscalate: true,
      reason: 'Client explicitly asked to speak with a human team member'
    };
  }

  // Angry / complaint intent
  if (/\b(scam|terrible|awful|complaint|unacceptable|refund|sue)\b/i.test(normalized)) {
    return {
      shouldEscalate: true,
      reason: 'Negative sentiment or formal complaint detected'
    };
  }

  return { shouldEscalate: false, reason: '' };
}

/**
 * Rule-based local intelligent fallback if Gemini API is unavailable or offline
 */
function localKnowledgeMatch(userText: string, clientName: string): { reply: string; escalate: boolean; reason: string } {
  const q = userText.toLowerCase();

  // Check escalation
  const esc = checkEscalationIntent(q);
  if (esc.shouldEscalate) {
    return {
      reply: `I’d like to make sure you get the right assistance, ${clientName}. I’ve notified our support team now, and someone will assist you shortly. In the meantime, feel free to share any specific requirements or details here.`,
      escalate: true,
      reason: esc.reason
    };
  }

  // Greetings
  if (/^(hi|hello|hey|good day|muli bwanji|greetings)/i.test(q)) {
    return {
      reply: `Hello ${clientName}! 👋 How can I help you today? Whether you're exploring our 4K video productions, social media management retainers, bespoke branding, or web platforms, I'm at your service.`,
      escalate: false,
      reason: ''
    };
  }

  // Services inquiry
  if (/services|capabilities|what do you do|what do you offer/i.test(q)) {
    return {
      reply: `At Vigorish Media, we offer six specialized creative pillars:
1. **Social Media Management (from K1,200/mo)**: Strategy, professional post designs + captions, community building, Facebook & Instagram boosting, photo editing & Reels, and location showcasing.
2. **4K Cinema Videography & Photography**: Brand commercials, executive leadership portraits, and documentary coverage with cinema prime optics.
3. **Branding & Corporate Identity**: Complete vector logo suites, color palettes, stationery, and comprehensive guidelines.
4. **Website Design & Architecture**: High-speed, responsive platforms with 12 months complimentary managed cloud infrastructure & domain renewal.
5. **Graphic Design & Print Collateral**: Press-ready 300 DPI annual reports, packaging, and large-format expo banners.
6. **Digital Ads & Performance**: Targeted campaigns across Meta and Google with conversion tracking.

Which of these would you like to explore for your brand?`,
      escalate: false,
      reason: ''
    };
  }

  // Social Media Management specific inquiry
  if (/social media|facebook|instagram|tiktok|posts|reels|social management/i.test(q)) {
    return {
      reply: `Your Facebook & Instagram should make your business look active, professional and credible — not forgotten. Vigorish Media can manage it for you!

**We handle:**
✓ Strategy & consistent posting
✓ Professional post designs & captions
✓ Community building
✓ Facebook & Instagram boosting
✓ Photo editing & Reels
✓ Product & location showcasing 
✓ Branding & website management

📱 **SOCIAL MEDIA MANAGEMENT PLANS:**
• **5 Posts** — **K1,200/month**
• **10 Posts** — **K2,500/month**
• **20 Posts** — **K4,000/month**
*Every post includes a professional design + caption.*

Would you like to get started with one of these packages today, or shall I connect you with our creative lead on WhatsApp (+260 97 989 4567)?`,
      escalate: false,
      reason: ''
    };
  }

  // Pricing / Cost
  if (/price|pricing|cost|how much|quote|rates|packages/i.test(q)) {
    return {
      reply: `Our solutions are transparent and tailored around high return on value:

📱 **Social Media Management Monthly Plans:**
• **5 Posts**: K1,200/month
• **10 Posts**: K2,500/month
• **20 Posts**: K4,000/month
*(Every post includes a professional design + caption)*

💼 **Studio Retainers & Custom Packages:**
• **Starter Brand Spec**: K5,500 (Logo suite, 8 post designs, stationery, brand guide)
• **Growth Accelerator**: K12,500 (Full social media management, 4K Reels, 5-page website with 1-yr free cloud hosting)
• **Enterprise Suite**: K28,000 (Dedicated art director, videography, paid ad campaigns, priority dispatch)

Would you like to book a package or receive a customized formal proposal for your business?`,
      escalate: false,
      reason: ''
    };
  }

  // Location / Office / Zambia
  if (/where|location|office|located|lusaka|zambia|address/i.test(q)) {
    return {
      reply: `Vigorish Media is an independent 100% Zambian creative media and digital marketing studio located at Chibuluma Road, New Kasama, Lusaka, Zambia. We produce campaigns across Lusaka, the Copperbelt (Ndola, Kitwe), Livingstone, and serve corporate clients across Southern Africa and internationally.`,
      escalate: false,
      reason: ''
    };
  }

  // Video / Videography / Photography
  if (/video|videography|photo|photography|film|camera|shoot|drone/i.test(q)) {
    return {
      reply: `Our visual production department operates high-dynamic-range 4K cinema cameras, prime optics, and Hollywood-standard DaVinci Resolve color science. We produce brand commercials, documentary films, 9:16 high-converting social reels, executive leadership portraits, and multi-camera live corporate event coverage. Commercial edits are delivered in 5–7 business days.`,
      escalate: false,
      reason: ''
    };
  }

  // Websites
  if (/website|web design|web dev|developer|hosting|domain|seo/i.test(q)) {
    return {
      reply: `We engineer fast, mobile-first web platforms built for prestige and conversion. Every new custom website package comes with 12 months complimentary managed cloud infrastructure, SSL certificate, and domain renewal, along with on-page SEO optimized for Zambian and international search discovery.`,
      escalate: false,
      reason: ''
    };
  }

  // Tuli Bantu Baluse
  if (/tuli bantu|baluse|charity|community|philanthropy|youth/i.test(q)) {
    return {
      reply: `*Tuli Bantu Baluse* ("We Are People of Mercy") is Vigorish Media’s philanthropic initiative. We are dedicated to leaving Zambia better than we found it through free youth creative workshops, camera gear access, educational empowerment, and pro-bono media production for local registered non-profits.`,
      escalate: false,
      reason: ''
    };
  }

  // Contact info
  if (/contact|email|phone|call|whatsapp|reach/i.test(q)) {
    return {
      reply: `You can reach our creative team directly via phone at +260 97 989 4567, email at mediavigorish@gmail.com, or visit our physical studio at Chibuluma Road, New Kasama, Lusaka, Zambia. You can also chat right here in this live support interface, and I can notify a creative lead right now if you wish!`,
      escalate: false,
      reason: ''
    };
  }

  // Default answer with intelligent fallback
  return {
    reply: `Thank you for asking, ${clientName}. At Vigorish Media, we focus on building brands that add tangible value through high-octane visual storytelling, branding systems, social media, and web solutions. Could you tell me a little more about your brand or project goals? If you'd prefer to speak directly with our team, just let me know!`,
    escalate: false,
    reason: ''
  };
}

/**
 * Main AI response generator.
 * Uses Gemini 2.5 Flash with fallback to local studio engine.
 */
export async function generateAIResponse(
  session: ConversationSession,
  clientMessage: string
): Promise<{ replyText: string; shouldEscalate: boolean; escalationReason: string }> {
  const activeClientName = session.clientName || session.customerName || 'Client';
  const activeClientContact = session.clientContact || session.customerContact;

  // 1. Check escalation rule first
  const escCheck = checkEscalationIntent(clientMessage);
  if (escCheck.shouldEscalate) {
    return {
      replyText: `I’d like to make sure you get the right assistance, ${activeClientName}. I’ve notified our support team now, and someone will assist you shortly. In the meantime, please feel free to leave any extra details about your request.`,
      shouldEscalate: true,
      escalationReason: escCheck.reason
    };
  }

  const aiClient = getGenAIClient();

  // 2. If Gemini API key is configured, use official @google/genai SDK with gemini-2.5-flash
  if (aiClient) {
    try {
      const systemInstruction = `
You are the official ${CHAT_CONFIG.aiAssistantName} for ${CHAT_CONFIG.brandName} — an elite creative media, digital marketing, 4K cinema videography, and web architecture company headquartered at Chibuluma Road, New Kasama, Lusaka, Zambia.

CLIENT NAME: ${activeClientName}
CLIENT CONTACT: ${activeClientContact || 'Not provided'}
CURRENT CONVERSATION ID: ${session.conversationId}
WEBSITE PAGE: ${session.pageUrl}

CORE GUIDELINES:
1. Tone: Friendly, highly intelligent, concise, articulate, and premium. Reflect Apple-level craftsmanship.
2. Ground all answers strictly in this studio knowledge base:
${STUDIO_KNOWLEDGE_BASE}
3. Never hallucinate pricing or deliverable promises that aren't verified in the knowledge base.
4. If the client asks for a quote or custom scope, explain our offerings clearly and offer to notify the team to draft a formal proposal.
5. If the client asks to speak with a human representative, sounds upset, has an urgent custom contract or complaint, say:
"I’d like to make sure you get the right assistance. I’ve notified our support team now, and someone will assist you shortly."
CRITICAL: NEVER mention WhatsApp to the client. WhatsApp is strictly a background internal routing mechanism and must remain invisible to the client.
6. Remember previous messages in this conversation. Do not repeat greeting questions unnecessarily.
7. Keep responses concise (2 to 4 short paragraphs or bullet points). Avoid overwhelming walls of text.
`;

      // Build conversation history for multi-turn context
      const contents = session.messages.map(m => {
        const isClient = m.sender === 'client' || m.sender === 'customer';
        return {
          role: isClient ? 'user' : 'model',
          parts: [{ text: `${isClient ? activeClientName : 'Assistant'}: ${m.text}` }]
        };
      });

      // Add latest message
      contents.push({
        role: 'user',
        parts: [{ text: `${activeClientName}: ${clientMessage}` }]
      });

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents as any,
        config: {
          systemInstruction,
          temperature: 0.35,
          maxOutputTokens: 800
        }
      });

      const replyText = response.text || '';
      if (replyText.trim().length > 0) {
        // Double check if generated reply indicated escalation
        const generatedEsc = checkEscalationIntent(replyText);
        return {
          replyText: replyText.trim(),
          shouldEscalate: generatedEsc.shouldEscalate,
          escalationReason: generatedEsc.reason
        };
      }
    } catch (err: any) {
      console.warn('[Gemini API Call Failed, falling back to Local Studio Engine]:', err?.message || err);
    }
  }

  // 3. Fallback to local studio engine
  const localMatch = localKnowledgeMatch(clientMessage, activeClientName);
  return {
    replyText: localMatch.reply,
    shouldEscalate: localMatch.escalate,
    escalationReason: localMatch.reason
  };
}

/**
 * Generates an executive summary of the conversation for support alerts
 */
export async function generateConversationSummary(session: ConversationSession): Promise<string> {
  const activeClientName = session.clientName || session.customerName || 'Client';
  const clientMessages = session.messages.filter(m => m.sender === 'client' || m.sender === 'customer');
  if (clientMessages.length === 0) {
    return 'Client initiated chat session but did not submit queries.';
  }

  const aiClient = getGenAIClient();
  if (aiClient && session.messages.length > 2) {
    try {
      const summaryPrompt = `
Generate a concise 4-line client support summary for this conversation:
Client: ${activeClientName}
Messages:
${session.messages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')}

Format as:
MAIN TOPIC: ...
QUESTIONS ASKED: ...
AI RESOLUTION: ...
FOLLOW-UP NEEDED: (Yes/No)
`;
      const res = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }],
        config: { temperature: 0.2 }
      });
      if (res.text && res.text.trim()) {
        return res.text.trim();
      }
    } catch (e) {
      // fallback to manual summary below
    }
  }

  // Rule-based summary
  const topics = clientMessages.map(m => m.text).join(' | ');
  return `Client ${activeClientName} inquired about: "${topics.slice(0, 160)}...". Session status: ${session.status}. Total client inquiries: ${clientMessages.length}.`;
}
