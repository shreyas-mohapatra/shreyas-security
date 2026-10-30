import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  FileKey,
  Flame,
  CheckCircle2,
  Activity,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardMetrics, SecurityIncident, AuditLog } from '../types';
import { StatCard } from '../components/StatCard';
import { ThreatChart } from '../components/ThreatChart';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [timeline, setTimeline] = useState<any[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<SecurityIncident[]>([]);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await api.getDashboardMetrics();
      setMetrics(data.metrics);
      setCategoryCounts(data.categoryCounts);
      setTimeline(data.trendTimeline);
      setRecentIncidents(data.recentIncidents);
      setRecentLogs(data.recentLogs);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/80';
      case 'High':
        return 'bg-orange-950/80 text-orange-300 border-orange-800/80';
      case 'Medium':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-rose-900/40 text-rose-300 border-rose-700/50';
      case 'Investigating':
        return 'bg-blue-900/40 text-blue-300 border-blue-700/50';
      case 'Resolved':
        return 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Security Command Center</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-medium">
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time AI posture surveillance, prompt injection firewall, and privacy compliance tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 transition cursor-pointer disabled:opacity-50"
            title="Refresh Metrics"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Engine</span>
          </button>
          <Link
            to="/firewall"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-semibold text-white shadow-sm shadow-cyan-500/20 transition"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Test Firewall</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Stats */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="AI Trust Index"
            value={`${metrics.trustScore}/100`}
            subValue={metrics.trustScore >= 85 ? 'Grade A+ Enterprise Trust' : 'Action Recommended'}
            trend={metrics.trustScore >= 80 ? '+4.2% MoM' : '-2.1% MoM'}
            trendDirection={metrics.trustScore >= 80 ? 'up' : 'down'}
            icon={ShieldCheck}
            variant={metrics.trustScore >= 80 ? 'emerald' : 'amber'}
          />

          <StatCard
            title="Active Security Incidents"
            value={metrics.activeAlerts}
            subValue={`${metrics.criticalAlerts} critical requiring review`}
            trend="Active Triage"
            trendDirection={metrics.criticalAlerts > 0 ? 'down' : 'neutral'}
            icon={Flame}
            variant="rose"
          />

          <StatCard
            title="Threats Intercepted (24h)"
            value={metrics.threatsBlocked24h}
            subValue="Injections, jailbreaks & secrets"
            trend="100% Blocked"
            trendDirection="up"
            icon={ShieldAlert}
            variant="cyan"
          />

          <StatCard
            title="PII Fields Anonymized"
            value={metrics.piiRedactions24h}
            subValue="Zero unmasked records submitted"
            trend="GDPR Art 32"
            trendDirection="up"
            icon={FileKey}
            variant="purple"
          />
        </div>
      )}

      {/* Visual Charts: Timeline + Attack Vectors */}
      {timeline.length > 0 && <ThreatChart timeline={timeline} categoryCounts={categoryCounts} />}

      {/* Two Column Layout: Recent Incidents vs Live Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Incidents */}
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">Active Security Incidents</h3>
                <p className="text-xs text-zinc-400">High priority prompt exploits and PII disclosures</p>
              </div>
              <Link
                to="/incidents"
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                View all ({recentIncidents.length})
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentIncidents.map(inc => (
                <div
                  key={inc.id}
                  className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getSeverityBadge(inc.severity)}`}>
                          {inc.severity}
                        </span>
                        <span className="text-xs font-semibold text-zinc-200">{inc.title}</span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-1">{inc.details}</p>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${getStatusBadge(inc.status)}`}>
                      {inc.status}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span>Category: {inc.category}</span>
                    <span>{new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Audit Log Feed */}
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">Live Security Audit Trail</h3>
                <p className="text-xs text-zinc-400">Immutable ledger of firewall decisions and policy checks</p>
              </div>
              <Link
                to="/settings"
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                Audit Log Archive
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentLogs.map(log => {
                const isHighRisk = log.risk_score >= 0.5;
                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/60 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-zinc-300 font-medium">{log.action}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                            isHighRisk
                              ? 'bg-rose-950 text-rose-400 border-rose-800/60'
                              : 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                          }`}
                        >
                          Risk: {(log.risk_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate max-w-xs font-mono">
                        User: {log.user_email || 'system-gateway'}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launchpad Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Link
          to="/firewall"
          className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-zinc-900 border border-cyan-800/40 hover:border-cyan-500/70 transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-cyan-300 transition">
                AI Firewall Playground
              </h4>
              <p className="text-[11px] text-zinc-400">Test live prompt injection payloads</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-cyan-400 group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          to="/anonymizer"
          className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-zinc-900 border border-indigo-800/40 hover:border-indigo-500/70 transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              <FileKey className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-indigo-300 transition">
                Data Anonymizer Engine
              </h4>
              <p className="text-[11px] text-zinc-400">Scrub SSNs, emails, and credentials</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-indigo-400 group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          to="/compliance"
          className="p-4 rounded-xl bg-gradient-to-br from-teal-950/40 to-zinc-900 border border-teal-800/40 hover:border-teal-500/70 transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-teal-950 text-teal-400 border border-teal-800/60">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-teal-300 transition">
                Compliance Certification
              </h4>
              <p className="text-[11px] text-zinc-400">Export official GDPR/SOC 2 report</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-teal-400 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>
    </div>
  );
};
