import { Loader2, AlertTriangle, ShieldCheck, ExternalLink, Info, ShieldAlert } from 'lucide-react';
import type { Alert, AlertsResponse } from '../types/alerts';

interface Props {
  alertsData: AlertsResponse | null;
  isLoading: boolean;
  error: string;
}

const SEVERITY_STYLES: Record<string, { bg: string; border: string; badge: string; dot: string }> = {
  Red: {
    bg: 'bg-red-500/10 hover:bg-red-500/15',
    border: 'border-red-500/30',
    badge: 'bg-red-500/20 text-red-300 border-red-500/30',
    dot: 'bg-red-400',
  },
  Orange: {
    bg: 'bg-orange-500/10 hover:bg-orange-500/15',
    border: 'border-orange-500/30',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    dot: 'bg-orange-400',
  },
  Green: {
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/15',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  default: {
    bg: 'bg-white/[0.04] hover:bg-white/[0.07]',
    border: 'border-white/10',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    dot: 'bg-blue-400',
  },
};

function severityStyle(level: string | null) {
  return SEVERITY_STYLES[level ?? ''] ?? SEVERITY_STYLES.default;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

function AlertItem({ alert }: { alert: Alert }) {
  const style = severityStyle(alert.severity);

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-2xl p-4 sm:p-5 transition-all duration-200`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${style.dot}`} />
          <h4 className="text-white text-sm font-semibold leading-snug line-clamp-2">
            {alert.title}
          </h4>
        </div>
        {alert.link && (
          <a
            href={alert.link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 p-1 rounded-lg text-blue-300/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="View official advisory link"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {/* Description */}
      {alert.description && (
        <p className="text-xs text-blue-200/70 mt-2 pl-4 line-clamp-3 leading-relaxed">
          {alert.description}
        </p>
      )}

      {/* Meta tags row */}
      <div className="flex flex-wrap items-center gap-2 mt-3.5 pl-4 text-[11px]">
        {/* Type badge */}
        <span className={`font-semibold px-2.5 py-0.5 rounded-full border ${style.badge}`}>
          {alert.type}
        </span>

        {/* Severity */}
        {alert.severity && (
          <span className={`font-semibold px-2.5 py-0.5 rounded-full border ${style.badge}`}>
            {alert.severity} Severity
          </span>
        )}

        {/* Location */}
        {alert.location && (
          <span className="text-blue-300/60 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
            📍 {alert.location}
          </span>
        )}

        {/* Date */}
        {alert.fromDate && (
          <span className="text-blue-300/50">
            {formatDate(alert.fromDate)}
          </span>
        )}

        {/* Official agency source */}
        <span className="text-blue-300/40 ml-auto font-medium">
          Source: {alert.source}
        </span>
      </div>
    </div>
  );
}

export default function AlertsCard({ alertsData, isLoading, error }: Props) {
  /* ── Loading Skeleton ── */
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 text-blue-300">
          <Loader2 className="h-5 w-5 animate-spin text-orange-400" />
          <span className="text-sm font-medium">Screening global and official disaster alerts…</span>
        </div>
      </div>
    );
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/25 bg-red-500/10 p-5 sm:p-6 text-red-200 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-white">Alert Screening Unavailable</h4>
            <p className="mt-1 text-xs text-red-300/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!alertsData) return null;

  const { alerts, count, sources, isIndia } = alertsData;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-orange-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-blue-300/60">
            Safety &amp; Emergency Alerts
          </h3>
        </div>

        {/* Source Pills */}
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
              sources.gdacs.error
                ? 'border-red-500/30 bg-red-500/15 text-red-400'
                : 'border-white/8 bg-white/5 text-blue-300/60'
            }`}
          >
            GDACS Global {sources.gdacs.count > 0 ? `(${sources.gdacs.count})` : ''}
          </span>
          {isIndia && (
            <span
              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                sources.sachet.error
                  ? 'border-red-500/30 bg-red-500/15 text-red-400'
                  : 'border-white/8 bg-white/5 text-blue-300/60'
              }`}
            >
              NDMA SACHET {sources.sachet.count > 0 ? `(${sources.sachet.count})` : ''}
            </span>
          )}
        </div>
      </div>

      {/* Partial Provider Warnings */}
      {(sources.gdacs.error || sources.sachet.error) && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3.5 text-xs text-yellow-200/90">
          <Info className="h-4 w-4 shrink-0 text-yellow-400 mt-0.5" />
          <span>
            {[sources.gdacs.error, sources.sachet.error].filter(Boolean).join(' ')}
          </span>
        </div>
      )}

      {/* No active alerts (All Clear) */}
      {count === 0 && (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 shadow-xl backdrop-blur-xl flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white">All Clear — No Active Advisories</h4>
            <p className="mt-0.5 text-xs text-blue-200/70">
              No severe weather, earthquake, flood, or civil emergency advisories are currently in effect for this destination.
            </p>
          </div>
        </div>
      )}

      {/* Active Alerts List */}
      {count > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
