import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Target, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  Tag, 
  Loader2, 
  Trash2, 
  CheckCircle, 
  RefreshCw,
  Info,
  AlertCircle,
  X
} from 'lucide-react';
import { Insight, UserProfile, Conversation } from '../types';
import { getInsights, saveInsights, deleteInsight } from '../services/insight-service';
import { getConversations, getMessages } from '../services/conversation-service';
import { generateInsights } from '../services/api-client';

interface InsightEngineProps {
  user: UserProfile;
}

export const InsightEngine: React.FC<InsightEngineProps> = ({ user }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'goal' | 'blocker' | 'suggested_action' | 'pattern' | 'topic'>('all');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [userNotification, setUserNotification] = useState<{ type: 'info' | 'error'; message: string } | null>(null);

  const loadSavedInsights = async () => {
    try {
      setLoading(true);
      const list = await getInsights(user.uid);
      setInsights(list);
    } catch (err) {
      console.error("Failed to load insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedInsights();
  }, [user.uid]);

  const handleSynthesizeInsights = async () => {
    setGenerating(true);
    setUserNotification(null);
    setStatusMsg("Gathering your private journal entries...");

    try {
      // 1. Fetch user's recent conversations & messages
      const convs = await getConversations(user.uid);
      if (convs.length === 0) {
        setUserNotification({
          type: 'info',
          message: "You have no journal entries yet. Write a few reflections first to generate insights!"
        });
        setGenerating(false);
        return;
      }

      setStatusMsg("Reading reflections for pattern synthesis...");
      const journalPayloads: Array<{ title: string; text: string; date?: string }> = [];

      // Take up to 15 recent conversations
      const sample = convs.slice(0, 15);
      for (const c of sample) {
        const msgs = await getMessages(user.uid, c.id);
        const transcript = msgs.map(m => `${m.role}: ${m.content}`).join('\n');
        if (transcript.trim()) {
          journalPayloads.push({
            title: c.title,
            text: transcript.slice(0, 3000), // bounded size
            date: new Date(c.createdAt).toLocaleDateString()
          });
        }
      }

      if (journalPayloads.length === 0) {
        setUserNotification({
          type: 'info',
          message: "Your journals don't have enough messages yet. Add a few reflections first!"
        });
        setGenerating(false);
        return;
      }

      setStatusMsg("Synthesizing patterns with Gemini...");
      const result = await generateInsights({ journals: journalPayloads });

      if (result.insights && result.insights.length > 0) {
        setStatusMsg("Saving synthesized insights to your vault...");
        const saved = await saveInsights(user.uid, result.insights);
        setInsights(prev => [...saved, ...prev]);
        setStatusMsg(null);
      } else {
        setUserNotification({
          type: 'info',
          message: "No clear patterns emerged yet. Continue journaling your goals and challenges!"
        });
      }
    } catch (err: any) {
      console.error("Insight synthesis error:", err);
      setUserNotification({
        type: 'error',
        message: "Failed to synthesize insights: " + (err.message || "Unknown error")
      });
    } finally {
      setGenerating(false);
      setStatusMsg(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInsight(user.uid, id);
      setInsights(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error("Failed to delete insight:", err);
    }
  };

  const filteredInsights = filter === 'all' 
    ? insights 
    : insights.filter(i => i.type === filter);

  const getBadgeDetails = (type: Insight['type']) => {
    switch (type) {
      case 'goal':
        return { label: 'Active Goal', icon: Target, bg: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
      case 'blocker':
        return { label: 'Identified Blocker', icon: AlertTriangle, bg: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
      case 'suggested_action':
        return { label: 'Recommended Action', icon: Lightbulb, bg: 'bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800' };
      case 'pattern':
        return { label: 'Behavioral Pattern', icon: TrendingUp, bg: 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' };
      case 'topic':
      default:
        return { label: 'Recurring Topic', icon: Tag, bg: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Personal Insight Engine
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gemini analyzes your historical entries to identify recurring topics, blockers, and progressive patterns.
          </p>
        </div>

        <button
          id="synthesize-insights-btn"
          onClick={handleSynthesizeInsights}
          disabled={generating}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all hover:scale-[1.01]"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>{generating ? "Synthesizing..." : "Synthesize Personal Insights"}</span>
        </button>
      </div>

      {/* Generating Status Banner */}
      {statusMsg && (
        <div className="my-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* User Notification Banner */}
      {userNotification && (
        <div className={`my-4 p-3.5 rounded-xl border text-xs flex items-center justify-between animate-in fade-in ${
          userNotification.type === 'error'
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300'
            : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60 text-indigo-800 dark:text-indigo-300'
        }`}>
          <div className="flex items-center space-x-2.5">
            {userNotification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            ) : (
              <Info className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
            )}
            <span>{userNotification.message}</span>
          </div>
          <button 
            onClick={() => setUserNotification(null)}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Ethical Guidance Disclaimer */}
      <div className="my-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-start space-x-3 text-xs text-zinc-600 dark:text-zinc-400">
        <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-200">Ethical Reflection Notice: </span>
          The Personal Insight Engine uses respectful, observational reasoning based directly on written text. It does not provide psychological diagnoses or clinical assessments.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {(['all', 'goal', 'blocker', 'suggested_action', 'pattern', 'topic'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === tab
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {tab === 'suggested_action' ? 'Next Actions' : tab}
          </button>
        ))}
      </div>

      {/* Insights Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-zinc-400 text-xs flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          <span>Loading your vault insights...</span>
        </div>
      ) : filteredInsights.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 max-w-lg mx-auto">
          <Sparkles className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
            No insights found
          </h3>
          <p className="text-xs text-zinc-500 mb-6">
            Continue journaling to discover patterns, or click "Synthesize Personal Insights" above to scan your current reflections.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredInsights.map((insight) => {
            const badge = getBadgeDetails(insight.type);
            const Icon = badge.icon;
            return (
              <div
                key={insight.id}
                className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${badge.bg}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </span>

                    <button
                      onClick={() => handleDelete(insight.id)}
                      className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                      title="Delete insight"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
                    {insight.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                    {insight.description}
                  </p>

                  {/* Supporting evidence snippet */}
                  {insight.evidence && (
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 italic mb-4">
                      "{insight.evidence}"
                    </div>
                  )}
                </div>

                {/* Suggested next action block */}
                {insight.suggestedAction && (
                  <div className="mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-start space-x-2 text-xs text-emerald-800 dark:text-emerald-300">
                    <Lightbulb className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                    <div>
                      <span className="font-semibold">Suggested Step: </span>
                      <span>{insight.suggestedAction}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
