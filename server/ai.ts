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
 * Checks if customer's message contains human escalation triggers
 */
export function checkEscalationIntent(text: string): { shouldEscalate: boolean; reason: string } {
  const normalized = text.toLowerCase().trim();

  for (const trigger of CHAT_CONFIG.escalationTriggers) {
    if (normalized.includes(trigger)) {
      return {
        shouldEscalate: true,
        reason: `Customer triggered escalation with phrase matching: "${trigger}"`
      };
    }
  }

  // Regex patterns for human requests
  if (/\b(human|person|agent|representative|advisor|manager|call me)\b/i.test(normalized)) {
    return {
      shouldEscalate: true,
      reason: 'Customer explicitly asked to speak with a human team member'
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
function localKnowledgeMatch(userText: string, customerName: string): { reply: string; escalate: boolean; reason: string } {
  const q = userText.toLowerCase();

  // Check escalation
  const esc = checkEscalationIntent(q);
  if (esc.shouldEscalate) {
    return {
      reply: `I’d like to make sure you get the right assistance, ${customerName}. I’ve notified our support team now, and someone will assist you shortly. In the meantime, feel free to share any specific requirements or details here.`,
      escalate: true,
      reason: esc.reason
    };
  }

  // Greetings
  if (/^(hi|hello|hey|good day|muli bwanji|greetings)/i.test(q)) {
    return {
      reply: `Hello ${customerName}! 👋 How can I help you today? Whether you're exploring our 4K video productions, social media management retainers, bespoke branding, or web platforms, I'm at your service.`,
      escalate: false,
      reason: ''
    };
  }

  // Services inquiry
  if (/services|capabilities|what do you do|what do you offer/i.test(q)) {
    return {
      reply: `At Vigorish Media, we offer six specialized creative pillars:
1. **Social Media Management**: Turnkey content calendars, Reels & TikTok video scripts, and community growth.
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

  // Pricing / Cost
  if (/price|pricing|cost|how much|quote|rates|packages/i.test(q)) {
    return {
      reply: `Our solutions are tailored around your exact project deliverables and scale. We offer transparent starter tiers, comprehensive growth bundles, and custom corporate retainers. 

For example:
- **Social Media Retainers** include 16–24 custom visual assets/month, weekly scripted reels, and daily moderation.
- **Custom Website Projects** include 12 months complimentary managed cloud hosting, SSL, and domain registration.

Would you like me to connect you with our team to receive a tailored formal proposal for your scope?`,
      escalate: false,
      reason: ''
    };
  }

  // Location / Office / Zambia
  if (/where|location|office|located|lusaka|zambia|address/i.test(q)) {
    return {
      reply: `Vigorish Media is an independent 100% Zambian creative media and digital marketing studio proudly headquartered in Lusaka, Zambia. We produce campaigns across Lusaka, the Copperbelt (Ndola, Kitwe), Livingstone, and serve corporate clients across Southern Africa and internationally.`,
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
      reply: `You can reach our creative team directly via phone at +260 97 989 4567, email at mediavigorish@gmail.com, or right here in this live support interface. I can also notify a creative lead right now if you wish!`,
      escalate: false,
      reason: ''
    };
  }

  // Default answer with intelligent fallback
  return {
    reply: `Thank you for asking, ${customerName}. At Vigorish Media, we focus on building brands that add tangible value through high-octane visual storytelling, branding systems, social media, and web solutions. Could you tell me a little more about your brand or project goals? If you'd prefer to speak directly with our team, just let me know!`,
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
  customerMessage: string
): Promise<{ replyText: string; shouldEscalate: boolean; escalationReason: string }> {
  // 1. Check escalation rule first
  const escCheck = checkEscalationIntent(customerMessage);
  if (escCheck.shouldEscalate) {
    return {
      replyText: `I’d like to make sure you get the right assistance, ${session.customerName}. I’ve notified our support team now, and someone will assist you shortly. In the meantime, please feel free to leave any extra details about your request.`,
      shouldEscalate: true,
      escalationReason: escCheck.reason
    };
  }

  const aiClient = getGenAIClient();

  // 2. If Gemini API key is configured, use official @google/genai SDK with gemini-2.5-flash
  if (aiClient) {
    try {
      const systemInstruction = `
You are the official ${CHAT_CONFIG.aiAssistantName} for ${CHAT_CONFIG.brandName} — an elite creative media, digital marketing, 4K cinema videography, and web architecture company headquartered in Lusaka, Zambia.

CUSTOMER NAME: ${session.customerName}
CUSTOMER CONTACT: ${session.customerContact || 'Not provided'}
CURRENT CONVERSATION ID: ${session.conversationId}
WEBSITE PAGE: ${session.pageUrl}

CORE GUIDELINES:
1. Tone: Friendly, highly intelligent, concise, articulate, and premium. Reflect Apple-level craftsmanship.
2. Ground all answers strictly in this studio knowledge base:
${STUDIO_KNOWLEDGE_BASE}
3. Never hallucinate pricing or deliverable promises that aren't verified in the knowledge base.
4. If the customer asks for a quote or custom scope, explain our offerings clearly and offer to notify the team to draft a formal proposal.
5. If the customer asks to speak with a human representative, sounds upset, has an urgent custom contract or complaint, say:
"I’d like to make sure you get the right assistance. I’ve notified our support team now, and someone will assist you shortly."
CRITICAL: NEVER mention WhatsApp to the customer. WhatsApp is strictly a background internal routing mechanism and must remain invisible to the client.
6. Remember previous messages in this conversation. Do not repeat greeting questions unnecessarily.
7. Keep responses concise (2 to 4 short paragraphs or bullet points). Avoid overwhelming walls of text.
`;

      // Build conversation history for multi-turn context
      const contents = session.messages.map(m => ({
        role: m.sender === 'customer' ? 'user' : 'model',
        parts: [{ text: `${m.sender === 'customer' ? session.customerName : 'Assistant'}: ${m.text}` }]
      }));

      // Add latest message
      contents.push({
        role: 'user',
        parts: [{ text: `${session.customerName}: ${customerMessage}` }]
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
  const localMatch = localKnowledgeMatch(customerMessage, session.customerName);
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
  const customerMessages = session.messages.filter(m => m.sender === 'customer');
  if (customerMessages.length === 0) {
    return 'Customer initiated chat session but did not submit queries.';
  }

  const aiClient = getGenAIClient();
  if (aiClient && session.messages.length > 2) {
    try {
      const summaryPrompt = `
Generate a concise 4-line customer support summary for this conversation:
Customer: ${session.customerName}
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
  const topics = customerMessages.map(m => m.text).join(' | ');
  return `Customer ${session.customerName} inquired about: "${topics.slice(0, 160)}...". Session status: ${session.status}. Total customer inquiries: ${customerMessages.length}.`;
}
