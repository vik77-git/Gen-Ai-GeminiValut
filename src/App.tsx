import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, auth, fbSignOut } from './lib/firebase';
import { UserProfile } from './types';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { JournalChat } from './components/JournalChat';
import { InsightEngine } from './components/InsightEngine';
import { AskMyPast } from './components/AskMyPast';
import { SecurityCenter } from './components/SecurityCenter';
import { AuthModal } from './components/AuthModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'journal' | 'insights' | 'ask' | 'security'>('dashboard');
  const [targetConversationId, setTargetConversationId] = useState<string | undefined>();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'register'>('signin');
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Firebase auth state subscription
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Vault User'),
          photoURL: fbUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenAuth = (mode: 'signin' | 'register' = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      setActiveTab('dashboard');
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  const handleNavigate = (tab: 'dashboard' | 'journal' | 'insights' | 'ask' | 'security', conversationId?: string) => {
    if (conversationId) {
      setTargetConversationId(conversationId);
    }
    setActiveTab(tab);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-sm font-semibold tracking-wide">
          Verifying GeminiVault Identity...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {!user ? (
          activeTab === 'security' ? (
            <SecurityCenter user={null} />
          ) : (
            <LandingPage
              onSignIn={() => handleOpenAuth('signin')}
              onRegister={() => handleOpenAuth('register')}
              onExploreSecurity={() => setActiveTab('security')}
            />
          )
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard user={user} onNavigate={handleNavigate} />
            )}
            {activeTab === 'journal' && (
              <JournalChat 
                user={user} 
                initialConversationId={targetConversationId} 
              />
            )}
            {activeTab === 'insights' && (
              <InsightEngine user={user} />
            )}
            {activeTab === 'ask' && (
              <AskMyPast user={user} />
            )}
            {activeTab === 'security' && (
              <SecurityCenter user={user} />
            )}
          </>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          setActiveTab('dashboard');
        }}
      />
    </div>
  );
}
