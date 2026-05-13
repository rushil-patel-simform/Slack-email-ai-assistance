import OpenAI from 'openai';
import { config } from '../config';
import { ParsedEmail } from '../types';
import { truncate } from '../utils/emailUtils';
import { logger } from '../utils/logger';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

const SYSTEM_PROMPT = `You are a professional email assistant. Your task is to write concise, 
polite, and professional email replies on behalf of the user. 

Guidelines:
- Keep replies concise (3-5 sentences unless more detail is needed)
- Match the tone of the original email (formal or casual)
- Be helpful and constructive
- Do NOT include a subject line - only the email body
- Do NOT include greetings like "Dear [Name]" unless context makes it natural
- Sign off appropriately
- Never mention that you are an AI`;

/**
 * Generates a professional email reply using OpenAI.
 */
export async function generateEmailReply(
  email: ParsedEmail,
  tone: 'professional' | 'friendly' | 'concise' = 'professional',
): Promise<string> {
  const truncatedBody = truncate(email.body, 3000);

  const userPrompt = `Please write a ${tone} email reply to the following email:

From: ${email.sender}
Subject: ${email.subject}
Date: ${email.date}

Email Body:
${truncatedBody}

Write only the reply body. Do not include subject line or email headers.`;

  logger.info('Generating AI reply', { subject: email.subject, sender: email.senderEmail });

  const completion = await openai.chat.completions.create({
    model: config.openai.model,
    max_tokens: config.openai.maxTokens,
    temperature: 0.7,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  });

  const reply = completion.choices[0]?.message?.content;
  if (!reply) throw new Error('OpenAI returned an empty response');

  logger.info('AI reply generated successfully', {
    subject: email.subject,
    tokensUsed: completion.usage?.total_tokens,
  });

  return reply.trim();
}
