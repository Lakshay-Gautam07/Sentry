import { Sparkles, ShieldCheck, AlertTriangle, CloudSun, Newspaper, Compass, Database, RotateCw, AlertCircle, ShieldAlert } from 'lucide-react';
import type { SummaryResponse } from '../types/summary';

interface Props {
  summaryData: SummaryResponse | null;
  isLoading: boolean;
  error: string;
  onRefresh?: () => void;
}

export default function SummaryCard({ summaryData, isLoading, error, onRefresh }: Props) {
  /* ── Loading Skeleton State ── */
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/40 p-6 sm:p-7 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/20 text-purple-300">
              <Sparkles className="h-4 w-4 animate-spin text-purple-400" />
            </div>
            <div>
              <div className="h-4 w-48 rounded-lg bg-white/10 animate-pulse" />
              <div className="mt-1.5 h-3 w-32 rounded bg-white/5 animate-pulse" />
            </div>
          </div>
          <div className="h-6 w-28 rounded-full bg-white/10 animate-pulse" />
        </div>

        <div className="mt-5 space-y-3">
          <div className="h-4 w-full rounded bg-white/10 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-white/10 animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-white/10 animate-pulse" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="h-24 rounded-2xl border border-white/5 bg-white/5 p-4 animate-pulse" />
          <div className="h-24 rounded-2xl border border-white/5 bg-white/5 p-4 animate-pulse" />
          <div className="h-24 rounded-2xl border border-white/5 bg-white/5 p-4 animate-pulse" />
        </div>
      </div>
    );
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/25 bg-red-500/10 p-5 sm:p-6 text-red-200 backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">AI Travel Briefing Unavailable</h4>
              <p className="mt-1 text-xs text-red-300/80 leading-relaxed">{error}</p>
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-red-500/30 active:scale-95 shrink-0"
              aria-label="Retry AI summary generation"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!summaryData?.summary) return null;

  const { summary, fromDatabase, destination, country } = summaryData;
  const safety = summary.safetyAssessment;

  const safetyBadge = {
    Normal: {
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />,
      label: 'Normal Conditions',
    },
    Caution: {
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />,
      label: 'Caution Advised',
    },
    Warning: {
      bg: 'bg-red-500/15 border-red-500/30 text-red-300',
      icon: <ShieldAlert className="h-3.5 w-3.5 text-red-400" />,
      label: 'Safety Alert Active',
    },
  }[safety?.level || 'Normal'];

  return (
    <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-slate-900/70 to-purple-950/30 p-6 sm:p-7 shadow-xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/20 text-indigo-300">
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
              Sentry AI Intelligence Briefing
            </h3>
            <p className="text-xs text-blue-300/60">
              {destination}{country ? `, ${country}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Safety status pill */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${safetyBadge.bg}`}
          >
            {safetyBadge.icon}
            <span>{safetyBadge.label}</span>
          </span>

          {/* MongoDB database cached indicator */}
          {fromDatabase && (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400"
              title="Retrieved from MongoDB cache"
            >
              <Database className="h-3 w-3" />
              <span>Cached</span>
            </span>
          )}

          {/* Regenerate button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-blue-300/70 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
              title="Regenerate summary with latest data"
              aria-label="Regenerate AI summary"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Executive Overview */}
      <div className="mt-4">
        <p className="text-sm sm:text-[15px] leading-relaxed text-slate-100/90 font-normal">
          {summary.overview}
        </p>
      </div>

      {/* 3-Column Intelligence Cards */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Safety & Alerts Card */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 flex flex-col justify-between transition-colors hover:bg-white/[0.06]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2">
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            <span>Safety &amp; Alerts</span>
          </div>
          <p className="text-xs text-blue-100/80 leading-relaxed">
            {safety?.note || 'No active natural or civil alerts recorded.'}
          </p>
        </div>

        {/* Weather Outlook Card */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 flex flex-col justify-between transition-colors hover:bg-white/[0.06]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
            <CloudSun className="h-4 w-4 text-amber-400" />
            <span>Weather Outlook</span>
          </div>
          <p className="text-xs text-blue-100/80 leading-relaxed">
            {summary.weatherOutlook || 'Standard seasonal weather prevailing.'}
          </p>
        </div>

        {/* Recent Developments Card */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 flex flex-col justify-between transition-colors hover:bg-white/[0.06]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300 mb-2">
            <Newspaper className="h-4 w-4 text-sky-400" />
            <span>Recent Events</span>
          </div>
          <p className="text-xs text-blue-100/80 leading-relaxed">
            {summary.recentDevelopments || 'No disruptive travel events reported.'}
          </p>
        </div>
      </div>

      {/* General Travel Advice */}
      {summary.travelAdvice && summary.travelAdvice.length > 0 && (
        <div className="mt-5 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300 mb-3">
            <Compass className="h-4 w-4 text-purple-400" />
            <span>Practical Travel Advice</span>
          </div>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {summary.travelAdvice.map((tip, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-2.5 text-xs text-blue-200/80 leading-snug"
              >
                <span className="font-bold text-purple-400 shrink-0">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer Meta */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3 text-[11px] text-blue-300/40">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          <span>Synthesized by Gemini AI &amp; Sentry Engine</span>
        </span>
        <span>General travel guidance only</span>
      </div>
    </div>
  );
}
