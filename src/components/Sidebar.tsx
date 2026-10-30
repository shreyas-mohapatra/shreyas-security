import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  FileKey,
  Flame,
  CheckCircle2,
  Settings,
  Cpu,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const navItems = [
    {
      to: '/dashboard',
      label: 'Command Center',
      icon: LayoutDashboard,
      badge: 'Live',
      badgeColor: 'text-emerald-400 bg-emerald-950/70 border-emerald-800/60',
    },
    {
      to: '/firewall',
      label: 'AI Security Firewall',
      icon: ShieldAlert,
      badge: 'Gemini',
      badgeColor: 'text-cyan-400 bg-cyan-950/70 border-cyan-800/60',
    },
    {
      to: '/anonymizer',
      label: 'Data Anonymizer',
      icon: FileKey,
      badge: 'PII Engine',
      badgeColor: 'text-indigo-400 bg-indigo-950/70 border-indigo-800/60',
    },
    {
      to: '/incidents',
      label: 'Incident Tracking',
      icon: Flame,
      badge: 'SOC',
      badgeColor: 'text-rose-400 bg-rose-950/70 border-rose-800/60',
    },
    {
      to: '/compliance',
      label: 'Compliance & Audits',
      icon: CheckCircle2,
      badge: 'GDPR/SOC2',
      badgeColor: 'text-teal-400 bg-teal-950/70 border-teal-800/60',
    },
    {
      to: '/settings',
      label: 'Policies & RBAC',
      icon: Settings,
      adminOnly: true,
      badge: !isAdmin ? 'Admin' : undefined,
      badgeColor: 'text-purple-400 bg-purple-950/70 border-purple-800/60',
    },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800/80 bg-zinc-950/50 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono uppercase text-zinc-400 tracking-wider font-semibold">
          Security Suite
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/50 font-semibold shadow-inner'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-1 ${item.badgeColor}`}
                >
                  {item.adminOnly && !isAdmin && <Lock className="h-2.5 w-2.5" />}
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* System Telemetry Guard Status Box */}
      <div className="p-3 m-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-400 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300">
          <span className="flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            Inspection Engine
          </span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            ONLINE
          </span>
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-zinc-400">Core Model:</span>
            <span className="text-zinc-200 font-mono text-[10px]">Gemini 3.8 Flash</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Policy Mode:</span>
            <span className="text-cyan-400 font-mono text-[10px]">Zero-Trust Strict</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Tenant Isolation:</span>
            <span className="text-emerald-400 font-mono text-[10px]">Enforced (RLS)</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
