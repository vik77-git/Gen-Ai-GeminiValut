import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Search, 
  Target, 
  ShieldCheck, 
  Plus, 
  ArrowRight, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  Lightbulb, 
  Loader2,
  Trash2
} from 'lucide-react';
import { Conversation, Summary, Insight, UserProfile } from '../types';
import { getConversations } from '../services/conversation-service';
import { getSummaries } from '../services/summary-service';
import { getInsights } from '../services/insight-service';
import { SummaryModal } from './SummaryModal';
import { DeleteDataModal } from './DeleteDataModal';

interface DashboardProps {
  user: UserProfile;
  onNavigate: (tab: 'dashboard' | 'journal' | 'insights' | 'ask' | 'security', conversationId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  // Summary preview modal
  const [previewSummary, setPreviewSummary] = useState<Summary | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Ask My Past inline query
  const [quickQuery, setQuickQuery] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [cList, sList, iList] = await Promise.all([
        getConversations(user.uid),
        getSummaries(user.uid),
        getInsights(user.uid)
      ]);
      setConversations(cList);
      setSummaries(sList);
      setInsights(iList);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user.uid]);

  // Derived metrics
  const activeGoalsCount = insights.filter(i => i.type === 'goal').length + 
    summaries.reduce((acc, s) => acc + (s.goals?.length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Private & Encrypted by UID</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            Welcome back, {user.displayName || user.email?.split('@')[0] || "Journaler"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
            Think with Gemini. All reflections are isolated to your authenticated identity with zero client-side secret exposure.
          </p>
        </div>

        {/* Primary Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="dash-new-journal-btn"
            onClick={() => onNavigate('journal')}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Journal</span>
          </button>

          <button
            onClick={() => onNavigate('insights')}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 border border-zinc-200 dark:border-zinc-700 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Insight Engine</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Journals</span>
            <BookOpen className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
            {loading ? "-" : conversations.length}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Multi-turn reflections</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Summaries</span>
            <FileText className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
            {loading ? "-" : summaries.length}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Structured memories</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Identified Goals</span>
            <Target className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
            {loading ? "-" : activeGoalsCount}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Active pursuits</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Vault Insights</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
            {loading ? "-" : insights.length}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Patterns & actions</p>
        </div>
      </div>

      {/* Quick "Ask My Past" search hero card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Ask My Past</h3>
              <p className="text-xs text-zinc-500">Search questions grounded exclusively in your own history</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('ask')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <span>Open Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && quickQuery.trim()) {
                  onNavigate('ask');
                }
              }}
              placeholder="What projects did I discuss this month? (Press Enter)"
              className="w-full pl-4 pr-3 py-2.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={() => onNavigate('ask')}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shrink-0"
          >
            Search
          </button>
        </div>
      </div>

      {/* Main 2-Column Section: Recent Journals & Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Recent Journals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Recent Journal Entries</span>
            </h2>
            <button
              onClick={() => onNavigate('journal')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>View All ({conversations.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-zinc-400 text-xs flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
              <span>Loading journals...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
              <BookOpen className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                You haven't started a journal yet.
              </p>
              <p className="text-xs text-zinc-500 mt-1 mb-4">
                Begin your first reflective conversation with Gemini.
              </p>
              <button
                onClick={() => onNavigate('journal')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                Start Journaling
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.slice(0, 5).map((conv) => {
                const summary = summaries.find(s => s.conversationId === conv.id);
                return (
                  <div
                    key={conv.id}
                    onClick={() => onNavigate('journal', conv.id)}
                    className="group p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700/60 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="overflow-hidden pr-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {conv.title}
                        </h3>
                        {summary && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 shrink-0">
                            Summarized
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {summary ? summary.summary : "Click to view and continue multi-turn reflection..."}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-[11px] text-zinc-400 flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(conv.updatedAt || conv.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Pinned Insights */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Synthesized Insights</span>
            </h2>
            <button
              onClick={() => onNavigate('insights')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>View All ({insights.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {insights.length === 0 ? (
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
              <Sparkles className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Continue journaling to discover patterns.
              </p>
              <p className="text-[11px] text-zinc-500 mt-1 mb-3">
                Run the Insight Engine once you have a few reflections.
              </p>
              <button
                onClick={() => onNavigate('insights')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              >
                Synthesize Insights
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.slice(0, 4).map((ins) => (
                <div
                  key={ins.id}
                  className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {ins.title}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {ins.type}
                    </span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {ins.description}
                  </p>
                  {ins.suggestedAction && (
                    <p className="text-emerald-700 dark:text-emerald-400 text-[11px] font-medium line-clamp-1">
                      → {ins.suggestedAction}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Privacy / Delete my data box */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-xs flex items-center justify-between">
            <span className="text-zinc-500">Privacy & Control:</span>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Erase All Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteDataModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        uid={user.uid}
        onSuccess={() => {
          setConversations([]);
          setSummaries([]);
          setInsights([]);
        }}
      />

      {/* Summary Modal Preview */}
      <SummaryModal
        summary={previewSummary}
        isOpen={Boolean(previewSummary)}
        onClose={() => setPreviewSummary(null)}
      />
    </div>
  );
};
