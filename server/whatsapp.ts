import { CHAT_CONFIG } from './config';
import { ConversationSession, OutboundAlertRecord } from './types';

/**
 * Normalizes phone numbers to international format (e.g. +260979894567 -> 260979894567 for WhatsApp Cloud API)
 */
function normalizeWhatsAppPhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Sends a real message using Meta WhatsApp Business Cloud API.
 * Uses official Graph API endpoint: https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages
 */
async function sendMetaWhatsAppMessage(toPhone: string, textBody: string): Promise<{ success: boolean; responseId?: string; error?: string }> {
  const { accessToken, phoneNumberId, apiVersion } = CHAT_CONFIG.whatsapp;

  if (!accessToken || !phoneNumberId) {
    return {
      success: false,
      error: 'WhatsApp credentials not configured (WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID missing)'
    };
  }

  const cleanTo = normalizeWhatsAppPhone(toPhone);
  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanTo,
    type: 'text',
    text: {
      preview_url: false,
      body: textBody
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json() as any;

    if (!res.ok) {
      const errMsg = data?.error?.message || `WhatsApp API error HTTP ${res.status}`;
      console.error('[WhatsApp Cloud API Error]', errMsg, data);
      return { success: false, error: errMsg };
    }

    const messageId = data?.messages?.[0]?.id || 'WA-MSG-OK';
    console.log(`[WhatsApp Cloud API Success] Message dispatched to ${cleanTo}, ID: ${messageId}`);
    return { success: true, responseId: messageId };
  } catch (err: any) {
    console.error('[WhatsApp Network Failure]', err?.message || err);
    return { success: false, error: err?.message || 'Network dispatch failure' };
  }
}

/**
 * Core WhatsApp notification dispatcher.
 * Handles official Cloud API delivery with graceful fallback logging for local/preview environments.
 */
export async function dispatchWhatsAppAlert(
  session: ConversationSession,
  alertType: OutboundAlertRecord['alertType'],
  formattedMessage: string
): Promise<OutboundAlertRecord> {
  const recipient = CHAT_CONFIG.supportWhatsAppNumber;
  const alertId = `ALERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const nowIso = new Date().toISOString();

  console.log(`\n================== [WHATSAPP DISPATCH TO ${recipient}] ==================`);
  console.log(`TYPE: ${alertType} | CONVERSATION: ${session.conversationId} | CLIENT: ${session.customerName}`);
  console.log(formattedMessage);
  console.log('=======================================================================\n');

  let deliveryStatus: OutboundAlertRecord['deliveredStatus'] = 'SIMULATED_LOGGED';
  let errorDetail: string | undefined;

  if (CHAT_CONFIG.whatsapp.enabled) {
    const apiResult = await sendMetaWhatsAppMessage(recipient, formattedMessage);
    if (apiResult.success) {
      deliveryStatus = 'SENT';
    } else {
      deliveryStatus = 'FAILED';
      errorDetail = apiResult.error;
    }
  } else {
    deliveryStatus = 'SIMULATED_LOGGED';
    errorDetail = 'Running in preview/development mode. Configure WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env for live Meta delivery.';
  }

  const alertRecord: OutboundAlertRecord = {
    id: alertId,
    alertType,
    recipientPhone: recipient,
    dispatchedAt: nowIso,
    deliveredStatus: deliveryStatus,
    payloadSummary: formattedMessage.slice(0, 300) + '...',
    rawPayload: { body: formattedMessage },
    error: errorDetail
  };

  session.outboundAlerts.push(alertRecord);
  return alertRecord;
}

/**
 * Formats a "New Website Support Chat" WhatsApp alert
 */
export function formatNewChatAlert(session: ConversationSession, firstMessage: string, aiGreeting: string): string {
  const dateFormatted = new Date().toLocaleString('en-GB', {
    timeZone: CHAT_CONFIG.businessHours.timezone,
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const contactLine = session.customerContact ? `\n📞 Contact: ${session.customerContact}` : '';

  return `━━━━━━━━━━━━━━━━━━
🔔 NEW WEBSITE SUPPORT CHAT
━━━━━━━━━━━━━━━━━━

👤 Customer:
${session.customerName}${contactLine}

🆔 Conversation:
${session.conversationId}

🕒 Started:
${dateFormatted} (CAT)

📍 Source:
Vigorish Media Live Support (${session.pageUrl || 'Home'})

━━━━━━━━━━━━━━━━━━

💬 CUSTOMER MESSAGE:
"${firstMessage}"

━━━━━━━━━━━━━━━━━━

🤖 AI RESPONSE:
"${aiGreeting.slice(0, 400)}"

━━━━━━━━━━━━━━━━━━

📌 STATUS:
AI SUPPORT ACTIVE (Monitoring)
━━━━━━━━━━━━━━━━━━`;
}

/**
 * Formats an urgent "Human Support Escalation" WhatsApp alert
 */
export function formatEscalationAlert(
  session: ConversationSession,
  reason: string,
  latestCustomerMessage: string
): string {
  const dateFormatted = new Date().toLocaleString('en-GB', {
    timeZone: CHAT_CONFIG.businessHours.timezone,
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const contactLine = session.customerContact ? `\n📞 Client Contact: ${session.customerContact}` : '';

  // Get last 4 messages for context trail
  const recentTrail = session.messages
    .slice(-5)
    .map(m => `${m.sender.toUpperCase()} (${m.senderName || m.sender}):\n"${m.text}"`)
    .join('\n\n');

  return `━━━━━━━━━━━━━━━━━━
🚨 HUMAN SUPPORT REQUEST
━━━━━━━━━━━━━━━━━━

👤 Customer:
${session.customerName}${contactLine}

🆔 Conversation ID:
${session.conversationId}

🕒 Escalated:
${dateFormatted} (CAT)

⚠️ Trigger Reason:
${reason}

━━━━━━━━━━━━━━━━━━

💬 LATEST MESSAGE:
"${latestCustomerMessage}"

━━━━━━━━━━━━━━━━━━

📜 RECENT CONVERSATION TRAIL:
${recentTrail}

━━━━━━━━━━━━━━━━━━

📌 ACTION REQUIRED:
Customer is waiting in live chat on the website.
Please review conversation or reply directly!
━━━━━━━━━━━━━━━━━━`;
}

/**
 * Formats an end-of-chat or inactive conversation summary alert
 */
export function formatSummaryAlert(
  session: ConversationSession,
  summaryText: string
): string {
  const durationMinutes = Math.max(1, Math.round((new Date().getTime() - new Date(session.startedAt).getTime()) / 60000));

  return `━━━━━━━━━━━━━━━━━━
📋 CONVERSATION SUMMARY & AUDIT
━━━━━━━━━━━━━━━━━━

👤 Customer: ${session.customerName}
🆔 Conversation ID: ${session.conversationId}
⏱️ Session Duration: ~${durationMinutes} mins
📊 Total Messages: ${session.messages.length}
📌 Final Status: ${session.status}

━━━━━━━━━━━━━━━━━━

📝 AI EXECUTIVE SUMMARY:
${summaryText}

━━━━━━━━━━━━━━━━━━

📍 Source: ${session.pageUrl || 'Website Live Support'}
Vigorish Media Automated Support Engine
━━━━━━━━━━━━━━━━━━`;
}
