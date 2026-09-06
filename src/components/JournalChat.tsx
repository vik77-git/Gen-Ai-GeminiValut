import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Send, 
  Sparkles, 
  Loader2, 
  MessageSquare, 
  Calendar, 
  Check, 
  X,
  Menu,
  FileText,
  User,
  Bot,
  AlertCircle
} from 'lucide-react';
import { Conversation, Message, UserProfile, Summary } from '../types';
import { 
  getConversations, 
  createConversation, 
  updateConversationTitle, 
  deleteConversation, 
  getMessages, 
  saveMessage 
} from '../services/conversation-service';
import { saveSummary, getSummaryForConversation } from '../services/summary-service';
import { sendChatMessage, generateSummary } from '../services/api-client';
import { SummaryModal } from './SummaryModal';

interface JournalChatProps {
  user: UserProfile;
  initialConversationId?: string;
}

export const JournalChat: React.FC<JournalChatProps> = ({ user, initialConversationId }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  
  // Title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Summary Modal state
  const [activeSummary, setActiveSummary] = useState<Summary | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user's conversations
  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      const list = await getConversations(user.uid);
      setConversations(list);

      if (initialConversationId) {
        const found = list.find(c => c.id === initialConversationId);
        if (found) {
          setActiveConversation(found);
          return;
        }
      }

      if (list.length > 0 && !activeConversation) {
        setActiveConversation(list[0]);
      } else if (list.length === 0) {
        // Create initial conversation if empty
        const initial = await createConversation(user.uid, "Welcome Reflection");
        setConversations([initial]);
        setActiveConversation(initial);
        // Add welcome message
        await saveMessage(
          user.uid,
          initial.id,
          'assistant',
          "Welcome to your private GeminiVault. Every thought, reflection, and idea you share here is strictly isolated to your verified account. What is on your mind today?"
        );
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user.uid]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;
    
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const msgs = await getMessages(user.uid, activeConversation.id);
        setMessages(msgs);
        setEditedTitle(activeConversation.title);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeConversation?.id, user.uid]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sendingMessage]);

  // Create new conversation
  const handleCreateNew = async () => {
    try {
      const newConv = await createConversation(user.uid, "New Reflection");
      setConversations(prev => [newConv, ...prev]);
      setActiveConversation(newConv);
      setMessages([]);
      setSidebarOpen(false);
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (convId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this journal conversation? This cannot be undone.")) return;

    try {
      await deleteConversation(user.uid, convId);
      const remaining = conversations.filter(c => c.id !== convId);
      setConversations(remaining);
      if (activeConversation?.id === convId) {
        setActiveConversation(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  // Save renamed title
  const handleSaveTitle = async () => {
    if (!activeConversation || !editedTitle.trim()) return;
    try {
      await updateConversationTitle(user.uid, activeConversation.id, editedTitle.trim());
      setActiveConversation(prev => prev ? { ...prev, title: editedTitle.trim() } : null);
      setConversations(prev => prev.map(c => c.id === activeConversation.id ? { ...c, title: editedTitle.trim() } : c));
      setIsEditingTitle(false);
    } catch (err) {
      console.error("Failed to rename conversation:", err);
    }
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConversation || sendingMessage) return;

    const userText = inputText.trim();
    setInputText('');

    // Immediately save & render user message
    try {
      const userMsg = await saveMessage(user.uid, activeConversation.id, 'user', userText);
      setMessages(prev => [...prev, userMsg]);
      setSendingMessage(true);

      // Call server-side Gemini endpoint
      const formattedHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await sendChatMessage({
        conversationId: activeConversation.id,
        message: userText,
        history: formattedHistory
      });

      // Save assistant reply to user's private Firestore subcollection
      const assistantMsg = await saveMessage(
        user.uid, 
        activeConversation.id, 
        'assistant', 
        res.reply
      );
      setMessages(prev => [...prev, assistantMsg]);

      // If conversation title is default and we have 2 messages, auto-suggest a title
      if (activeConversation.title === "New Reflection" || activeConversation.title === "New Journal Entry") {
        const snippet = userText.slice(0, 28) + (userText.length > 28 ? '...' : '');
        await updateConversationTitle(user.uid, activeConversation.id, snippet);
        setActiveConversation(prev => prev ? { ...prev, title: snippet } : null);
        setConversations(prev => prev.map(c => c.id === activeConversation.id ? { ...c, title: snippet } : c));
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setErrorMessage(err.message || "Failed to communicate with Gemini. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle auto-summarize
  const handleSummarize = async () => {
    if (!activeConversation || messages.length === 0 || summarizing) return;

    setSummarizing(true);
    setErrorMessage(null);
    try {
      // Check if summary already exists
      const existing = await getSummaryForConversation(user.uid, activeConversation.id);
      if (existing) {
        setActiveSummary(existing);
        setShowSummaryModal(true);
        setSummarizing(false);
        return;
      }

      // Generate new summary via Gemini API
      const summaryResult = await generateSummary({
        conversationId: activeConversation.id,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      });

      // Save to user's Firestore summaries collection
      const saved = await saveSummary(user.uid, {
        conversationId: activeConversation.id,
        title: summaryResult.title,
        summary: summaryResult.summary,
        keyPoints: summaryResult.keyPoints,
        topics: summaryResult.topics,
        actionItems: summaryResult.actionItems,
        goals: summaryResult.goals
      });

      setActiveSummary(saved);
      setShowSummaryModal(true);
    } catch (err: any) {
      console.error("Summarization error:", err);
      setErrorMessage(err.message || "Failed to generate summary. Please check your connection.");
    } finally {
      setSummarizing(false);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-white dark:bg-zinc-950">
      
      {/* Sidebar - Desktop & Responsive Mobile Drawer */}
      <aside className={`
        fixed inset-y-16 left-0 z-30 w-72 md:static md:w-80 bg-zinc-50 dark:bg-zinc-900/60 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header & New Button */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Journals ({conversations.length})
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            id="new-journal-btn"
            onClick={handleCreateNew}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Journal</span>
          </button>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search journals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConversations ? (
            <div className="flex items-center justify-center py-10 text-zinc-400 text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              <span>Loading journals...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-10 px-4 text-zinc-400 text-xs">
              {searchQuery ? "No matching journals found." : "No journals started yet."}
            </div>
          ) : (
            filteredConversations.map(c => {
              const isActive = activeConversation?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveConversation(c);
                    setSidebarOpen(false);
                  }}
                  className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isActive 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/80 font-medium' 
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`} />
                    <div className="truncate">
                      <p className="text-xs truncate">{c.title}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {new Date(c.updatedAt || c.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Delete conversation icon */}
                  <button
                    onClick={(e) => handleDeleteConversation(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-rose-500 rounded-md transition-opacity"
                    title="Delete journal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Security badge at bottom of sidebar */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
          <span className="truncate">UID: {user.uid.slice(0, 10)}...</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Isolated</span>
        </div>
      </aside>

      {/* Main Chat Workspace */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header */}
        <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between bg-white dark:bg-zinc-900">
          <div className="flex items-center space-x-3 overflow-hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              <Menu className="w-5 h-5" />
            </button>

            {activeConversation ? (
              <div className="flex items-center space-x-2 truncate">
                {isEditingTitle ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="px-2 py-1 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                      autoFocus
                    />
                    <button onClick={handleSaveTitle} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsEditingTitle(false)} className="p-1 text-zinc-400 hover:bg-zinc-100 rounded">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 group">
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white truncate">
                      {activeConversation.title}
                    </h2>
                    <button 
                      onClick={() => setIsEditingTitle(true)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
                      title="Rename"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <h2 className="text-sm font-semibold text-zinc-500">Select or create a journal</h2>
            )}
          </div>

          {/* Action buttons */}
          {activeConversation && (
            <div className="flex items-center space-x-2">
              <button
                id="summarize-journal-btn"
                onClick={handleSummarize}
                disabled={summarizing || messages.length === 0}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 transition-colors disabled:opacity-50"
                title="Generate structured summary with key points and action items"
              >
                {summarizing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                )}
                <span>Summarize</span>
              </button>

              <button
                onClick={() => handleDeleteConversation(activeConversation.id)}
                className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                title="Delete journal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="p-1 hover:text-rose-900 dark:hover:text-white rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              <p className="text-xs">Loading reflection history...</p>
            </div>
          ) : !activeConversation ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-zinc-400">
              <MessageSquare className="w-12 h-12 mb-3 stroke-[1.5]" />
              <p className="text-sm font-medium">No active journal entry</p>
              <p className="text-xs text-zinc-500 mt-1">Select a journal from the sidebar or start a new one.</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
                Your Private Thinking Space
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                Share what's on your mind. Brainstorm a project, reflect on your week, or work through a challenge. Gemini will respond with empathetic, structured guidance.
              </p>
              <div className="grid grid-cols-1 gap-2 w-full text-left">
                <button
                  onClick={() => setInputText("I want to brainstorm an MVP for an AI analytics tool. Where should I begin?")}
                  className="p-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  "I want to brainstorm an MVP for an AI analytics tool..."
                </button>
                <button
                  onClick={() => setInputText("I've been feeling torn between two different creative projects lately...")}
                  className="p-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  "I've been feeling torn between two different creative projects..."
                </button>
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-emerald-600 text-white rounded-tr-sm shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-tl-sm'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      ) : (
                        <div className="prose dark:prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1">
                          <Markdown>{m.content}</Markdown>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1 px-1">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Thinking indicator */}
          {sendingMessage && (
            <div className="flex gap-3 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                <span>Thinking with Gemini...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-end gap-2">
            <div className="flex-1 relative rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all">
              <textarea
                id="journal-chat-textarea"
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={activeConversation ? "Write your thoughts, questions, or reflections (Enter to send)..." : "Select a journal first..."}
                disabled={!activeConversation || sendingMessage}
                maxLength={8000}
                className="w-full px-4 py-3 bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-400 resize-none focus:outline-none"
              />
              <div className="flex items-center justify-between px-3 py-1.5 border-t border-zinc-200/50 dark:border-zinc-700/50 text-[10px] text-zinc-400">
                <span>Shift + Enter for new line</span>
                <span>{inputText.length} / 8000</span>
              </div>
            </div>

            <button
              id="journal-chat-send-btn"
              type="submit"
              disabled={!activeConversation || !inputText.trim() || sendingMessage}
              className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white disabled:opacity-40 transition-colors shadow-sm"
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </main>

      {/* Summary Modal */}
      <SummaryModal
        summary={activeSummary}
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
      />
    </div>
  );
};
