import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ThreatChartProps {
  timeline: Array<{
    timestamp: string;
    inspections: number;
    threatsBlocked: number;
    piiScrubbed: number;
    avgRisk: number;
  }>;
  categoryCounts: Record<string, number>;
}

export const ThreatChart: React.FC<ThreatChartProps> = ({ timeline, categoryCounts }) => {
  const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({
    category: name,
    incidents: count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 24h Threat & Inspection Timeline */}
      <div className="lg:col-span-2 rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">24-Hour Threat & Inspection Timeline</h3>
            <p className="text-xs text-zinc-400">Total prompts evaluated vs malicious vectors intercepted</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400" /> Inspections
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-400" /> Threats Blocked
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInspections" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="timestamp" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#27272a',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f4f4f5',
                }}
              />
              <Area
                type="monotone"
                dataKey="inspections"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorInspections)"
                name="Inspections"
              />
              <Area
                type="monotone"
                dataKey="threatsBlocked"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorThreats)"
                name="Threats Blocked"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Threat Vector Distribution */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 shadow-lg flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Attack Vector Distribution</h3>
          <p className="text-xs text-zinc-400">Classified AI security incidents by category</p>
        </div>

        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
              <XAxis type="number" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="category"
                stroke="#a1a1aa"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#27272a',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f4f4f5',
                }}
              />
              <Bar dataKey="incidents" fill="#38bdf8" radius={[0, 6, 6, 0]} barSize={16} name="Incident Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
