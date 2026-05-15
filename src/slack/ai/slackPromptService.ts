/**
 * OpenAI prompt service for Slack messages.
 * Generates concise, context-aware draft replies based on full conversation history.
 */
import OpenAI from 'openai';
import { config } from '../../config';
import { logger } from '../../utils/logger';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

const SYSTEM_PROMPT = `You are an AI assistant that drafts Slack replies on behalf of the user.

Rules:
- Sound like a real human Slack user, NOT a robot or assistant
- Keep replies short and conversational (1–3 sentences unless the question needs more)
- Match the tone: casual if the message is casual, professional if professional
- Use the conversation history to understand context, ongoing topics, and relationships
- Never start with "Certainly!", "Of course!", "Great question!" or hollow filler phrases
- Never mention you are an AI or that this is a draft
- Never use email-style formatting (no "Subject:", no "Dear X")
- Plain text only — no markdown headers, no bullet lists unless explicitly asked
- If there is a thread, understand what was already discussed and continue naturally
- If you lack context to give a useful answer, write a short clarifying question instead`;

export interface ConversationMessage {
  senderName: string;
  text:       string;
  isBot?:     boolean;
}

export interface SlackMessageContext {
  senderName:          string;
  ownerName:           string;           // name of the person we are drafting for (you)
  channelType:         'channel' | 'im' | 'mpim';
  messageText:         string;
  conversationHistory: ConversationMessage[];  // last N messages before this one
  threadHistory?:      ConversationMessage[];  // messages inside the thread (if any)
}

export async function generateSlackReply(ctx: SlackMessageContext): Promise<string> {

  // Format conversation history
  const formatHistory = (messages: ConversationMessage[]) =>
    messages.map(m => `[${m.senderName}]: ${m.text}`).join('\n');

  let historySection = '';
  if (ctx.conversationHistory.length > 0) {
    historySection = `\n\n--- Conversation history (oldest → newest) ---\n${formatHistory(ctx.conversationHistory)}`;
  }

  let threadSection = '';
  if (ctx.threadHistory && ctx.threadHistory.length > 0) {
    threadSection = `\n\n--- Thread so far ---\n${formatHistory(ctx.threadHistory)}`;
  }

  const channelLabel = ctx.channelType === 'im' ? 'direct message (DM)'
    : ctx.channelType === 'mpim' ? 'group DM'
    : 'channel';

  const userPrompt = `You are drafting a reply for ${ctx.ownerName} in a Slack ${channelLabel}.
${historySection}${threadSection}

--- New message from ${ctx.senderName} ---
"${ctx.messageText}"

Draft a natural reply for ${ctx.ownerName} to send:`;

  logger.info('Generating Slack AI draft', {
    sender: ctx.senderName,
    historyMsgs: ctx.conversationHistory.length,
    threadMsgs:  ctx.threadHistory?.length ?? 0,
    msgLen: ctx.messageText.length,
  });

  const completion = await openai.chat.completions.create({
    model:      config.openai.model,
    max_tokens: 400,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: userPrompt },
    ],
    temperature: 0.7,
  });

  const reply = completion.choices[0]?.message?.content?.trim() ?? '';
  logger.info('Slack AI draft generated', { tokensUsed: completion.usage?.total_tokens });
  return reply;
}
