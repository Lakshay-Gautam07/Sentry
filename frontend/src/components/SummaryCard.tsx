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
      <div className="rounded-[20px] bg-white p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(42,38,32,0.05)] border border-[#EAE4D9]/80">
        <div className="flex items-center justify-between gap-4 border-b border-[#EAE4D9]/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBF4EF] text-[#0E5B3C]">
              <Sparkles className="h-4 w-4 animate-spin" />
            </div>
            <div>
              <div className="h-4 w-48 rounded bg-[#FAF6EE] animate-pulse" />
              <div className="mt-1.5 h-3 w-32 rounded bg-[#FAF6EE] animate-pulse" />
            </div>
          </div>
          <div className="h-6 w-28 rounded-full bg-[#FAF6EE] animate-pulse" />
        </div>

        <div className="mt-6 space-y-3">
          <div className="h-4 w-full rounded bg-[#FAF6EE] animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-[#FAF6EE] animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-[#FAF6EE] animate-pulse" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="h-28 rounded-xl bg-[#FAF6EE] p-4 animate-pulse" />
          <div className="h-28 rounded-xl bg-[#FAF6EE] p-4 animate-pulse" />
          <div className="h-28 rounded-xl bg-[#FAF6EE] p-4 animate-pulse" />
        </div>
      </div>
    );
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="rounded-[20px] bg-white p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(42,38,32,0.05)] border border-[#FEE2E2]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-[#B91C1C] mt-0.5" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B91C1C]">
                Briefing Notice
              </span>
              <h4 className="font-serif text-base font-bold text-[#2A2620] mt-0.5">
                AI Travel Summary Unavailable
              </h4>
              <p className="mt-1 text-xs text-[#8A8378] leading-relaxed">{error}</p>
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0E5B3C] px-4 py-2 text-xs font-medium text-white transition-all hover:bg-[#0b472f] active:scale-95 shrink-0"
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

  const statusBadge = {
    Normal: {
      bg: 'bg-[#EBF4EF] border-[#CBE5D4] text-[#0E5B3C]',
      icon: <ShieldCheck className="h-3.5 w-3.5 text-[#0E5B3C]" />,
      label: 'Normal Conditions',
    },
    Caution: {
      bg: 'bg-[#FEF3C7] border-[#FDE68A] text-[#B45309]',
      icon: <AlertTriangle className="h-3.5 w-3.5 text-[#B45309]" />,
      label: 'Caution Advised',
    },
    Warning: {
      bg: 'bg-[#FEE2E2] border-[#FECACA] text-[#B91C1C]',
      icon: <ShieldAlert className="h-3.5 w-3.5 text-[#B91C1C]" />,
      label: 'Safety Alert Active',
    },
  }[safety?.level || 'Normal'];

  return (
    <div className="rounded-[20px] bg-white p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(42,38,32,0.05)] border border-[#EAE4D9]/80 transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE4D9]/60 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8378]">
            AI DESTINATION BRIEFING · SYNTHESIZED DISPATCH
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2A2620] mt-1">
            Executive Travel Summary
          </h2>
          <p className="text-xs text-[#8A8378] mt-0.5">
            Intelligence overview for {destination}
            {country ? `, ${country}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusBadge.bg}`}
          >
            {statusBadge.icon}
            <span>{statusBadge.label}</span>
          </span>

          {/* Database cache indicator */}
          {fromDatabase && (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-[#CBE5D4] bg-[#EBF4EF] px-2.5 py-1 text-[11px] font-medium text-[#0E5B3C]"
              title="Verified cache from MongoDB Atlas"
            >
              <Database className="h-3 w-3" />
              <span>Cached</span>
            </span>
          )}

          {/* Refresh button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="rounded-full border border-[#EAE4D9] bg-white p-2 text-[#8A8378] transition-all hover:border-[#0E5B3C] hover:text-[#0E5B3C] hover:bg-[#EBF4EF] active:scale-95"
              title="Regenerate summary with latest data"
              aria-label="Regenerate AI summary"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Editorial Pull-Quote / Lead Overview */}
      <div className="my-6 border-l-2 border-[#0E5B3C] bg-[#FAF6EE] pl-5 pr-4 py-4 rounded-r-xl">
        <p className="font-serif italic text-base sm:text-lg text-[#2A2620] leading-relaxed">
          &ldquo;{summary.overview}&rdquo;
        </p>
      </div>

      {/* 3-Column Magazine Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Safety & Alerts Card */}
        <div className="rounded-xl border border-[#EAE4D9]/70 bg-[#FAF6EE]/50 p-5 flex flex-col justify-between transition-colors hover:bg-[#FAF6EE]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0E5B3C] mb-2">
              <ShieldCheck className="h-4 w-4 text-[#0E5B3C]" />
              <span>Safety &amp; Security</span>
            </div>
            <p className="text-xs text-[#2A2620] leading-relaxed">
              {safety?.note || 'No active civil or natural hazards logged for travelers.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#EAE4D9]/60 text-[11px] font-medium text-[#8A8378]">
            Status: {safety?.level || 'Normal'}
          </div>
        </div>

        {/* Weather Outlook Card */}
        <div className="rounded-xl border border-[#EAE4D9]/70 bg-[#FAF6EE]/50 p-5 flex flex-col justify-between transition-colors hover:bg-[#FAF6EE]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B45309] mb-2">
              <CloudSun className="h-4 w-4 text-[#B45309]" />
              <span>Weather Outlook</span>
            </div>
            <p className="text-xs text-[#2A2620] leading-relaxed">
              {summary.weatherOutlook || 'Standard seasonal atmosphere expected.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#EAE4D9]/60 text-[11px] font-medium text-[#8A8378]">
            Atmospheric Brief
          </div>
        </div>

        {/* Recent Developments Card */}
        <div className="rounded-xl border border-[#EAE4D9]/70 bg-[#FAF6EE]/50 p-5 flex flex-col justify-between transition-colors hover:bg-[#FAF6EE]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0E5B3C] mb-2">
              <Newspaper className="h-4 w-4 text-[#0E5B3C]" />
              <span>Recent Events</span>
            </div>
            <p className="text-xs text-[#2A2620] leading-relaxed">
              {summary.recentDevelopments || 'No disruptive travel events reported in regional news.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#EAE4D9]/60 text-[11px] font-medium text-[#8A8378]">
            Dispatches Checked
          </div>
        </div>
      </div>

      {/* Practical Travel Advice */}
      {summary.travelAdvice && summary.travelAdvice.length > 0 && (
        <div className="mt-6 border-t border-[#EAE4D9]/60 pt-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8A8378] mb-3">
            <Compass className="h-4 w-4 text-[#0E5B3C]" />
            <span>Curated Travel Advice</span>
          </div>
          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {summary.travelAdvice.map((tip, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 rounded-xl border border-[#EAE4D9]/60 bg-[#FAF6EE]/40 p-3.5 text-xs text-[#2A2620] leading-relaxed"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EBF4EF] text-[11px] font-bold text-[#0E5B3C]">
                  {idx + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer Meta */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[#EAE4D9]/60 pt-4 text-[11px] text-[#8A8378]">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#0E5B3C]"></span>
          <span>Synthesized by Gemini 3.8 Flash &amp; Sentry Engine</span>
        </span>
        <span>General travel intelligence guidance</span>
      </div>
    </div>
  );
}
