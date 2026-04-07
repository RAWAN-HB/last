import React from 'react';
import { motion } from 'motion/react';
import { Briefcase, User, Building2, ShieldCheck, Sparkles, Settings, UserCheck, LogOut } from 'lucide-react';

type View = 'landing' | 'student' | 'company' | 'admin' | 'application' | 'super-admin' | 'supervisor' | 'login' | 'register';

interface NavbarProps {
  currentView: View;
  setView: (view: View) => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, isAuthenticated, onLogout }) => {
  const isDark = currentView === 'landing';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${isDark ? 'bg-black/20 backdrop-blur-xl border-b border-white/10' : 'bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">

          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setView('landing')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Stag<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">.io</span>
            </span>
          </div>

          {/* Nav tabs */}
          {/* Removed nav tabs - only logo and login/register buttons now */}

          {/* Right side — login/logout */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              // ── Logged in ──────────────────────────
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-sm font-black px-5 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            ) : (
              // ── Not logged in ──────────────────────
              <>
                <button
                  onClick={() => setView('login')}
                  className={`hidden sm:block text-sm font-black px-4 py-2 transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Log in
                </button>
                <button
                  onClick={() => setView('register')}
                  className="relative group overflow-hidden bg-white text-slate-900 px-6 py-3 rounded-xl text-sm font-black hover:scale-105 transition-all shadow-xl shadow-black/10"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Join Now
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </span>
                  <div className="absolute inset-0 bg-indigo-50 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};