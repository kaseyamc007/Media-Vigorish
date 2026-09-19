import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { CHAT_CONFIG } from './server/config';
import {
  createConversation,
  getConversation,
  addMessage,
  updateConversationStatus,
  getAllConversations,
  checkRateLimit
} from './server/store';
import {
  generateAIResponse,
  generateConversationSummary
} from './server/ai';
import {
  dispatchWhatsAppAlert,
  formatNewChatAlert,
  formatEscalationAlert,
  formatSummaryAlert
} from './server/whatsapp';
import { StartChatRequest, SendMessageRequest, EscalateRequest, EndChatRequest, AdminReplyRequest } from './server/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser & security headers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/chat')) {
      console.log(`[API ${req.method}] ${req.path}`);
    }
    next();
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Vigorish Media Live Support & AI Engine',
      timestamp: new Date().toISOString(),
      whatsappConfigured: CHAT_CONFIG.whatsapp.enabled,
      targetWhatsAppNumber: CHAT_CONFIG.supportWhatsAppNumber
    });
  });

  // 1. GET /api/chat/config
  // Public UI configuration for client
  app.get('/api/chat/config', (req: Request, res: Response) => {
    const hour = new Date().getUTCHours() + 2; // Central Africa Time (CAT) is UTC+2
    const day = new Date().getUTCDay(); // 0 is Sun, 1-6 Mon-Sat
    const isWithinHours = day >= 1 && day <= 6 && hour >= 8 && hour < 18;

    res.json({
      brandName: CHAT_CONFIG.brandName,
      assistantName: CHAT_CONFIG.aiAssistantName,
      subtitle: CHAT_CONFIG.aiSubtitle,
      welcomeGreeting: CHAT_CONFIG.welcomeGreeting,
      namePromptHeading: CHAT_CONFIG.namePromptHeading,
      namePromptSubtext: CHAT_CONFIG.namePromptSubtext,
      suggestedQuestions: CHAT_CONFIG.suggestedQuestions,
      isHumanSupportOnline: isWithinHours,
      offlineNotice: isWithinHours ? null : CHAT_CONFIG.businessHours.offlineMessage
    });
  });

  // 2. POST /api/chat/start
  // Creates a unique conversation session with customer name
  app.post('/api/chat/start', (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
    }

    const { customerName, customerContact, pageUrl } = req.body as StartChatRequest;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ error: 'Customer name is required before starting chat.' });
    }

    const sanitizedName = customerName.trim().slice(0, 50);
    const session = createConversation(sanitizedName, customerContact, pageUrl || '/');

    // Generate personalized first greeting from AI
    const personalGreeting = `Hi ${sanitizedName} 👋 Welcome! I’m your AI Support Assistant. How can I help you today?`;
    const aiMessage = addMessage(session.conversationId, 'ai', personalGreeting, CHAT_CONFIG.aiAssistantName);

    console.log(`[Chat Started] ID: ${session.conversationId} | Client: ${sanitizedName}`);

    return res.json({
      success: true,
      conversationId: session.conversationId,
      customerName: session.customerName,
      status: session.status,
      welcomeMessage: aiMessage
    });
  });

  // 3. POST /api/chat/message
  // Receives user message, generates AI response, checks escalation, dispatches background WhatsApp alert
  app.post('/api/chat/message', async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment before sending another message.' });
    }

    const { conversationId, message } = req.body as SendMessageRequest;

    if (!conversationId || !message || !message.trim()) {
      return res.status(400).json({ error: 'Conversation ID and message are required.' });
    }

    const session = getConversation(conversationId);
    if (!session) {
      return res.status(404).json({ error: 'Conversation session expired or not found.' });
    }

    const trimmedMsg = message.trim().slice(0, 1500);

    // Save customer message
    const userMsg = addMessage(conversationId, 'customer', trimmedMsg, session.customerName);

    // Count how many customer messages have been sent so far
    const customerMsgCount = session.messages.filter(m => m.sender === 'customer').length;

    // Generate AI response with context memory
    const aiResult = await generateAIResponse(session, trimmedMsg);

    // If human escalation triggered
    if (aiResult.shouldEscalate && session.status !== 'HUMAN_REQUESTED' && session.status !== 'HUMAN_ACTIVE') {
      updateConversationStatus(conversationId, 'HUMAN_REQUESTED', aiResult.escalationReason);
      
      // Dispatch immediate background escalation alert to WhatsApp (+260979894567)
      const escalationAlertText = formatEscalationAlert(session, aiResult.escalationReason, trimmedMsg);
      dispatchWhatsAppAlert(session, 'ESCALATION', escalationAlertText).catch(e => console.error(e));
    } else if (customerMsgCount === 1) {
      // First customer inquiry: Dispatch "New Website Support Chat" notification to support WhatsApp
      const newChatAlertText = formatNewChatAlert(session, trimmedMsg, aiResult.replyText);
      dispatchWhatsAppAlert(session, 'NEW_CHAT', newChatAlertText).catch(e => console.error(e));
    }

    // Save AI response
    const aiMsg = addMessage(
      conversationId,
      'ai',
      aiResult.replyText,
      CHAT_CONFIG.aiAssistantName,
      aiResult.shouldEscalate
    );

    return res.json({
      success: true,
      message: aiMsg,
      status: session.status,
      escalated: session.escalated
    });
  });

  // 4. POST /api/chat/escalate
  // Explicit escalation requested by customer
  app.post('/api/chat/escalate', async (req: Request, res: Response) => {
    const { conversationId, reason } = req.body as EscalateRequest;

    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required.' });
    }

    const session = getConversation(conversationId);
    if (!session) {
      return res.status(404).json({ error: 'Conversation session not found.' });
    }

    const escReason = reason || 'Customer clicked Speak with a Human Representative';
    updateConversationStatus(conversationId, 'HUMAN_REQUESTED', escReason);

    const latestCustomerMsg = [...session.messages].reverse().find(m => m.sender === 'customer')?.text || 'Customer requested direct live support.';

    // Send WhatsApp notification in background
    const alertText = formatEscalationAlert(session, escReason, latestCustomerMsg);
    await dispatchWhatsAppAlert(session, 'ESCALATION', alertText);

    // Add confirmation message in chat
    const confirmText = `I’ve notified our support team now, ${session.customerName}. A creative lead is reviewing your conversation and someone will assist you shortly.`;
    const aiMsg = addMessage(conversationId, 'ai', confirmText, CHAT_CONFIG.aiAssistantName, true);

    return res.json({
      success: true,
      status: session.status,
      message: aiMsg
    });
  });

  // 5. POST /api/chat/notify
  // Triggers custom or periodic conversation trail alert
  app.post('/api/chat/notify', async (req: Request, res: Response) => {
    const { conversationId } = req.body;
    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID required.' });
    }
    const session = getConversation(conversationId);
    if (!session) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    const recentTrail = session.messages
      .slice(-6)
      .map(m => `${m.sender.toUpperCase()}: ${m.text}`)
      .join('\n\n');

    const messageBody = `━━━━━━━━━━━━━━━━━━
🔔 CONVERSATION TRAIL UPDATE
━━━━━━━━━━━━━━━━━━
👤 Customer: ${session.customerName}
🆔 Conversation: ${session.conversationId}
📌 Status: ${session.status}
━━━━━━━━━━━━━━━━━━
${recentTrail}
━━━━━━━━━━━━━━━━━━`;

    const alert = await dispatchWhatsAppAlert(session, 'CONVERSATION_TRAIL', messageBody);
    res.json({ success: true, alert });
  });

  // 6. POST /api/chat/end
  // Resolves conversation, generates summary, dispatches WhatsApp summary
  app.post('/api/chat/end', async (req: Request, res: Response) => {
    const { conversationId } = req.body as EndChatRequest;
    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID required.' });
    }
    const session = getConversation(conversationId);
    if (!session) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    updateConversationStatus(conversationId, 'RESOLVED');

    // Generate summary
    const summaryText = await generateConversationSummary(session);
    session.summary = summaryText;

    // Send final summary alert to WhatsApp
    const alertBody = formatSummaryAlert(session, summaryText);
    await dispatchWhatsAppAlert(session, 'SUMMARY', alertBody);

    const closeMsg = addMessage(
      conversationId,
      'system',
      'Conversation resolved. Thank you for connecting with Vigorish Media! You can start a new chat anytime.',
      'System'
    );

    res.json({
      success: true,
      status: session.status,
      summary: summaryText,
      message: closeMsg
    });
  });

  // 7. GET /api/chat/status
  // Polls conversation status and latest messages (allows live updates when agent replies)
  app.get('/api/chat/status', (req: Request, res: Response) => {
    const conversationId = req.query.conversationId as string;
    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId query param is required' });
    }
    const session = getConversation(conversationId);
    if (!session) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      conversationId: session.conversationId,
      customerName: session.customerName,
      status: session.status,
      escalated: session.escalated,
      messages: session.messages,
      lastActiveAt: session.lastActiveAt
    });
  });

  // 8. GET /api/chat/admin/conversations
  // Inspection endpoint for active sessions, conversation trails, and WhatsApp alert audit logs
  app.get('/api/chat/admin/conversations', (req: Request, res: Response) => {
    const list = getAllConversations();
    res.json({
      total: list.length,
      targetWhatsAppNumber: CHAT_CONFIG.supportWhatsAppNumber,
      conversations: list
    });
  });

  // 9. POST /api/chat/admin/reply
  // Allows human support representative to reply directly into live chat session
  app.post('/api/chat/admin/reply', (req: Request, res: Response) => {
    const { conversationId, agentName, message } = req.body as AdminReplyRequest;
    if (!conversationId || !message) {
      return res.status(400).json({ error: 'conversationId and message are required' });
    }
    const session = getConversation(conversationId);
    if (!session) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    updateConversationStatus(conversationId, 'HUMAN_ACTIVE');
    const agentMsg = addMessage(conversationId, 'agent', message.trim(), agentName || 'Support Representative');

    res.json({
      success: true,
      message: agentMsg,
      status: session.status
    });
  });

  // Vite middleware for development, or static files in production
  const isProduction = process.env.NODE_ENV === 'production' || 
                       (typeof __filename !== 'undefined' && __filename.endsWith('.cjs')) || 
                       Boolean(process.argv[1] && (process.argv[1].includes('dist') || process.argv[1].endsWith('.cjs')));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Vigorish AI Support Server] running on http://0.0.0.0:${PORT}`);
    console.log(`[WhatsApp Notifications Target] ${CHAT_CONFIG.supportWhatsAppNumber}`);
  });
}

startServer().catch(err => {
  console.error('[Server Startup Error]', err);
  process.exit(1);
});
