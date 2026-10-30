import React, { useState, useEffect } from 'react';
import {
  Settings,
  KeyRound,
  Shield,
  Users,
  FileText,
  Lock,
  Plus,
  Check,
  Copy,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ShieldAlert,
  X,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { OrgSettings, User, AuditLog, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, quickSwitchRole } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [settings, setSettings] = useState<OrgSettings | null>(null);
  const [teamMembers, setTeamMembers] = useState<Omit<User, 'password_hash'>[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New API Key Modal
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Audit log payload modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const loadSettingsAndData = async () => {
    try {
      if (isAdmin) {
        const res = await api.getSettings();
        setSettings(res.settings);
        setTeamMembers(res.teamMembers);
      }
      const logsRes = await api.getAuditLogs().catch(() => ({ logs: [], total: 0 }));
      setAuditLogs(logsRes.logs);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsAndData();
  }, [isAdmin]);

  const handleSavePolicies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await api.updateSettings({
        firewall_sensitivity: settings.firewall_sensitivity,
        enforce_pii_redaction: settings.enforce_pii_redaction,
        block_jailbreaks: settings.block_jailbreaks,
        log_retention_days: settings.log_retention_days,
        alert_webhook_url: settings.alert_webhook_url,
      });
      setSettings(res.settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const res = await api.generateApiKey(newKeyName);
      setGeneratedKey(res.apiKey);
      setSettings(prev => (prev ? { ...prev, api_keys: [res.keyMetadata, ...prev.api_keys] } : prev));
      setNewKeyName('');
    } catch (err) {
      console.error('Failed to generate API key:', err);
    }
  };

  const handleCopyNewKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  if (!isAdmin) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-12 text-center space-y-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 p-8 shadow-xl">
        <div className="h-12 w-12 rounded-2xl bg-purple-950 border border-purple-800/80 flex items-center justify-center text-purple-400 mx-auto">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          The Settings & RBAC console is restricted to the <strong>Admin</strong> role. Your current account role is{' '}
          <span className="font-mono text-purple-300 font-semibold">{user?.role}</span>.
        </p>
        <div className="pt-2">
          <button
            onClick={() => quickSwitchRole('Admin')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition cursor-pointer"
          >
            Switch to Admin Persona (Instant RBAC Demo)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Organization Policies & RBAC</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60 font-medium">
              ADMINISTRATIVE GOVERNANCE
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Configure tenant security thresholds, manage AI gateway credentials, and audit user access policies.
          </p>
        </div>
      </div>

      {settings && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Policies & API Keys */}
          <div className="lg:col-span-2 space-y-6">
            {/* Policy Configuration Form */}
            <form onSubmit={handleSavePolicies} className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-6 shadow-lg space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-zinc-100">AI Firewall Defense Policies</h3>
                </div>
                {saveSuccess && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Policies Updated
                  </span>
                )}
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Global Default Firewall Sensitivity</label>
                  <select
                    value={settings.firewall_sensitivity}
                    onChange={e => setSettings({ ...settings, firewall_sensitivity: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-hidden"
                  >
                    <option value="Low">Low - Permissive (Only flag high-confidence catastrophic exploits)</option>
                    <option value="Medium">Medium - Standard (Flag injections, unmasked PII, and toxic output)</option>
                    <option value="Strict">Strict - Zero-Trust (Aggressively filter heuristics and token ambiguity)</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enforce_pii_redaction}
                      onChange={e => setSettings({ ...settings, enforce_pii_redaction: e.target.checked })}
                      className="rounded border-zinc-700 text-cyan-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-zinc-200 block">Enforce Automatic PII De-Identification</span>
                      <span className="text-[11px] text-zinc-400">Scrub SSNs, emails, and financial tokens prior to AI processing</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.block_jailbreaks}
                      onChange={e => setSettings({ ...settings, block_jailbreaks: e.target.checked })}
                      className="rounded border-zinc-700 text-cyan-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-zinc-200 block">Block DAN & Persona Override Jailbreaks</span>
                      <span className="text-[11px] text-zinc-400">Immediately terminate session on system constraint bypass attempt</span>
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Audit Log Retention Policy</label>
                    <select
                      value={settings.log_retention_days}
                      onChange={e => setSettings({ ...settings, log_retention_days: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-hidden"
                    >
                      <option value={30}>30 Days (Standard)</option>
                      <option value={60}>60 Days (PCI-DSS Minimum)</option>
                      <option value={90}>90 Days (HIPAA Recommended)</option>
                      <option value={365}>365 Days (Enterprise Audit Grade)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">SIEM / Alert Webhook URL</label>
                    <input
                      type="url"
                      value={settings.alert_webhook_url}
                      onChange={e => setSettings({ ...settings, alert_webhook_url: e.target.value })}
                      placeholder="https://siem.internal/api/v1/alerts"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving Changes...' : 'Save Organization Policies'}
                </button>
              </div>
            </form>

            {/* API Key Management */}
            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-semibold text-zinc-100">AI Gateway API Keys</h3>
                </div>
                <button
                  onClick={() => {
                    setGeneratedKey(null);
                    setKeyModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-800 text-xs font-medium text-purple-200 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Generate New Key</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {settings.api_keys && settings.api_keys.length > 0 ? (
                  settings.api_keys.map(k => (
                    <div
                      key={k.id}
                      className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-zinc-200">{k.name}</div>
                        <div className="font-mono text-[11px] text-zinc-400 mt-0.5">{k.keyPrefix}</div>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {new Date(k.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 py-3">No active API keys generated yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Col: Team Members & RBAC */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-zinc-100">Team RBAC Roster</h3>
                </div>
                <span className="text-xs font-mono text-zinc-400">{teamMembers.length} Accounts</span>
              </div>

              <div className="space-y-3">
                {teamMembers.map(member => (
                  <div
                    key={member.id}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-zinc-200 truncate">{member.email}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          member.role === 'Admin'
                            ? 'bg-purple-950 text-purple-300 border-purple-800'
                            : member.role === 'Security Officer'
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : member.role === 'Developer'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {member.role}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-zinc-400">Tenant ID: {member.organization_id}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Stream */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Full Tenant Security Audit Trail</h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">{auditLogs.length} Events Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 font-mono uppercase text-[10px] border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Actor Email</th>
                <th className="py-2.5 px-3">Risk Index</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-zinc-800/30 font-mono">
                  <td className="py-2.5 px-3 font-semibold text-zinc-300">{log.action}</td>
                  <td className="py-2.5 px-3 text-zinc-400">{log.user_email || 'system-firewall'}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        log.risk_score >= 0.5 ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'
                      }`}
                    >
                      {(log.risk_score * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-400 text-[11px]">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-[11px]"
                    >
                      Inspect JSON
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate API Key Modal */}
      {keyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-purple-400" />
                Generate AI Gateway Key
              </h3>
              <button onClick={() => setKeyModalOpen(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            {generatedKey ? (
              <div className="space-y-3">
                <p className="text-xs text-amber-300 bg-amber-950/40 border border-amber-800/60 p-2.5 rounded-xl">
                  Please copy this key now. For zero-trust security, it will not be displayed again.
                </p>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-100 break-all select-all">
                  {generatedKey}
                </div>
                <button
                  onClick={handleCopyNewKey}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedKey ? 'Key Copied!' : 'Copy Gateway Key'}</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleGenerateKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Key Description / Purpose</label>
                  <input
                    type="text"
                    required
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    placeholder="e.g. Production RAG Service Gateway"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-hidden"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setKeyModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 text-xs text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs"
                  >
                    Create Key
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Audit Log JSON Payload Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 font-mono">{selectedLog.action}</h3>
                <span className="text-[11px] font-mono text-zinc-400">Log ID: {selectedLog.id}</span>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-zinc-400 hover:text-zinc-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs text-cyan-300 overflow-x-auto max-h-96">
              {JSON.stringify(selectedLog.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
