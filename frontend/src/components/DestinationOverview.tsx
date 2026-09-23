import { MapPin, Globe, Clock, ArrowLeft, Sparkles, CloudSun, ShieldAlert, Newspaper, Camera, Play } from 'lucide-react';
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
  const safetyLevel = summaryData?.summary?.safetyAssessment?.level || (alertsData && alertsData.count > 0 ? 'Caution' : 'Normal');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-slate-900/90 via-blue-950/80 to-slate-900/90 border border-white/12 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
      {/* Top action row */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-300/70 hover:text-white bg-white/6 hover:bg-white/12 px-3.5 py-1.5 rounded-full transition-all border border-white/8"
          aria-label="Back to search results"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Search
        </button>

        <div className="flex items-center gap-2 text-xs text-blue-300/50">
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span>Sentry Destination Intelligence</span>
        </div>
      </div>

      {/* Main Destination Hero Title & Geo Badges */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>Destination Overview</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {destination.name}
          </h1>

          <p className="text-blue-200/80 text-sm mt-1">
            {[destination.region, destination.country].filter(Boolean).join(', ')}
            {destination.countryCode ? ` (${destination.countryCode})` : ''}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-blue-300/60">
            <span className="bg-white/6 px-2.5 py-1 rounded-lg border border-white/6 flex items-center gap-1.5">
              <span>📍</span>
              {destination.latitude.toFixed(4)}°, {destination.longitude.toFixed(4)}°
            </span>
            {destination.timezone && (
              <span className="bg-white/6 px-2.5 py-1 rounded-lg border border-white/6 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-blue-400" />
                {destination.timezone}
              </span>
            )}
          </div>
        </div>

        {/* Live Weather Glance if loaded */}
        {weather?.current && (
          <div className="bg-white/6 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 shrink-0 self-start md:self-auto">
            <span className="text-3xl">{weather.current.emoji}</span>
            <div>
              <div className="text-2xl font-light text-white leading-tight">
                {Math.round(weather.current.temperature)}°C
              </div>
              <div className="text-xs text-blue-200/70 font-medium">
                {weather.current.condition}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Navigation Jump Bar */}
      <div className="mt-4 pt-1 flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs text-blue-300/40 font-medium uppercase tracking-wider shrink-0">
          Jump to:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => scrollToSection('section-summary')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 text-xs font-medium transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            AI Summary
          </button>

          <button
            onClick={() => scrollToSection('section-weather')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-200 text-xs font-medium transition-all"
          >
            <CloudSun className="w-3.5 h-3.5 text-blue-400" />
            Weather
          </button>

          <button
            onClick={() => scrollToSection('section-alerts')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              safetyLevel === 'Warning'
                ? 'bg-red-500/15 hover:bg-red-500/25 border-red-500/30 text-red-200'
                : safetyLevel === 'Caution'
                ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-200'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Alerts {alertsData?.count ? `(${alertsData.count})` : ''}
          </button>

          <button
            onClick={() => scrollToSection('section-news')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-200 text-xs font-medium transition-all"
          >
            <Newspaper className="w-3.5 h-3.5 text-sky-400" />
            News {newsCount > 0 ? `(${newsCount})` : ''}
          </button>

          <button
            onClick={() => scrollToSection('section-photos')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-200 text-xs font-medium transition-all"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-400" />
            Photos {photosCount > 0 ? `(${photosCount})` : ''}
          </button>

          <button
            onClick={() => scrollToSection('section-videos')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-200 text-xs font-medium transition-all"
          >
            <Play className="w-3.5 h-3.5 text-rose-400 fill-rose-400/50" />
            Videos {videosCount > 0 ? `(${videosCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
