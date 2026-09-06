import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Search, 
  Lock, 
  Database, 
  KeyRound, 
  ArrowRight, 
  FileText,
  Layers,
  Cpu
} from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => void;
  onRegister?: () => void;
  onExploreSecurity: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSignIn,
  onRegister,
  onExploreSecurity,
}) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-6">
            Gemini<span className="text-emerald-600 dark:text-emerald-400">Vault</span>
          </h1>

          <p className="text-xl sm:text-2xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4 tracking-tight">
            Think with Gemini. Remember privately. Act intelligently.
          </p>

          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Your personal, encrypted-by-identity AI journal and memory vault. Have multi-turn reflective conversations with Gemini, generate structured summaries, synthesize long-term personal insights, and search your personal past with zero data leakage.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              id="hero-signin-btn"
              onClick={onSignIn}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02]"
            >
              <span>Get Started • Sign In / Register</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-security-btn"
              onClick={onExploreSecurity}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>See How Security Works</span>
            </button>
          </div>

          {/* Core Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
                Multi-Turn Reflection
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Converse naturally with Gemini to brainstorm, unblock emotional friction, and organize thoughts without judgment.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
                Automatic Summaries
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Extract concise summaries, key themes, goals, and actionable checklists from every journal entry with one tap.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-400 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
                Personal Insight Engine
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Synthesizes recurring topics, blockers, and progressive ambitions over time—without speculative diagnoses.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
                Ask My Past
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Ask grounded questions about your own past entries with date citations and strict verification against hallucination.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Security Architecture Primer */}
      <section className="py-16 bg-zinc-50 dark:bg-zinc-900/60 border-t border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-3">
              Built on First-Class Security Principles
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
              We never prioritize convenience over security. Your private thoughts and API secrets are protected across every layer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center space-x-3 mb-3">
                <Database className="w-5 h-5 text-emerald-500" />
                <h4 className="font-semibold text-zinc-900 dark:text-white text-sm">UID Data Isolation</h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                All Firestore collections are nested strictly by authenticated user UID. Firestore security rules reject any read or write where owner UID does not match token claims.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center space-x-3 mb-3">
                <KeyRound className="w-5 h-5 text-teal-500" />
                <h4 className="font-semibold text-zinc-900 dark:text-white text-sm">Zero Client-Side Keys</h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                GEMINI_API_KEY lives exclusively in the server environment. Browser JavaScript and bundle files never possess or transmit the AI secret.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center space-x-3 mb-3">
                <Lock className="w-5 h-5 text-indigo-500" />
                <h4 className="font-semibold text-zinc-900 dark:text-white text-sm">Prompt Injection Armor</h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Journal contents and memories are treated as strictly untrusted text. Non-overridable system directives prevent jailbreaks from manipulating security boundaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-zinc-500 dark:text-zinc-500 border-t border-zinc-200 dark:border-zinc-800">
        <p>GeminiVault — Personal AI Memory • Secure & Private</p>
      </footer>
    </div>
  );
};
