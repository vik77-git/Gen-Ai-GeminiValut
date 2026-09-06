import { z } from 'zod';

export const ChatRequestSchema = z.object({
  conversationId: z.string().min(1).max(128),
  message: z.string().min(1).max(8000, "Message cannot exceed 8000 characters"),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().max(8000),
    })
  ).max(50, "History cannot exceed 50 messages").optional(),
});

export const SummarizeRequestSchema = z.object({
  conversationId: z.string().min(1).max(128),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().max(8000),
    })
  ).min(1, "At least one message is required to summarize").max(50),
});

export const InsightsRequestSchema = z.object({
  journals: z.array(
    z.object({
      title: z.string().max(250),
      text: z.string().max(10000),
      date: z.string().optional(),
    })
  ).min(1, "At least one journal entry is needed").max(30, "Context limited to 30 recent entries for free-tier optimization"),
});

export const AskMyPastRequestSchema = z.object({
  query: z.string().min(2, "Search query too short").max(1000, "Query cannot exceed 1000 characters"),
  journals: z.array(
    z.object({
      conversationId: z.string().max(128),
      title: z.string().max(250),
      date: z.string().max(100),
      content: z.string().max(10000),
    })
  ).max(25, "Maximum 25 entries analyzed per query to conserve free-tier tokens"),
});
