import { Loader2, AlertCircle, Wind, Droplets, Thermometer, Sunrise, Sunset, CloudSun } from 'lucide-react';
import type { WeatherData } from '../types/weather';
import type { Destination } from '../types/destination';

interface Props {
  destination: Destination;
  weather: WeatherData | null;
  isLoading: boolean;
  error: string;
}

function formatHour(isoTime: string) {
  const d = new Date(isoTime);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(isoDate: string) {
  const d = new Date(isoDate + 'T00:00:00');
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return 'Today';
  }
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatShortTime(isoTime: string) {
  const d = new Date(isoTime);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function WeatherCard({ destination, weather, isLoading, error }: Props) {
  /* ── Loading Skeleton ── */
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 text-blue-300">
          <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
          <span className="text-sm font-medium">Fetching real-time weather for {destination.name}…</span>
        </div>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
          <div className="h-20 rounded-2xl bg-white/5" />
          <div className="h-20 rounded-2xl bg-white/5" />
          <div className="h-20 rounded-2xl bg-white/5" />
          <div className="h-20 rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/25 bg-red-500/10 p-5 sm:p-6 text-red-200 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-white">Weather Data Unavailable</h4>
            <p className="mt-1 text-xs text-red-300/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const { current, hourly, daily } = weather;
  const todayForecast = daily && daily.length > 0 ? daily[0] : null;

  return (
    <div className="space-y-4">
      {/* ── Section Title ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CloudSun className="h-4 w-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-blue-300/60">
            Weather &amp; Forecast
          </h3>
        </div>
        <span className="rounded-full border border-white/8 bg-white/5 px-2.5 py-0.5 text-[11px] text-blue-300/60">
          Open-Meteo
        </span>
      </div>

      {/* ── Current Conditions Card ── */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-7 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
              Live Atmosphere
            </span>
            <h4 className="mt-1 text-2xl font-bold tracking-tight text-white">
              {destination.name}
            </h4>
            <p className="text-xs text-blue-200/70 mt-0.5">
              {[destination.region, destination.country].filter(Boolean).join(', ')}
            </p>
          </div>

          <div className="flex items-center gap-4 sm:text-right">
            <span className="text-5xl sm:text-6xl">{current.emoji}</span>
            <div>
              <div className="text-4xl sm:text-5xl font-light tracking-tight text-white">
                {Math.round(current.temperature)}°C
              </div>
              <div className="mt-0.5 text-xs font-medium text-blue-200/80">
                {current.condition}
                {todayForecast && (
                  <span className="ml-2 text-blue-300/60">
                    (H: {Math.round(todayForecast.tempMax)}° · L: {Math.round(todayForecast.tempMin)}°)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Atmosphere Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3.5 transition-colors hover:bg-white/[0.06]">
            <div className="flex items-center gap-1.5 text-xs font-medium text-blue-300/60">
              <Thermometer className="h-3.5 w-3.5 text-blue-400" />
              <span>Feels like</span>
            </div>
            <p className="mt-1.5 text-lg font-semibold text-white">
              {Math.round(current.apparentTemperature)}°C
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3.5 transition-colors hover:bg-white/[0.06]">
            <div className="flex items-center gap-1.5 text-xs font-medium text-blue-300/60">
              <Droplets className="h-3.5 w-3.5 text-sky-400" />
              <span>Humidity</span>
            </div>
            <p className="mt-1.5 text-lg font-semibold text-white">{current.humidity}%</p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3.5 transition-colors hover:bg-white/[0.06]">
            <div className="flex items-center gap-1.5 text-xs font-medium text-blue-300/60">
              <Wind className="h-3.5 w-3.5 text-teal-400" />
              <span>Wind speed</span>
            </div>
            <p className="mt-1.5 text-lg font-semibold text-white">
              {current.windSpeed} <span className="text-xs text-blue-200/60">km/h</span>
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3.5 transition-colors hover:bg-white/[0.06]">
            <div className="flex items-center gap-1.5 text-xs font-medium text-blue-300/60">
              <Sunrise className="h-3.5 w-3.5 text-amber-400" />
              <span>Daylight</span>
            </div>
            <p className="mt-1.5 text-xs font-semibold text-white">
              {todayForecast ? `${formatShortTime(todayForecast.sunrise)} – ${formatShortTime(todayForecast.sunset)}` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Hourly Forecast (Next 8 Hours) ── */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300/60">
            Next 8 Hours Forecast
          </span>
          <span className="text-[11px] text-blue-300/40">Hourly trends</span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1.5 no-scrollbar">
          {hourly.slice(0, 8).map((h, idx) => (
            <div
              key={h.time}
              className={`flex min-w-[76px] flex-1 flex-col items-center gap-1.5 rounded-2xl border p-3 transition-colors ${
                idx === 0
                  ? 'border-blue-500/30 bg-blue-500/10'
                  : 'border-white/8 bg-white/[0.04] hover:bg-white/[0.08]'
              }`}
            >
              <p className="text-[11px] font-medium text-blue-300/70 whitespace-nowrap">
                {idx === 0 ? 'Now' : formatHour(h.time)}
              </p>
              <p className="text-2xl my-0.5">{h.emoji}</p>
              <p className="text-sm font-bold text-white">{Math.round(h.temperature)}°</p>
              {h.precipitationProbability > 0 ? (
                <p className="text-[10px] font-semibold text-sky-400">
                  💧{h.precipitationProbability}%
                </p>
              ) : (
                <span className="text-[10px] text-blue-300/30">0%</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 5-Day Daily Outlook ── */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300/60">
            5-Day Extended Outlook
          </span>
          <span className="text-[11px] text-blue-300/40">Daily highs &amp; lows</span>
        </div>
        <div className="space-y-2.5">
          {daily.map((day) => (
            <div
              key={day.date}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.06]"
            >
              {/* Day & Condition */}
              <div className="flex items-center gap-3 sm:w-36 shrink-0">
                <span className="text-2xl leading-none">{day.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{formatDate(day.date)}</p>
                  <p className="text-xs text-blue-300/60 truncate">{day.condition}</p>
                </div>
              </div>

              {/* Rain Chance & Visual Temperature Range */}
              <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                {day.precipitationProbabilityMax > 0 && (
                  <span className="font-semibold text-sky-400">
                    💧{day.precipitationProbabilityMax}%
                  </span>
                )}

                <div className="flex items-center gap-2.5">
                  <span className="w-8 text-right font-medium text-blue-300/60">
                    {Math.round(day.tempMin)}°
                  </span>
                  <div className="h-1.5 w-20 sm:w-28 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-amber-400"
                      style={{
                        marginLeft: `${Math.max(0, Math.min(60, (day.tempMin / 40) * 100))}%`,
                        width: `${Math.max(20, Math.min(80, ((day.tempMax - day.tempMin) / 25) * 100))}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 font-bold text-white">
                    {Math.round(day.tempMax)}°
                  </span>
                </div>

                <div className="hidden md:flex items-center gap-3 text-[11px] text-blue-300/50 pl-2 border-l border-white/10">
                  <span className="flex items-center gap-1">
                    <Sunrise className="h-3 w-3 text-amber-400" />
                    {formatShortTime(day.sunrise)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Sunset className="h-3 w-3 text-orange-400" />
                    {formatShortTime(day.sunset)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
