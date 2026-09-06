import React from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  Sparkles, 
  Search, 
  LayoutDashboard, 
  LogOut, 
  LogIn, 
  Sun, 
  Moon,
  User as UserIcon,
  Lock
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'journal' | 'insights' | 'ask' | 'security';
  setActiveTab: (tab: 'dashboard' | 'journal' | 'insights' | 'ask' | 'security') => void;
  user: UserProfile | null;
  onOpenAuth: (mode?: 'signin' | 'register') => void;
  onSignOut: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onSignOut,
  darkMode,
  setDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center space-x-3 cursor-pointer group"
          id="nav-brand-logo"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white">
                Gemini<span className="text-emerald-600 dark:text-emerald-400">Vault</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
                Private AI
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Think with Gemini. Remember privately.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            id="nav-tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'dashboard'
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            id="nav-tab-journal"
            onClick={() => setActiveTab('journal')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'journal'
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Journal</span>
          </button>

          <button
            id="nav-tab-insights"
            onClick={() => setActiveTab('insights')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'insights'
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Insight Engine</span>
          </button>

          <button
            id="nav-tab-ask"
            onClick={() => setActiveTab('ask')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'ask'
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Ask My Past</span>
          </button>

          <button
            id="nav-tab-security"
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'security'
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Security Center</span>
          </button>
        </nav>

        {/* Right Actions: Theme Toggle & User Auth */}
        <div className="flex items-center space-x-3">
          <button
            id="theme-toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-8 h-8 rounded-full border border-emerald-500/50 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-semibold text-xs border border-emerald-300 dark:border-emerald-700">
                    {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || <UserIcon className="w-4 h-4" />}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-medium text-zinc-900 dark:text-white leading-tight truncate max-w-[130px]">
                    {user.displayName || "Journaler"}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[130px]">
                    {user.email || `UID: ${user.uid.slice(0, 6)}...`}
                  </p>
                </div>
              </div>

              <button
                id="sign-out-btn"
                onClick={onSignOut}
                className="p-2 text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                id="open-auth-signin-btn"
                onClick={() => onOpenAuth('signin')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
              <button
                id="open-auth-register-btn"
                onClick={() => onOpenAuth('register')}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-sm"
              >
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center justify-around border-t border-zinc-200 dark:border-zinc-800 py-2 px-2 bg-white dark:bg-zinc-900 text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`p-2 rounded flex flex-col items-center ${activeTab === 'dashboard' ? 'text-emerald-600 font-semibold' : 'text-zinc-500'}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`p-2 rounded flex flex-col items-center ${activeTab === 'journal' ? 'text-emerald-600 font-semibold' : 'text-zinc-500'}`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Journal</span>
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`p-2 rounded flex flex-col items-center ${activeTab === 'insights' ? 'text-emerald-600 font-semibold' : 'text-zinc-500'}`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Insights</span>
        </button>
        <button
          onClick={() => setActiveTab('ask')}
          className={`p-2 rounded flex flex-col items-center ${activeTab === 'ask' ? 'text-emerald-600 font-semibold' : 'text-zinc-500'}`}
        >
          <Search className="w-4 h-4" />
          <span>Ask Past</span>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`p-2 rounded flex flex-col items-center ${activeTab === 'security' ? 'text-emerald-600 font-semibold' : 'text-zinc-500'}`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Security</span>
        </button>
      </div>
    </header>
  );
};
