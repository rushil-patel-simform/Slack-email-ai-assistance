export interface ParsedEmail {
  messageId: string;
  threadId: string;
  subject: string;
  sender: string;
  senderEmail: string;
  body: string;
  snippet: string;
  date: string;
}

export interface DraftCreationResult {
  draftId: string;
  threadId: string;
  messageId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
