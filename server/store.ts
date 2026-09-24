import fs from 'fs';
import path from 'path';
import { ConversationSession, ChatMessage, ConversationStatus } from './types';
import { CHAT_CONFIG } from './config';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'conversations.json');

// In-memory sessions storage
const sessions = new Map<string, ConversationSession>();

// Rate limit tracker: IP -> Array of timestamps (ms)
const ipRequestTimestamps = new Map<string, number[]>();

/**
 * Ensures data directory and initial persistence file exist
 */
function ensureStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      if (raw.trim()) {
        const list: ConversationSession[] = JSON.parse(raw);
        for (const item of list) {
          sessions.set(item.conversationId, item);
        }
      }
    }
  } catch (err) {
    console.warn('[Conversation Store Persistence Notice]', err);
  }
}

// Initialize on module load
ensureStorage();

/**
 * Saves current in-memory sessions to disk asynchronously
 */
function persistSessions() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const all = Array.from(sessions.values());
    fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Persistence Write Error]', err);
  }
}

/**
 * Generates an official unique conversation ID (e.g. CHAT-20260917-4821)
 */
export function generateConversationId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CHAT-${dateStr}-${randomSuffix}`;
}

/**
 * Checks IP rate limit
 */
export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = CHAT_CONFIG.rateLimit.windowMs;
  const max = CHAT_CONFIG.rateLimit.maxRequestsPerWindow;

  let timestamps = ipRequestTimestamps.get(ip) || [];
  // filter out timestamps older than window
  timestamps = timestamps.filter(t => now - t < windowMs);

  if (timestamps.length >= max) {
    ipRequestTimestamps.set(ip, timestamps);
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  ipRequestTimestamps.set(ip, timestamps);
  return { allowed: true, remaining: max - timestamps.length };
}

/**
 * Creates a new conversation session
 */
export function createConversation(
  clientName: string,
  clientContact?: string,
  pageUrl: string = '/'
): ConversationSession {
  const conversationId = generateConversationId();
  const nowIso = new Date().toISOString();
  const trimmedName = clientName.trim() || 'Visitor';
  const trimmedContact = clientContact?.trim() || undefined;

  const session: ConversationSession = {
    conversationId,
    clientName: trimmedName,
    clientContact: trimmedContact,
    customerName: trimmedName,
    customerContact: trimmedContact,
    pageUrl,
    startedAt: nowIso,
    lastActiveAt: nowIso,
    status: 'AI_ACTIVE',
    messages: [],
    escalated: false,
    outboundAlerts: []
  };

  sessions.set(conversationId, session);
  persistSessions();
  return session;
}

/**
 * Retrieves a conversation by ID
 */
export function getConversation(conversationId: string): ConversationSession | undefined {
  return sessions.get(conversationId);
}

/**
 * Appends a message to a conversation
 */
export function addMessage(
  conversationId: string,
  sender: ChatMessage['sender'],
  text: string,
  senderName?: string,
  escalationTriggered?: boolean
): ChatMessage {
  const session = sessions.get(conversationId);
  if (!session) {
    throw new Error(`Conversation not found: ${conversationId}`);
  }

  const msgId = `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const message: ChatMessage = {
    id: msgId,
    sender,
    senderName,
    text,
    timestamp: new Date().toISOString(),
    escalationTriggered
  };

  session.messages.push(message);
  session.lastActiveAt = message.timestamp;
  persistSessions();

  return message;
}

/**
 * Updates conversation status (e.g. to HUMAN_REQUESTED, HUMAN_ACTIVE, RESOLVED)
 */
export function updateConversationStatus(
  conversationId: string,
  status: ConversationStatus,
  reason?: string
): ConversationSession | undefined {
  const session = sessions.get(conversationId);
  if (!session) return undefined;

  session.status = status;
  if (status === 'HUMAN_REQUESTED' || status === 'HUMAN_ACTIVE') {
    session.escalated = true;
    session.escalationReason = reason || session.escalationReason || 'Human support requested';
    session.escalatedAt = new Date().toISOString();
  }
  persistSessions();
  return session;
}

/**
 * Lists all conversations (most recent first)
 */
export function getAllConversations(): ConversationSession[] {
  return Array.from(sessions.values()).sort(
    (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
  );
}
