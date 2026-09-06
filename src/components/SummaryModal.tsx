import React from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Target, 
  ListOrdered, 
  Tag, 
  Calendar,
  Trash2
} from 'lucide-react';
import { Summary } from '../types';

interface SummaryModalProps {
  summary: Summary | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (summaryId: string) => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  summary,
  isOpen,
  onClose,
  onDelete,
}) => {
  if (!isOpen || !summary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8"
        id="summary-modal-card"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                Structured Memory Summary
              </span>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {summary.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Summary */}
        <div className="mb-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p className="font-semibold text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Executive Summary</p>
          {summary.summary}
        </div>

        {/* Key Points */}
        {summary.keyPoints && summary.keyPoints.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">
              <ListOrdered className="w-4 h-4 text-emerald-500" />
              <span>Core Discussion Points</span>
            </div>
            <ul className="space-y-2">
              {summary.keyPoints.map((kp, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-sm text-zinc-800 dark:text-zinc-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span>{kp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Items & Goals in 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Action Items */}
          {summary.actionItems && summary.actionItems.length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
              <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Action Items</span>
              </div>
              <ul className="space-y-2">
                {summary.actionItems.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-emerald-950 dark:text-emerald-200">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Goals */}
          {summary.goals && summary.goals.length > 0 && (
            <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40">
              <div className="flex items-center space-x-2 text-xs font-semibold text-teal-800 dark:text-teal-300 uppercase tracking-wider mb-2.5">
                <Target className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Identified Goals</span>
              </div>
              <ul className="space-y-2">
                {summary.goals.map((goal, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-teal-950 dark:text-teal-200">
                    <span className="text-teal-500 font-bold">🎯</span>
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Topics Chips */}
        {summary.topics && summary.topics.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              <Tag className="w-4 h-4" />
              <span>Extracted Topics</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {summary.topics.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer info & delete button */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Saved {new Date(summary.createdAt).toLocaleDateString()}</span>
          </div>

          {onDelete && (
            <button
              onClick={() => {
                onDelete(summary.id);
                onClose();
              }}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Summary</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
