import { getAuthToken } from '../lib/firebase';
import { AskMyPastResponse, SecurityTestResult, Summary, Insight } from '../types';

/**
 * Client API handler that securely routes requests to the server backend.
 * Never passes or accesses GEMINI_API_KEY from the browser.
 * Always attaches the user's cryptographically signed Firebase ID token.
 */

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData?.error) {
        errorMsg = errorData.error;
      }
    } catch {
      // Use fallback
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function sendChatMessage(payload: {
  conversationId: string;
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<{ reply: string }> {
  return request<{ reply: string }>('/api/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function generateSummary(payload: {
  conversationId: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<{
  title: string;
  summary: string;
  keyPoints: string[];
  topics: string[];
  actionItems: string[];
  goals: string[];
}> {
  return request('/api/summarize', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function generateInsights(payload: {
  journals: Array<{ title: string; text: string; date?: string }>;
}): Promise<{
  insights: Array<Omit<Insight, 'id' | 'ownerUid' | 'createdAt'>>;
}> {
  return request('/api/insights/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function askMyPast(payload: {
  query: string;
  journals: Array<{ conversationId: string; title: string; date: string; content: string }>;
}): Promise<AskMyPastResponse> {
  return request<AskMyPastResponse>('/api/ask', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function runSecurityTestSuite(): Promise<{ results: SecurityTestResult[] }> {
  return request<{ results: SecurityTestResult[] }>('/api/security/test', {
    method: 'POST',
  });
}
