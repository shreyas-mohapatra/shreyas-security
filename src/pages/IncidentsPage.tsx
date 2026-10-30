import React, { useState, useEffect } from 'react';
import {
  Flame,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  Clock,
  UserCheck,
  FileText,
  X,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { SecurityIncident, IncidentSeverity, IncidentStatus } from '../types';

export const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected incident modal
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [statusDraft, setStatusDraft] = useState<IncidentStatus>('Open');
  const [notesDraft, setNotesDraft] = useState('');
  const [savingUpdate, setSavingUpdate] = useState(false);

  // Create incident modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Prompt Injection');
  const [newSeverity, setNewSeverity] = useState<IncidentSeverity>('High');
  const [newDetails, setNewDetails] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchIncidents = async () => {
    try {
      const res = await api.getIncidents({
        severity: severityFilter || undefined,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });
      setIncidents(res.incidents);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [severityFilter, statusFilter, searchQuery]);

  const openInvestigation = (inc: SecurityIncident) => {
    setSelectedIncident(inc);
    setStatusDraft(inc.status);
    setNotesDraft(inc.remediation_notes || '');
  };

  const handleSaveInvestigation = async () => {
    if (!selectedIncident) return;
    setSavingUpdate(true);
    try {
      const res = await api.updateIncident(selectedIncident.id, {
        status: statusDraft,
        remediation_notes: notesDraft,
      });
      setIncidents(prev => prev.map(i => (i.id === res.incident.id ? res.incident : i)));
      setSelectedIncident(res.incident);
    } catch (err) {
      console.error('Failed to save incident update:', err);
    } finally {
      setSavingUpdate(false);
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDetails.trim()) return;
    setCreating(true);

    try {
      const res = await api.createIncident({
        title: newTitle,
        category: newCategory,
        severity: newSeverity,
        details: newDetails,
      });
      setIncidents(prev => [res.incident, ...prev]);
      setCreateModalOpen(false);
      setNewTitle('');
      setNewDetails('');
    } catch (err) {
      console.error('Failed to create incident:', err);
    } finally {
      setCreating(false);
    }
  };

  const getSeverityBadge = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'High':
        return 'bg-orange-950/80 text-orange-300 border-orange-800';
      case 'Medium':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'Open':
        return 'bg-rose-950 text-rose-300 border-rose-800/80';
      case 'Investigating':
        return 'bg-blue-950 text-blue-300 border-blue-800/80';
      case 'Resolved':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800/80';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="pb-2 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Security Incident Management</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/60 font-medium">
              SOC CONSOLE
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Track, investigate, and remediate AI model vulnerabilities, prompt injection attacks, and data leakage events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchIncidents()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-xs shadow-md shadow-rose-950/40 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Log Security Incident</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search incident title, payloads, details..."
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-cyan-500 transition"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-hidden"
          >
            <option value="">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-hidden"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Investigating">Investigating</option>
            <option value="Resolved">Resolved</option>
            <option value="Dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 font-mono uppercase text-[10px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Incident Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {incidents.length > 0 ? (
                incidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-zinc-800/40 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded border font-mono text-[10px] font-semibold ${getSeverityBadge(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-zinc-200">
                      <div>{inc.title}</div>
                      <div className="text-[11px] text-zinc-400 font-normal line-clamp-1 max-w-md">{inc.details}</div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap font-mono">{inc.category}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded border font-mono text-[10px] ${getStatusBadge(inc.status)}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(inc.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openInvestigation(inc)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-300 font-medium transition cursor-pointer"
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    No security incidents matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investigation & Remediation Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 space-y-5 animate-in fade-in">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded border font-mono text-[10px] ${getSeverityBadge(selectedIncident.severity)}`}>
                    {selectedIncident.severity}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">{selectedIncident.category}</span>
                </div>
                <h3 className="text-base font-bold text-zinc-100 mt-1">{selectedIncident.title}</h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-zinc-400 hover:text-zinc-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Details Box */}
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-xs font-semibold text-zinc-300">Technical Exploit Details:</span>
              <p className="text-xs text-zinc-400 font-mono whitespace-pre-wrap">{selectedIncident.details}</p>
            </div>

            {/* Workflow Status Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Triage & Workflow Status:</label>
              <div className="grid grid-cols-4 gap-2">
                {(['Open', 'Investigating', 'Resolved', 'Dismissed'] as IncidentStatus[]).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusDraft(st)}
                    className={`py-2 rounded-xl text-xs font-mono transition cursor-pointer border ${
                      statusDraft === st
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-semibold shadow-inner'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Remediation Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Remediation & Forensic Notes:</label>
              <textarea
                rows={4}
                value={notesDraft}
                onChange={e => setNotesDraft(e.target.value)}
                placeholder="Log containment actions, firewall regex rule adjustments, patched endpoints, or quarantine steps..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-hidden focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <span className="text-[11px] font-mono text-zinc-400">
                Created: {new Date(selectedIncident.created_at).toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveInvestigation}
                  disabled={savingUpdate}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {savingUpdate ? 'Saving...' : 'Update Incident Record'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual File Incident Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Flame className="h-4 w-4 text-rose-400" />
                Log Security Incident
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300">Incident Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Indirect jailbreak via markdown image injection"
                  className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-hidden"
                  >
                    <option value="Prompt Injection">Prompt Injection</option>
                    <option value="PII Leak">PII Leak</option>
                    <option value="Unauthorized Access">Unauthorized Access</option>
                    <option value="Toxicity">Toxicity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={e => setNewSeverity(e.target.value as IncidentSeverity)}
                    className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-hidden"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300">Details & Forensic Logs</label>
                <textarea
                  rows={4}
                  required
                  value={newDetails}
                  onChange={e => setNewDetails(e.target.value)}
                  placeholder="Describe reproduction steps, observed payload, or affected AI endpoint..."
                  className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-zinc-100 focus:outline-hidden focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition disabled:opacity-50"
                >
                  {creating ? 'Logging...' : 'Create Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
