import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  variant?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  trend,
  trendDirection = 'neutral',
  icon: Icon,
  variant = 'cyan',
}) => {
  const variantStyles = {
    cyan: {
      border: 'border-zinc-800 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-950/60 border-cyan-800/60 text-cyan-400',
      glow: 'group-hover:shadow-cyan-500/5',
    },
    emerald: {
      border: 'border-zinc-800 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400',
      glow: 'group-hover:shadow-emerald-500/5',
    },
    amber: {
      border: 'border-zinc-800 hover:border-amber-500/40',
      iconBg: 'bg-amber-950/60 border-amber-800/60 text-amber-400',
      glow: 'group-hover:shadow-amber-500/5',
    },
    rose: {
      border: 'border-zinc-800 hover:border-rose-500/40',
      iconBg: 'bg-rose-950/60 border-rose-800/60 text-rose-400',
      glow: 'group-hover:shadow-rose-500/5',
    },
    purple: {
      border: 'border-zinc-800 hover:border-purple-500/40',
      iconBg: 'bg-purple-950/60 border-purple-800/60 text-purple-400',
      glow: 'group-hover:shadow-purple-500/5',
    },
  }[variant];

  const trendColor =
    trendDirection === 'up'
      ? 'text-emerald-400'
      : trendDirection === 'down'
      ? 'text-rose-400'
      : 'text-zinc-400';

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-zinc-900/60 p-5 border transition-all duration-200 shadow-lg ${variantStyles.border} ${variantStyles.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-400 tracking-wide uppercase">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-zinc-100">{value}</span>
            {trend && <span className={`text-xs font-mono font-medium ${trendColor}`}>{trend}</span>}
          </div>
          {subValue && <p className="mt-1 text-xs text-zinc-400">{subValue}</p>}
        </div>
        <div className={`p-2.5 rounded-xl border ${variantStyles.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};
