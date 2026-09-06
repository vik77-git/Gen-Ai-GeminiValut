import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { 
  Search, 
  Sparkles, 
  Loader2, 
  ShieldCheck, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  ArrowRight,
  Clock
} from 'lucide-react';
import { UserProfile, AskMyPastResponse } from '../types';
import { getConversations, getMessages } from '../services/conversation-service';
import { askMyPast } from '../services/api-client';

interface AskMyPastProps {
  user: UserProfile;
}

export const AskMyPast: React.FC<AskMyPastProps> = ({ user }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [response, setResponse] = useState<AskMyPastResponse | null>(null);

  const sampleQueries = [
    "What projects have I discussed recently?",
    "What goals keep appearing in my journal?",
    "Did I mention building an AI analytics platform?",
    "What challenges or blockers have I written about?",
    "What action items or decisions are still unresolved?"
  ];

  const handleSearch = async (targetQuery?: string) => {
    const q = (targetQuery || query).trim();
    if (!q || loading) return;

    setLoading(true);
    setSearchError(null);
    setStatusMessage("Retrieving your isolated journal entries...");
    setResponse(null);

    try {
      // 1. Fetch conversations from Firestore for this user
      const conversations = await getConversations(user.uid);
      if (conversations.length === 0) {
        setResponse({
          answer: "You do not have any journal entries yet. Once you write thoughts in the Journal tab, you can ask questions about your past entries here.",
          grounded: false,
          confidence: 'not_found',
          citations: []
        });
        setLoading(false);
        return;
      }

      setStatusMessage("Extracting reflections for grounded verification...");
      const journalContext = [];

      // Limit to 20 most recent conversations to respect free-tier context limits
      const sample = conversations.slice(0, 20);
      for (const conv of sample) {
        const msgs = await getMessages(user.uid, conv.id);
        const transcript = msgs
          .map(m => `${m.role.toUpperCase()}: ${m.content}`)
          .join('\n');
        
        if (transcript.trim()) {
          journalContext.push({
            conversationId: conv.id,
            title: conv.title,
            date: new Date(conv.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            content: transcript.slice(0, 3500)
          });
        }
      }

      setStatusMessage("Verifying ground truth with Gemini...");
      const result = await askMyPast({
        query: q,
        journals: journalContext
      });

      setResponse(result);
    } catch (err: any) {
      console.error("Ask My Past search error:", err);
      setSearchError(err.message || "Failed to search past memory. Please check your connection.");
    } finally {
      setLoading(false);
      setStatusMessage(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <Search className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
          Ask My Past
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-lg mx-auto">
          Search and query your historical journal entries. Grounded strictly in your private reflections with date citations.
        </p>
      </div>

      {/* Query Input Box */}
      <div className="p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500 mb-6">
        <div className="flex items-center gap-3 px-3">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            id="ask-my-past-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            placeholder="Ask anything about your past entries (e.g., 'What goals did I mention last week?')"
            className="w-full py-3 text-sm bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
          />
          <button
            id="ask-my-past-submit-btn"
            onClick={() => handleSearch()}
            disabled={!query.trim() || loading}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-40 transition-colors shrink-0 flex items-center space-x-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Search Past</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {searchError && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{searchError}</span>
          </div>
          <button 
            onClick={() => setSearchError(null)}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
          >
            <span className="text-sm font-bold">×</span>
          </button>
        </div>
      )}

      {/* Sample Query Pills */}
      <div className="mb-8">
        <p className="text-xs text-zinc-400 mb-2 font-medium">Try asking:</p>
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(sq);
                handleSearch(sq);
              }}
              className="px-3 py-1.5 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 transition-colors text-left"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Search Status Progress */}
      {statusMessage && (
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 text-xs text-indigo-700 dark:text-indigo-300 flex items-center space-x-2 mb-6 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Grounded Response Card */}
      {response && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            {/* Confidence & Grounding Badges */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center space-x-2">
                {response.confidence === 'high' ? (
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Grounded in Journal History</span>
                  </span>
                ) : response.confidence === 'moderate' ? (
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Inferred from Journal Context</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Information Not Found in Journal</span>
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1 text-xs text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero Cross-User Access</span>
              </div>
            </div>

            {/* Answer body */}
            <div className="prose dark:prose-invert prose-sm max-w-none text-zinc-800 dark:text-zinc-200 leading-relaxed">
              <Markdown>{response.answer}</Markdown>
            </div>
          </div>

          {/* Citations / References Section */}
          {response.citations && response.citations.length > 0 && (
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>Journal Sources & Timestamps ({response.citations.length})</span>
              </h3>

              <div className="space-y-3">
                {response.citations.map((cite, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        "{cite.title}"
                      </span>
                      <span className="inline-flex items-center space-x-1 text-[11px] text-zinc-400">
                        <Calendar className="w-3 h-3" />
                        <span>{cite.date}</span>
                      </span>
                    </div>
                    {cite.excerpt && (
                      <p className="text-zinc-600 dark:text-zinc-400 italic">
                        "{cite.excerpt}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
