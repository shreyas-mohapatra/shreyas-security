import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileKey,
  ShieldCheck,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Loader2,
  Trash2,
  Lock,
  Layers,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';

export const AnonymizerPage: React.FC = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState(
    `Patient: Sarah Connor (DOB: 02/28/1985, SSN: 219-48-9901).
Contact: sarah.connor@cyberdyne-defense.org, Mobile: +1 (555) 234-5678.
Insurance ID: BCBS-9941029.
Doctor note: Prescribed Lisinopril 20mg. Address: 442 SkyNet Blvd, Sunnyvale, CA 94086.`
  );
  const [maskingType, setMaskingType] = useState<'Redact' | 'Tokenize' | 'Partial' | 'Synthesize'>('Tokenize');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    originalText: string;
    maskedText: string;
    entitiesFound: { type: string; original: string; replacement: string }[];
    piiRiskScore: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const presets = [
    {
      title: 'Healthcare PHI Record',
      text: `Patient: Sarah Connor (DOB: 02/28/1985, SSN: 219-48-9901).
Contact: sarah.connor@cyberdyne-defense.org, Mobile: +1 (555) 234-5678.
Insurance ID: BCBS-9941029.
Doctor note: Prescribed Lisinopril 20mg. Address: 442 SkyNet Blvd, Sunnyvale, CA 94086.`,
    },
    {
      title: 'Financial & Billing Support Chat',
      text: `Support Agent: Hello, I have pulled up account #98124 for customer Robert Vance.
Customer: Yes, my credit card ending in 4921 expired. Here is the new Visa card: 4111-2222-3333-4444 (CVV 821, Exp 09/28). My email is bob.vance@vancerefrigeration.com.
Support Agent: Thank you, processed $450 charge.`,
    },
    {
      title: 'Server Error Log with Secret Keys',
      text: `2026-10-30T04:12:09Z [ERROR] Authentication failure at endpoint /v1/models/predict
Request Headers:
  Authorization: Bearer sk-live-9281938201928301923810293
  X-Forwarded-For: 198.51.100.42
Payload: { "userId": "usr_99124", "internalEmail": "dev-ops@internal.acme.cloud" }`,
    },
  ];

  const handleAnonymize = async () => {
    if (!inputText.trim()) return;
    setLoading(true);

    try {
      const res = await api.maskData({ text: inputText, maskingType });
      setResult(res);
    } catch (err) {
      console.error('Failed to anonymize data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.maskedText) return;
    navigator.clipboard.writeText(result.maskedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToFirewall = () => {
    if (!result?.maskedText) return;
    navigate('/firewall');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Data Anonymizer & Tokenizer</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60 font-medium">
              PRIVACY SHIELD
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Scrub or tokenize sensitive personal identifiers (PII), protected health data (PHI), and API credentials prior to AI model ingestion.
          </p>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
            Load Sensitive Data Sample
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(preset.text)}
              className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition flex items-center gap-2 cursor-pointer"
            >
              <Terminal className="h-3.5 w-3.5 text-indigo-400" />
              <span>{preset.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-zinc-400 font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-indigo-400" />
              Raw Sensitive Input
            </span>
            <button
              onClick={() => setInputText('')}
              className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>

          <textarea
            rows={10}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Paste text containing unmasked PII, names, emails, credit cards, or medical IDs..."
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl p-3.5 font-mono text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-indigo-500 transition resize-y"
          />

          {/* Strategy Selector */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <span className="text-xs text-zinc-400 font-medium block">De-Identification Strategy:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Tokenize', name: 'Tokenize', desc: 'TKN_EM_9A42' },
                { id: 'Redact', name: 'Redact', desc: '[REDACTED_EMAIL]' },
                { id: 'Partial', name: 'Partial Mask', desc: 'j***@acme.com' },
                { id: 'Synthesize', name: 'Synthesize', desc: 'Realistic Dummy' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setMaskingType(opt.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    maskingType === opt.id
                      ? 'bg-indigo-950/80 border-indigo-700 text-indigo-200'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                  }`}
                >
                  <p className="text-xs font-semibold">{opt.name}</p>
                  <p className="text-[10px] font-mono opacity-70 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAnonymize}
            disabled={loading || !inputText.trim()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            <span>{loading ? 'Scrubbing and Tokenizing Entities...' : 'Run De-Identification Engine'}</span>
          </button>
        </div>

        {/* Output Panel */}
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase text-zinc-300 font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Sanitized & Safe Payload
              </span>
              {result && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-mono transition cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {result ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-emerald-200/90 whitespace-pre-wrap min-h-[180px]">
                  {result.maskedText}
                </div>

                {/* Entity Detection Ledger */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-zinc-300">
                      Detected & De-Identified Entities ({result.entitiesFound.length})
                    </span>
                    <span className="text-xs font-mono text-indigo-400">
                      PII Risk Eliminated: {(result.piiRiskScore * 100).toFixed(0)}%
                    </span>
                  </div>

                  {result.entitiesFound.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {result.entitiesFound.map((ent, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs font-mono"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 text-[10px] font-bold">
                              {ent.type}
                            </span>
                            <span className="text-zinc-500 line-through truncate max-w-[140px]">{ent.original}</span>
                          </div>
                          <span className="text-emerald-400 font-semibold">{ent.replacement}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">No sensitive personal identifiers detected.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-zinc-500 text-xs space-y-2">
                <FileKey className="h-8 w-8 mx-auto text-zinc-600" />
                <p>Run the de-identification engine to preview scrubbed data and entity tokens.</p>
              </div>
            )}
          </div>

          {result && (
            <div className="pt-4 border-t border-zinc-800">
              <button
                onClick={handleSendToFirewall}
                className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Audit Output in AI Security Firewall</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
