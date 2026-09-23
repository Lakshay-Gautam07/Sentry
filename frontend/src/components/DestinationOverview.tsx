import { MapPin, Globe, Clock, ArrowLeft, Sparkles, CloudSun, ShieldAlert, Newspaper, Camera, Play, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { Destination } from '../types/destination';
import type { WeatherData } from '../types/weather';
import type { AlertsResponse } from '../types/alerts';
import type { SummaryResponse } from '../types/summary';

interface Props {
  destination: Destination;
  weather: WeatherData | null;
  alertsData: AlertsResponse | null;
  summaryData: SummaryResponse | null;
  photosCount: number;
  videosCount: number;
  newsCount: number;
  onBack: () => void;
}

export default function DestinationOverview({
  destination,
  weather,
  alertsData,
  summaryData,
  photosCount,
  videosCount,
  newsCount,
  onBack,
}: Props) {
  const safetyLevel =
    summaryData?.summary?.safetyAssessment?.level ||
    (alertsData && alertsData.count > 0 ? 'Caution' : 'Normal');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90; // offset for sticky navigation header
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const safetyBadgeConfig = {
    Normal: {
      bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
      label: 'Normal Conditions',
    },
    Caution: {
      bg: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
      label: 'Caution Advised',
    },
    Warning: {
      bg: 'bg-red-500/10 text-red-300 border-red-500/25',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400" />,
      label: 'Safety Alert Active',
    },
  }[safetyLevel] || {
    bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
    label: 'Normal Conditions',
  };

  return (
    <div className="space-y-4">
      {/* ── Hero Destination Card ── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-blue-950/80 to-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        {/* Top bar: Back button & Sentry badge */}
        <div className="relative z-10 flex items-center justify-between gap-4 mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-blue-200/80 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
            aria-label="Back to search results"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Search</span>
          </button>

          <div className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
            </span>
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Destination Intelligence</span>
          </div>
        </div>

        {/* Main Hero Header */}
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>Location Profile</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              {destination.name}
            </h1>

            <p className="text-base sm:text-lg font-medium text-blue-200/80">
              {[destination.region, destination.country].filter(Boolean).join(', ')}
              {destination.countryCode ? ` (${destination.countryCode})` : ''}
            </p>

            {/* Geographical details & Safety status */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
              {/* Coordinates */}
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/8 bg-white/5 px-3 py-1.5 font-mono text-slate-300">
                <span className="text-blue-400">📍</span>
                {destination.latitude.toFixed(4)}°, {destination.longitude.toFixed(4)}°
              </span>

              {/* Timezone */}
              {destination.timezone && (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/8 bg-white/5 px-3 py-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>{destination.timezone}</span>
                </span>
              )}

              {/* Real-time Safety assessment indicator */}
              <span
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-semibold ${safetyBadgeConfig.bg}`}
              >
                {safetyBadgeConfig.icon}
                <span>{safetyBadgeConfig.label}</span>
              </span>
            </div>
          </div>

          {/* Live Weather Glance Widget */}
          {weather?.current && (
            <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all hover:border-white/20 sm:min-w-[180px]">
              <div className="flex items-center gap-3">
                <span className="text-4xl leading-none">{weather.current.emoji}</span>
                <div>
                  <div className="text-3xl font-light tracking-tight text-white leading-none">
                    {Math.round(weather.current.temperature)}°C
                  </div>
                  <div className="mt-1 text-xs font-medium text-blue-200/70">
                    {weather.current.condition}
                  </div>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-[11px] text-blue-300/60">
                <span>Feels {Math.round(weather.current.apparentTemperature)}°C</span>
                <span>💧 {weather.current.humidity}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky Jump Navigation Pill Bar ── */}
      <nav
        aria-label="Section Navigation"
        className="sticky top-4 z-30 flex items-center gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/80 p-2 shadow-xl backdrop-blur-md no-scrollbar"
      >
        <span className="pl-2 pr-1 text-[11px] font-bold uppercase tracking-wider text-blue-300/40 shrink-0">
          Jump to:
        </span>

        <button
          onClick={() => scrollToSection('section-summary')}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-purple-500/25 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-200 transition-all hover:bg-purple-500/20 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>AI Summary</span>
        </button>

        <button
          onClick={() => scrollToSection('section-weather')}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-blue-500/25 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-200 transition-all hover:bg-blue-500/20 active:scale-95"
        >
          <CloudSun className="w-3.5 h-3.5 text-blue-400" />
          <span>Weather</span>
        </button>

        <button
          onClick={() => scrollToSection('section-alerts')}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
            safetyLevel === 'Warning'
              ? 'border-red-500/30 bg-red-500/15 text-red-200 hover:bg-red-500/25'
              : safetyLevel === 'Caution'
              ? 'border-amber-500/30 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25'
              : 'border-emerald-500/30 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Alerts {alertsData?.count ? `(${alertsData.count})` : ''}</span>
        </button>

        <button
          onClick={() => scrollToSection('section-news')}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-sky-500/25 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-200 transition-all hover:bg-sky-500/20 active:scale-95"
        >
          <Newspaper className="w-3.5 h-3.5 text-sky-400" />
          <span>News {newsCount > 0 ? `(${newsCount})` : ''}</span>
        </button>

        <button
          onClick={() => scrollToSection('section-photos')}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-indigo-500/25 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-200 transition-all hover:bg-indigo-500/20 active:scale-95"
        >
          <Camera className="w-3.5 h-3.5 text-indigo-400" />
          <span>Photos {photosCount > 0 ? `(${photosCount})` : ''}</span>
        </button>

        <button
          onClick={() => scrollToSection('section-videos')}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition-all hover:bg-rose-500/20 active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-rose-400/50 text-rose-400" />
          <span>Videos {videosCount > 0 ? `(${videosCount})` : ''}</span>
        </button>
      </nav>
    </div>
  );
}
