import { useState } from 'react';
import { MapPin, Clock, ArrowLeft, Sparkles, CloudSun, Newspaper, Camera, Play, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
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
  heroImageUrl?: string;
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
  heroImageUrl,
  onBack,
}: Props) {
  const [activeTab, setActiveTab] = useState<'brief' | 'watch' | 'news' | 'places' | 'videos'>('brief');

  const safetyLevel =
    summaryData?.summary?.safetyAssessment?.level ||
    (alertsData && alertsData.count > 0 ? 'Caution' : 'Normal');

  const scrollToSection = (id: string, tab: 'brief' | 'watch' | 'news' | 'places' | 'videos') => {
    setActiveTab(tab);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -85;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const statusConfig = {
    Normal: {
      dot: 'bg-[#0E5B3C] ring-4 ring-[#EBF4EF]',
      pill: 'bg-[#0E5B3C]/15 border-[#0E5B3C]/30 text-white',
      badge: 'bg-[#EBF4EF] text-[#0E5B3C] border-[#CBE5D4]',
      title: 'Conditions Favorable',
      label: 'SAFE TRAVELS',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-white" />,
    },
    Caution: {
      dot: 'bg-[#B45309] ring-4 ring-[#FEF3C7]',
      pill: 'bg-[#B45309]/20 border-[#B45309]/30 text-white',
      badge: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
      title: 'Caution Advised',
      label: 'TRAVEL WATCH',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-white" />,
    },
    Warning: {
      dot: 'bg-[#B91C1C] ring-4 ring-[#FEE2E2]',
      pill: 'bg-[#B91C1C]/25 border-[#B91C1C]/40 text-white',
      badge: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]',
      title: 'Active Advisories',
      label: 'SAFETY ALERT',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-white" />,
    },
  }[safetyLevel] || {
    dot: 'bg-[#0E5B3C] ring-4 ring-[#EBF4EF]',
    pill: 'bg-[#0E5B3C]/15 border-[#0E5B3C]/30 text-white',
    badge: 'bg-[#EBF4EF] text-[#0E5B3C] border-[#CBE5D4]',
    title: 'Conditions Favorable',
    label: 'SAFE TRAVELS',
    icon: <ShieldCheck className="w-3.5 h-3.5 text-white" />,
  };

  const fallbackImage =
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1800&q=80';
  const displayImage = heroImageUrl || fallbackImage;

  return (
    <div className="space-y-6">
      {/* ── Destination Hero Card ── */}
      <div className="relative min-h-[380px] sm:min-h-[440px] overflow-hidden rounded-[28px] shadow-[0_8px_32px_-4px_rgba(42,38,32,0.12)] border border-[#EAE4D9]/60 flex flex-col justify-between p-6 sm:p-10">
        {/* Full-bleed destination image */}
        <img
          src={displayImage}
          alt={destination.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
        />

        {/* Dark gradient from bottom-left */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1815]/95 via-[#1C1815]/50 to-[#1C1815]/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C1815]/80 via-transparent to-transparent pointer-events-none" />

        {/* Top row: Back button & Floating white notice card */}
        <div className="relative z-10 flex items-start justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/20 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-white/30 active:scale-95"
            aria-label="Back to destination search"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>

          {/* Floating white notice card at top-right */}
          <div className="rounded-2xl bg-white p-3.5 sm:p-4 shadow-xl border border-[#FAF6EE] text-[#2A2620] max-w-[240px] sm:max-w-xs transition-transform hover:-translate-y-0.5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${statusConfig.dot}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8378]">
                {statusConfig.label}
              </span>
            </div>
            <h4 className="font-serif text-xs sm:text-sm font-bold text-[#2A2620] leading-snug">
              {statusConfig.title}
            </h4>
            <p className="text-[11px] text-[#8A8378] mt-1 line-clamp-2 leading-relaxed">
              {summaryData?.summary?.safetyAssessment?.note ||
                (alertsData && alertsData.count > 0
                  ? `${alertsData.count} official alert${alertsData.count > 1 ? 's' : ''} in region.`
                  : `Atmosphere and conditions are normal across ${destination.name}.`)}
            </p>
          </div>
        </div>

        {/* Bottom Hero Content */}
        <div className="relative z-10 mt-12 space-y-3">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#EAE4D9]">
            <MapPin className="w-3.5 h-3.5 text-[#CBE5D4]" />
            <span>Curated Destination Profile</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-white drop-shadow-sm">
            {destination.name}
          </h1>

          <p className="text-base sm:text-xl font-normal text-white/90">
            {[destination.region, destination.country].filter(Boolean).join(', ')}
            {destination.countryCode ? ` · ${destination.countryCode}` : ''}
          </p>

          {/* Translucent Pills for Useful Destination Information */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            {/* Coordinates */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 font-mono text-white/95 backdrop-blur-md">
              <span>📍</span>
              {typeof destination.latitude === 'number'
                ? destination.latitude.toFixed(3)
                : destination.latitude}
              °,{' '}
              {typeof destination.longitude === 'number'
                ? destination.longitude.toFixed(3)
                : destination.longitude}
              °
            </span>

            {/* Timezone */}
            {destination.timezone && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-white/95 backdrop-blur-md">
                <Clock className="w-3 h-3 text-[#CBE5D4]" />
                <span>{destination.timezone}</span>
              </span>
            )}

            {/* Weather glance pill */}
            {weather?.current && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-white/95 backdrop-blur-md">
                <span>{weather.current.emoji}</span>
                <span>{Math.round(weather.current.temperature)}°C</span>
                <span className="text-white/70">· {weather.current.condition}</span>
              </span>
            )}

            {/* Safety status pill */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium backdrop-blur-md ${statusConfig.pill}`}
            >
              {statusConfig.icon}
              <span>{safetyLevel} Conditions</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Centered White Pill-Style Tab Bar ── */}
      <nav
        aria-label="Section Navigation"
        className="sticky top-4 z-30 flex items-center justify-center p-1.5 max-w-fit mx-auto rounded-full bg-white shadow-[0_4px_24px_-4px_rgba(42,38,32,0.08)] border border-[#EAE4D9] no-scrollbar overflow-x-auto gap-1"
      >
        {/* Brief */}
        <button
          onClick={() => scrollToSection('section-summary', 'brief')}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs transition-all active:scale-95 ${
            activeTab === 'brief'
              ? 'bg-[#EBF4EF] text-[#0E5B3C] font-semibold border border-[#0E5B3C]/20 shadow-xs'
              : 'text-[#8A8378] hover:text-[#2A2620] hover:bg-[#FAF6EE]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Brief</span>
        </button>

        {/* Trip watch */}
        <button
          onClick={() => scrollToSection('section-weather', 'watch')}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs transition-all active:scale-95 ${
            activeTab === 'watch'
              ? 'bg-[#EBF4EF] text-[#0E5B3C] font-semibold border border-[#0E5B3C]/20 shadow-xs'
              : 'text-[#8A8378] hover:text-[#2A2620] hover:bg-[#FAF6EE]'
          }`}
        >
          <CloudSun className="w-3.5 h-3.5" />
          <span>Trip watch</span>
        </button>

        {/* News */}
        <button
          onClick={() => scrollToSection('section-news', 'news')}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs transition-all active:scale-95 ${
            activeTab === 'news'
              ? 'bg-[#EBF4EF] text-[#0E5B3C] font-semibold border border-[#0E5B3C]/20 shadow-xs'
              : 'text-[#8A8378] hover:text-[#2A2620] hover:bg-[#FAF6EE]'
          }`}
        >
          <Newspaper className="w-3.5 h-3.5" />
          <span>News {newsCount > 0 ? `(${newsCount})` : ''}</span>
        </button>

        {/* Places */}
        <button
          onClick={() => scrollToSection('section-photos', 'places')}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs transition-all active:scale-95 ${
            activeTab === 'places'
              ? 'bg-[#EBF4EF] text-[#0E5B3C] font-semibold border border-[#0E5B3C]/20 shadow-xs'
              : 'text-[#8A8378] hover:text-[#2A2620] hover:bg-[#FAF6EE]'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Places {photosCount > 0 ? `(${photosCount})` : ''}</span>
        </button>

        {/* Videos */}
        <button
          onClick={() => scrollToSection('section-videos', 'videos')}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs transition-all active:scale-95 ${
            activeTab === 'videos'
              ? 'bg-[#EBF4EF] text-[#0E5B3C] font-semibold border border-[#0E5B3C]/20 shadow-xs'
              : 'text-[#8A8378] hover:text-[#2A2620] hover:bg-[#FAF6EE]'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Videos {videosCount > 0 ? `(${videosCount})` : ''}</span>
        </button>
      </nav>
    </div>
  );
}
