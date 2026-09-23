import { Sparkles, ShieldCheck, AlertTriangle, CloudSun, Newspaper, Compass, Database, RotateCw, AlertCircle } from 'lucide-react';
import type { SummaryResponse } from '../types/summary';

interface Props {
  summaryData: SummaryResponse | null;
  isLoading: boolean;
  error: string;
  onRefresh?: () => void;
}

export default function SummaryCard({ summaryData, isLoading, error, onRefresh }: Props) {
  /* ── Loading state ── */
  if (isLoading) {
    return (
      <div className="mt-4 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-slate-900/40 border border-purple-500/30 rounded-3xl p-6 text-blue-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
            <Sparkles className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Generating AI Travel Summary</h3>
            <p className="text-xs text-blue-300/60 mt-0.5">
              Synthesizing real-time weather, safety alerts, and recent news with Gemini AI…
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2.5">
          <div className="h-4 bg-white/10 rounded-full animate-pulse w-3/4"></div>
          <div className="h-4 bg-white/10 rounded-full animate-pulse w-5/6"></div>
          <div className="h-4 bg-white/10 rounded-full animate-pulse w-2/3"></div>
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="mt-4 flex items-start justify-between gap-3 bg-red-500/10 border border-red-500/30 rounded-3xl p-5 text-red-300">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">AI Summary unavailable</p>
            <p className="text-xs mt-0.5 text-red-300/80">{error}</p>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-xs font-medium text-white transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" /> Retry
          </button>
        )}
      </div>
    );
  }

  if (!summaryData?.summary) return null;

  const { summary, fromDatabase, destination, country } = summaryData;
  const safety = summary.safetyAssessment;

  const safetyBadge = {
    Normal: {
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
      label: 'Normal Conditions'
    },
    Caution: {
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
      label: 'Caution Advised'
    },
    Warning: {
      bg: 'bg-red-500/15 border-red-500/30 text-red-300',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
      label: 'Safety Alert Active'
    }
  }[safety?.level || 'Normal'];

  return (
    <div className="mt-4 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/30 border border-indigo-500/25 rounded-3xl p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300 border border-indigo-400/30">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Sentry AI Intelligence Briefing
            </h3>
            <p className="text-[11px] text-blue-300/60">
              {destination}{country ? `, ${country}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Safety level badge */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${safetyBadge.bg}`}>
            {safetyBadge.icon}
            {safetyBadge.label}
          </span>

          {/* MongoDB cache badge */}
          {fromDatabase && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-3 h-3" /> Cached in DB
            </span>
          )}

          {/* Refresh button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg bg-white/6 hover:bg-white/12 text-blue-300/70 hover:text-white transition-colors"
              title="Regenerate summary"
              aria-label="Regenerate AI summary"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Executive Overview */}
      <p className="text-white/90 text-sm leading-relaxed mb-4">
        {summary.overview}
      </p>

      {/* Grid of Intel Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Safety Note */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-300/80 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Safety &amp; Alerts
          </div>
          <p className="text-xs text-blue-100/80 leading-snug">
            {safety?.note || 'No active alerts detected.'}
          </p>
        </div>

        {/* Weather Outlook */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-300/80 mb-1.5">
            <CloudSun className="w-4 h-4 text-amber-400" />
            Weather Outlook
          </div>
          <p className="text-xs text-blue-100/80 leading-snug">
            {summary.weatherOutlook || 'Standard seasonal conditions.'}
          </p>
        </div>

        {/* Recent Developments */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-300/80 mb-1.5">
            <Newspaper className="w-4 h-4 text-blue-400" />
            Recent News &amp; Events
          </div>
          <p className="text-xs text-blue-100/80 leading-snug">
            {summary.recentDevelopments || 'No disruptive events reported.'}
          </p>
        </div>
      </div>

      {/* Travel Advice (Clearly noted as general advice) */}
      {summary.travelAdvice && summary.travelAdvice.length > 0 && (
        <div className="pt-3 border-t border-white/8">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 mb-2">
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            General Travel Advice
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-200/75">
            {summary.travelAdvice.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-white/4 rounded-xl px-3 py-2">
                <span className="text-purple-400 font-bold shrink-0">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer attribution */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-blue-300/40">
        <span>Powered by Gemini AI &amp; Sentry Intelligence Engine</span>
        <span>Real-time synthesis</span>
      </div>
    </div>
  );
}
