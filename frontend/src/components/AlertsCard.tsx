import { Loader2, AlertTriangle, ShieldCheck, ExternalLink, ShieldAlert } from 'lucide-react';
import type { Alert, AlertsResponse } from '../types/alerts';

interface Props {
  alertsData: AlertsResponse | null;
  isLoading: boolean;
  error: string;
}

const SEVERITY_STYLES: Record<string, { bg: string; border: string; badge: string; dot: string; title: string }> = {
  Red: {
    bg: 'bg-[#FEE2E2]/60 hover:bg-[#FEE2E2]/80',
    border: 'border-[#FECACA]',
    badge: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]',
    dot: 'bg-[#B91C1C]',
    title: 'text-[#B91C1C]',
  },
  Orange: {
    bg: 'bg-[#FEF3C7]/60 hover:bg-[#FEF3C7]/80',
    border: 'border-[#FDE68A]',
    badge: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
    dot: 'bg-[#B45309]',
    title: 'text-[#B45309]',
  },
  Green: {
    bg: 'bg-[#EBF4EF]/60 hover:bg-[#EBF4EF]/80',
    border: 'border-[#CBE5D4]',
    badge: 'bg-[#EBF4EF] text-[#0E5B3C] border-[#CBE5D4]',
    dot: 'bg-[#0E5B3C]',
    title: 'text-[#0E5B3C]',
  },
  default: {
    bg: 'bg-[#FAF6EE]/70 hover:bg-[#FAF6EE]',
    border: 'border-[#EAE4D9]',
    badge: 'bg-[#FAF6EE] text-[#2A2620] border-[#EAE4D9]',
    dot: 'bg-[#8A8378]',
    title: 'text-[#2A2620]',
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
    <div className={`${style.bg} ${style.border} border rounded-xl p-4 sm:p-5 transition-all`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${style.dot}`} />
          <h4 className="font-serif text-sm font-bold text-[#2A2620] leading-snug">
            {alert.title}
          </h4>
        </div>
        {alert.link && (
          <a
            href={alert.link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full border border-[#EAE4D9] bg-white p-1.5 text-[#8A8378] hover:text-[#0E5B3C] hover:border-[#0E5B3C] transition-colors"
            aria-label="View official advisory link"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {/* Description */}
      {alert.description && (
        <p className="text-xs text-[#2A2620]/80 mt-2 pl-4 line-clamp-3 leading-relaxed">
          {alert.description}
        </p>
      )}

      {/* Meta tags row */}
      <div className="flex flex-wrap items-center gap-2 mt-3.5 pl-4 text-[11px]">
        {/* Type badge */}
        <span className={`font-medium px-2.5 py-0.5 rounded-full border ${style.badge}`}>
          {alert.type}
        </span>

        {/* Severity */}
        {alert.severity && (
          <span className={`font-medium px-2.5 py-0.5 rounded-full border ${style.badge}`}>
            {alert.severity} Severity
          </span>
        )}

        {/* Source */}
        {alert.source && (
          <span className="font-medium px-2.5 py-0.5 rounded-full border border-[#EAE4D9] bg-white text-[#8A8378]">
            Source: {alert.source}
          </span>
        )}

        {/* Date */}
        {(alert.fromDate || alert.toDate) && (
          <span className="text-[#8A8378] text-[11px] ml-auto">
            Reported {formatDate(alert.fromDate || alert.toDate)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function AlertsCard({ alertsData, isLoading, error }: Props) {
  /* ── Loading Skeleton ── */
  if (isLoading) {
    return (
      <div className="rounded-[20px] bg-white p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(42,38,32,0.05)] border border-[#EAE4D9]/80">
        <div className="flex items-center gap-3 text-[#8A8378] mb-4">
          <Loader2 className="h-5 w-5 animate-spin text-[#0E5B3C]" />
          <span className="text-sm font-medium">Scanning regional disaster and security networks…</span>
        </div>
        <div className="space-y-3 animate-pulse">
          <div className="h-20 rounded-xl bg-[#FAF6EE]" />
          <div className="h-20 rounded-xl bg-[#FAF6EE]" />
        </div>
      </div>
    );
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="rounded-[20px] bg-white p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(42,38,32,0.05)] border border-[#FEE2E2]">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-[#B91C1C] mt-0.5" />
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B91C1C]">
              Safety Monitor
            </span>
            <h4 className="font-serif text-base font-bold text-[#2A2620] mt-0.5">
              Alerts Feed Offline
            </h4>
            <p className="mt-1 text-xs text-[#8A8378] leading-relaxed">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!alertsData) return null;

  const { count, alerts } = alertsData;
  const hasAlerts = count > 0 && alerts.length > 0;

  return (
    <div className="rounded-[20px] bg-white p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(42,38,32,0.05)] border border-[#EAE4D9]/80 space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE4D9]/60 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8378]">
            SAFETY &amp; EMERGENCY BULLETIN · REAL-TIME ADVISORIES
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2A2620] mt-1">
            Trip Alerts &amp; Advisories
          </h2>
          <p className="text-xs text-[#8A8378] mt-0.5">
            GDACS Global Disaster Network &amp; Government Emergency Dispatches
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
            hasAlerts
              ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
              : 'bg-[#EBF4EF] text-[#0E5B3C] border-[#CBE5D4]'
          }`}
        >
          {hasAlerts ? (
            <>
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{count} Active Alert{count > 1 ? 's' : ''}</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Zero Active Hazards</span>
            </>
          )}
        </span>
      </div>

      {/* ── Empty State / All Clear ── */}
      {!hasAlerts && (
        <div className="rounded-xl border border-[#CBE5D4] bg-[#EBF4EF]/50 p-5 text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EBF4EF] text-[#0E5B3C]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="font-serif text-base font-bold text-[#2A2620]">
              All Clear — No Travel Disruptions Reported
            </h4>
            <p className="text-xs text-[#8A8378] max-w-md leading-relaxed">
              No earthquakes, cyclones, severe floods, or civil emergencies are currently indexed within the region. Standard traveler vigilance is advised.
            </p>
          </div>
        </div>
      )}

      {/* ── Alerts List ── */}
      {hasAlerts && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {/* Footer Notice */}
      <div className="border-t border-[#EAE4D9]/60 pt-4 flex items-center justify-between text-[11px] text-[#8A8378]">
        <span>Sources: GDACS, NDMA SACHET India, Copernicus</span>
        <span>Updated continuously</span>
      </div>
    </div>
  );
}
