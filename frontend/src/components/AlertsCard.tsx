import { Loader2, AlertTriangle, ShieldCheck, ExternalLink, Info } from 'lucide-react';
import type { Alert, AlertsResponse } from '../types/alerts';

interface Props {
  alertsData: AlertsResponse | null;
  isLoading: boolean;
  error: string;
}

const SEVERITY_STYLES: Record<string, { bg: string; border: string; badge: string; dot: string }> = {
  Red:    { bg: 'bg-red-500/10',    border: 'border-red-500/30',    badge: 'bg-red-500/20 text-red-300',    dot: 'bg-red-400'    },
  Orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', badge: 'bg-orange-500/20 text-orange-300', dot: 'bg-orange-400' },
  Green:  { bg: 'bg-emerald-500/10',border: 'border-emerald-500/30',badge: 'bg-emerald-500/20 text-emerald-300',dot: 'bg-emerald-400'},
  default:{ bg: 'bg-white/6',       border: 'border-white/10',      badge: 'bg-blue-500/20 text-blue-300',  dot: 'bg-blue-400'   },
};

function severityStyle(level: string | null) {
  return SEVERITY_STYLES[level ?? ''] ?? SEVERITY_STYLES.default;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString([], {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return null;
  }
}

function AlertItem({ alert }: { alert: Alert }) {
  const style = severityStyle(alert.severity);
  return (
    <div className={`${style.bg} ${style.border} border rounded-2xl px-5 py-4`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
          <p className="text-white text-sm font-semibold leading-snug line-clamp-3">
            {alert.title}
          </p>
        </div>
        {alert.link && (
          <a
            href={alert.link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-blue-400/60 hover:text-blue-400 transition-colors"
            aria-label="View original alert"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Description */}
      {alert.description && (
        <p className="text-xs text-blue-300/60 mt-2 ml-4 line-clamp-2">{alert.description}</p>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2 mt-3 ml-4">
        {/* Type badge */}
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}>
          {alert.type}
        </span>
        {/* Severity */}
        {alert.severity && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}>
            {alert.severity} alert
          </span>
        )}
        {/* Location */}
        {alert.location && (
          <span className="text-xs text-blue-300/50">{alert.location}</span>
        )}
        {/* Date */}
        {alert.fromDate && (
          <span className="text-xs text-blue-300/40">{formatDate(alert.fromDate)}</span>
        )}
        {/* Source */}
        <span className="text-xs text-blue-300/40 ml-auto">{alert.source}</span>
      </div>
    </div>
  );
}

export default function AlertsCard({ alertsData, isLoading, error }: Props) {
  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="mt-4 bg-white/8 border border-white/12 rounded-3xl px-6 py-6 flex items-center gap-3 text-blue-300">
        <Loader2 className="w-5 h-5 animate-spin shrink-0" />
        <span>Checking safety alerts…</span>
      </div>
    );
  }

  /* ── Hard error (couldn't reach backend) ── */
  if (error) {
    return (
      <div className="mt-4 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-3xl px-5 py-4 text-red-300">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Alerts unavailable</p>
          <p className="text-sm mt-0.5 text-red-300/80">{error}</p>
        </div>
      </div>
    );
  }

  if (!alertsData) return null;

  const { alerts, count, sources, isIndia } = alertsData;

  return (
    <div className="mt-4">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-orange-400" />
        <p className="text-xs text-blue-300/50 uppercase tracking-widest">
          Reports &amp; Safety Alerts
        </p>
        {/* Source pills */}
        <div className="flex gap-1.5 ml-auto">
          <span className={`text-xs px-2 py-0.5 rounded-full ${sources.gdacs.error ? 'bg-red-500/15 text-red-400' : 'bg-white/8 text-blue-300/50'}`}>
            GDACS {sources.gdacs.count > 0 ? `(${sources.gdacs.count})` : ''}
          </span>
          {isIndia && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${sources.sachet.error ? 'bg-red-500/15 text-red-400' : 'bg-white/8 text-blue-300/50'}`}>
              SACHET {sources.sachet.count > 0 ? `(${sources.sachet.count})` : ''}
            </span>
          )}
        </div>
      </div>

      {/* Source-level errors (partial failure) */}
      {(sources.gdacs.error || sources.sachet.error) && (
        <div className="flex items-start gap-2 bg-yellow-500/8 border border-yellow-500/20 rounded-2xl px-4 py-3 mb-3 text-yellow-300/80 text-xs">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {[sources.gdacs.error, sources.sachet.error].filter(Boolean).join(' ')}
          </span>
        </div>
      )}

      {/* No relevant alerts */}
      {count === 0 && (
        <div className="bg-white/6 border border-white/10 rounded-3xl px-6 py-6 flex items-center gap-3 text-blue-300/60">
          <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
          <div>
            <p className="font-medium text-white/70 text-sm">No relevant alerts found</p>
            <p className="text-xs mt-0.5 text-blue-300/50">
              No active disaster or government alerts are linked to this destination.
            </p>
          </div>
        </div>
      )}

      {/* Alert list */}
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
