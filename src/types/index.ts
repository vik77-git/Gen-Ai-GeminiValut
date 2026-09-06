export type UserRole = 'user' | 'assistant';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: UserRole;
  content: string;
  createdAt: number;
}

export interface Conversation {
  id: string;
  ownerUid: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount?: number;
  latestSummary?: string;
}

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface Summary {
  id: string;
  conversationId: string;
  ownerUid: string;
  title: string;
  summary: string;
  keyPoints: string[];
  topics: string[];
  actionItems: string[];
  goals: string[];
  createdAt: number;
}

export type InsightType = 'topic' | 'goal' | 'blocker' | 'suggested_action' | 'pattern';

export interface Insight {
  id: string;
  ownerUid: string;
  type: InsightType;
  title: string;
  description: string;
  evidence: string;
  suggestedAction?: string;
  createdAt: number;
}

export interface AskMyPastRequest {
  query: string;
  limitEntries?: number;
}

export interface JournalCitation {
  conversationId: string;
  title: string;
  date: string;
  excerpt: string;
}

export interface AskMyPastResponse {
  answer: string;
  grounded: boolean;
  confidence: 'high' | 'moderate' | 'not_found';
  citations: JournalCitation[];
}

export interface SecurityTestResult {
  id: string;
  title: string;
  description: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  httpStatus?: number;
  details: string;
}
