export type ConversationStatus = 'AI_ACTIVE' | 'HUMAN_REQUESTED' | 'HUMAN_ACTIVE' | 'RESOLVED';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'client' | 'customer' | 'agent' | 'system';
  senderName?: string;
  text: string;
  timestamp: string; // ISO string
  escalationTriggered?: boolean;
}

export interface ConversationSession {
  conversationId: string;
  clientName: string;
  clientContact?: string;
  customerName?: string;
  customerContact?: string;
  pageUrl: string;
  startedAt: string;
  lastActiveAt: string;
  status: ConversationStatus;
  messages: ChatMessage[];
  escalated: boolean;
  escalationReason?: string;
  escalatedAt?: string;
  summary?: string;
  outboundAlerts: OutboundAlertRecord[];
}

export interface OutboundAlertRecord {
  id: string;
  alertType: 'NEW_CHAT' | 'ESCALATION' | 'CONVERSATION_TRAIL' | 'SUMMARY' | 'CUSTOM';
  recipientPhone: string;
  dispatchedAt: string;
  deliveredStatus: 'SENT' | 'SIMULATED_LOGGED' | 'FAILED';
  payloadSummary: string;
  rawPayload?: any;
  error?: string;
}

export interface StartChatRequest {
  clientName?: string;
  clientContact?: string;
  customerName?: string;
  customerContact?: string;
  pageUrl?: string;
}

export interface SendMessageRequest {
  conversationId: string;
  message: string;
  pageUrl?: string;
}

export interface EscalateRequest {
  conversationId: string;
  reason?: string;
}

export interface EndChatRequest {
  conversationId: string;
  feedback?: string;
}

export interface AdminReplyRequest {
  conversationId: string;
  agentName: string;
  message: string;
}
