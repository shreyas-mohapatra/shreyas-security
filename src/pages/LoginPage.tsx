import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Loader2, UserCheck, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, quickSwitchRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setError(null);
    setLoading(true);
    try {
      await quickSwitchRole(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Shield className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">SecureTrust AI</span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">Sign in to your security console</h2>
        <p className="mt-1 text-xs text-zinc-400">
          Enter your organization credentials or choose a pre-configured demo persona
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-zinc-900/80 border border-zinc-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-zinc-300">Work Email</label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="analyst@enterprise.com"
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-cyan-500 transition"
                />
                <Mail className="absolute right-3 top-2.5 h-4 w-4 text-zinc-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">Password</label>
              <div className="mt-1 relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-cyan-500 transition"
                />
                <Lock className="absolute right-3 top-2.5 h-4 w-4 text-zinc-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Authenticate & Open Console'}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                Instant 1-Click Demo Personas
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoLogin('Admin')}
                className="p-2.5 text-left rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-purple-800/40 text-purple-300 transition cursor-pointer"
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>Admin</span>
                  <KeyRound className="h-3 w-3 text-purple-400" />
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Full Policies & RBAC</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('Security Officer')}
                className="p-2.5 text-left rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-blue-800/40 text-blue-300 transition cursor-pointer"
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>Security Officer</span>
                  <Shield className="h-3 w-3 text-blue-400" />
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Threats & Incidents</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('Developer')}
                className="p-2.5 text-left rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-amber-800/40 text-amber-300 transition cursor-pointer"
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>Developer</span>
                  <UserCheck className="h-3 w-3 text-amber-400" />
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Firewall & Tokenizer</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('Auditor')}
                className="p-2.5 text-left rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-emerald-800/40 text-emerald-300 transition cursor-pointer"
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>Auditor</span>
                  <Shield className="h-3 w-3 text-emerald-400" />
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Compliance Reports</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-zinc-400">
            Need to register a new tenant?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Create an organization
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
