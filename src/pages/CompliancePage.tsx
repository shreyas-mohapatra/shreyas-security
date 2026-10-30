import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  FileCheck,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import { ComplianceReport, ComplianceFramework } from '../types';

export const CompliancePage: React.FC = () => {
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchReport = async () => {
    try {
      const data = await api.getComplianceReport();
      setReport(data);
    } catch (err) {
      console.error('Failed to get compliance report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleDownloadJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SecureTrust-AI-Compliance-Report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const displayedFrameworks = report?.frameworks.filter(
    f => selectedFrameworkId === 'all' || f.id === selectedFrameworkId
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Compliance & Trust Auditing</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800/60 font-medium">
              CONTINUOUS ASSURANCE
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Continuous posture assessment against GDPR, HIPAA, SOC 2 Type II, ISO 27001, and NIST AI RMF 1.0.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
            <span>Re-evaluate</span>
          </button>
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-semibold text-xs shadow-md shadow-teal-500/20 transition cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Audit Package</span>
          </button>
        </div>
      </div>

      {report && (
        <>
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 shadow-lg">
              <span className="text-xs font-mono uppercase text-zinc-400">Overall Trust Score</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-teal-400">{report.overallScore}%</span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">Audit Ready</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Based on {report.summary.totalControls} control evaluations</p>
            </div>

            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 shadow-lg">
              <span className="text-xs font-mono uppercase text-zinc-400">Controls Passed</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-emerald-400">
                  {report.summary.passingControls}/{report.summary.totalControls}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  {Math.round((report.summary.passingControls / report.summary.totalControls) * 100)}%
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Zero non-conformities on data minimization</p>
            </div>

            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 shadow-lg">
              <span className="text-xs font-mono uppercase text-zinc-400">Frameworks Assessed</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-cyan-400">
                  {report.summary.frameworksEvaluated}
                </span>
                <span className="text-xs font-mono text-cyan-400">Standards</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">GDPR, SOC 2, HIPAA, NIST AI, ISO 27001</p>
            </div>

            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 shadow-lg">
              <span className="text-xs font-mono uppercase text-zinc-400">Open Incident Impact</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-amber-400">
                  {report.summary.openIncidentImpact}
                </span>
                <span className="text-xs font-mono text-amber-400 font-semibold">Triage Pending</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Resolve open incidents to reach 100%</p>
            </div>
          </div>

          {/* Framework Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedFrameworkId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer border ${
                selectedFrameworkId === 'all'
                  ? 'bg-teal-950 text-teal-300 border-teal-700 font-semibold'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              All Frameworks ({report.frameworks.length})
            </button>
            {report.frameworks.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFrameworkId(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer border ${
                  selectedFrameworkId === f.id
                    ? 'bg-teal-950 text-teal-300 border-teal-700 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {f.name.split(' ')[0]} ({f.score}%)
              </button>
            ))}
          </div>

          {/* Frameworks & Controls Detailed View */}
          <div className="space-y-6">
            {displayedFrameworks?.map(framework => (
              <div
                key={framework.id}
                className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-6 shadow-lg space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                  <div>
                    <h3 className="text-base font-bold text-zinc-100">{framework.name}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Automated control evaluation and audit evidence</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                        framework.score >= 90
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {framework.status} • {framework.score}%
                    </span>
                  </div>
                </div>

                {/* Controls List */}
                <div className="space-y-3">
                  {framework.controls.map((control, idx) => {
                    const isPassed = control.status === 'Passed';
                    const isWarning = control.status === 'Warning';
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-cyan-400">{control.code}</span>
                            <span className="text-xs font-medium text-zinc-200">{control.name}</span>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">{control.detail}</p>
                        </div>
                        <span
                          className={`self-start md:self-center shrink-0 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold border flex items-center gap-1.5 ${
                            isPassed
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                              : isWarning
                              ? 'bg-amber-950/80 text-amber-400 border-amber-800/60'
                              : 'bg-rose-950/80 text-rose-400 border-rose-800/60'
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                          {control.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
