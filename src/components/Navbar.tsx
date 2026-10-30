import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  Bot,
  UserCheck,
  LogOut,
  ChevronDown,
  Building2,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface NavbarProps {
  onOpenAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAssistant }) => {
  const { user, logout, quickSwitchRole } = useAuth();
  const navigate = useNavigate();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleRoleChange = async (role: UserRole) => {
    setRoleDropdownOpen(false);
    try {
      await quickSwitchRole(role);
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
      case 'Security Officer':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/60';
      case 'Developer':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
      case 'Auditor':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand & Organization */}
        <div className="flex items-center gap-4">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
              <Shield className="h-5 w-5 text-white" />
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-zinc-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-zinc-100 tracking-tight text-base">SecureTrust</span>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 font-bold">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 tracking-wider uppercase font-medium">Enterprise Trust Mesh</p>
            </div>
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-zinc-800">
              <Building2 className="h-3.5 w-3.5 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-300 max-w-[180px] truncate">
                {user.organization_name || 'Enterprise Workspace'}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                RLS Guarded
              </span>
            </div>
          )}
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Security AI Advisor Button */}
              <button
                onClick={onOpenAssistant}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950/70 to-blue-950/70 hover:from-cyan-900/80 hover:to-blue-900/80 border border-cyan-700/50 text-cyan-200 text-xs font-medium shadow-sm transition cursor-pointer"
                title="Open AI Security Advisor"
              >
                <Bot className="h-4 w-4 text-cyan-400 animate-pulse" />
                <span className="hidden sm:inline">AI Security Advisor</span>
                <Sparkles className="h-3 w-3 text-cyan-400 hidden sm:inline" />
              </button>

              {/* Quick Role Switcher for Testing RBAC */}
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition cursor-pointer ${getRoleBadgeColor(
                    user.role
                  )}`}
                  title="Switch Role to test RBAC permissions"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>{user.role}</span>
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="px-2 py-1 text-[11px] font-mono uppercase text-zinc-400 border-b border-zinc-800 mb-1">
                      Switch Role (RBAC Demo)
                    </div>
                    {(['Admin', 'Security Officer', 'Developer', 'Auditor'] as UserRole[]).map(r => (
                      <button
                        key={r}
                        onClick={() => handleRoleChange(r)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition ${
                          user.role === r ? 'bg-cyan-950/80 text-cyan-300 font-semibold' : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${user.role === r ? 'bg-cyan-400' : 'bg-zinc-600'}`} />
                          {r}
                        </span>
                        {r === 'Admin' && <Lock className="h-3 w-3 text-purple-400 opacity-60" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-800/80 text-zinc-300 transition cursor-pointer"
                >
                  <div className="h-7 w-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-200">
                    {user.email.substring(0, 2).toUpperCase()}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-zinc-400 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-3 z-50">
                    <div className="mb-2 pb-2 border-b border-zinc-800">
                      <p className="text-xs font-medium text-zinc-200 truncate">{user.email}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Role: <span className="text-zinc-300 font-mono">{user.role}</span></p>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition"
              >
                Register Workspace
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
