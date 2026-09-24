import dotenv from 'dotenv';
dotenv.config();

export const CHAT_CONFIG = {
  // Brand & AI Identity
  brandName: 'Vigorish Media',
  aiAssistantName: 'Vigorish AI Concierge',
  aiSubtitle: 'Live Studio Intelligence',
  welcomeGreeting: 'Hello 👋 I’m your AI Support Assistant at Vigorish Media. I can answer questions about our 4K video productions, branding systems, social media management, and web architecture, or immediately connect you with our creative team.',
  namePromptHeading: 'Before we get started, what should we call you?',
  namePromptSubtext: 'Connect to our live studio intelligence. We’ll personalize your session and notify our team if needed.',
  
  // Physical Studio Address
  studioAddress: 'Chibuluma Road, New Kasama, Lusaka, Zambia',
  
  // WhatsApp Notification Target
  // Default support WhatsApp phone number as explicitly mandated by user
  supportWhatsAppNumber: process.env.WHATSAPP_RECIPIENT_PHONE || '+260979894567',

  // Meta WhatsApp Cloud API credentials
  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    apiVersion: 'v19.0',
    enabled: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)
  },

  // Suggested questions presented in the UI
  suggestedQuestions: [
    'What services do you offer?',
    'How much does a brand identity cost?',
    'Do you deliver 4K video productions?',
    'Where is your studio located?',
    'Can I speak with a human representative?',
    'Tell me about Tuli Bantu Baluse'
  ],

  // Escalation detection rules
  escalationTriggers: [
    'speak to someone',
    'speak to a person',
    'speak to human',
    'human support',
    'human representative',
    'talk to agent',
    'talk to a person',
    'real person',
    'agent',
    'representative',
    'client care',
    'customer care',
    'call me',
    'complaint',
    'angry',
    'frustrated',
    'unhappy',
    'problem with order',
    'payment issue',
    'invoice inquiry',
    'manager',
    'urgent project',
    'custom contract',
    'nda',
    'hire you today'
  ],

  // Studio Operating Hours (CAT - Central Africa Time, UTC+2)
  businessHours: {
    timezone: 'Africa/Lusaka',
    openHour: 8,
    closeHour: 18,
    workDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
    offlineMessage: 'Our creative studio team is currently offline (Operating hours: 08:00–18:00 CAT), but I’m still here to assist you 24/7. Your messages are automatically logged and our team will follow up promptly.'
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequestsPerWindow: 45 // 45 messages/min per IP
  }
};
