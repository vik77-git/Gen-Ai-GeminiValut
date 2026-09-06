import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { clearAllUserData } from '../services/conversation-service';

interface DeleteDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  onSuccess: () => void;
}

export const DeleteDataModal: React.FC<DeleteDataModalProps> = ({
  isOpen,
  onClose,
  uid,
  onSuccess,
}) => {
  const [confirmInput, setConfirmInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDeleteAll = async () => {
    if (confirmInput.trim().toUpperCase() !== 'DELETE') {
      setError("Please type DELETE exactly to confirm.");
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await clearAllUserData(uid);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to delete user data:", err);
      setError("Failed to delete all data: " + (err.message || "Unknown error"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900/60 p-6"
        id="delete-data-modal"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400 mb-4">
          <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Delete All Personal Journal Data
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Irreversible privacy erasure
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
          This will permanently wipe all of your private conversations, messages, summaries, and synthesized insights from your Firestore vault (<span className="font-mono text-zinc-500">/users/{uid}</span>).
        </p>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Type <span className="font-bold text-rose-600">DELETE</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder="DELETE"
            className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white uppercase placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDeleteAll}
            disabled={deleting || confirmInput.trim().toUpperCase() !== 'DELETE'}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors disabled:opacity-40 shadow-sm"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>Permanently Erase Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
