import { Loader2, AlertCircle, Wind, Droplets, Sunrise, CloudSun } from 'lucide-react';
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
      <div className="rounded-[20px] bg-white p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(42,38,32,0.05)] border border-[#EAE4D9]/80">
        <div className="flex items-center gap-3 text-[#8A8378]">
          <Loader2 className="h-5 w-5 animate-spin text-[#0E5B3C]" />
          <span className="text-sm font-medium">Gathering meteorological readings for {destination.name}…</span>
        </div>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
          <div className="h-24 rounded-xl bg-[#FAF6EE]" />
          <div className="h-24 rounded-xl bg-[#FAF6EE]" />
          <div className="h-24 rounded-xl bg-[#FAF6EE]" />
          <div className="h-24 rounded-xl bg-[#FAF6EE]" />
        </div>
      </div>
    );
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="rounded-[20px] bg-white p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(42,38,32,0.05)] border border-[#FEE2E2]">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-[#B91C1C] mt-0.5" />
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B91C1C]">
              Weather Report
            </span>
            <h4 className="font-serif text-base font-bold text-[#2A2620] mt-0.5">
              Meteorological Data Unavailable
            </h4>
            <p className="mt-1 text-xs text-[#8A8378] leading-relaxed">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const { current, hourly, daily } = weather;
  const todayForecast = daily && daily.length > 0 ? daily[0] : null;

  return (
    <div className="rounded-[20px] bg-white p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(42,38,32,0.05)] border border-[#EAE4D9]/80 space-y-6">
      {/* ── Section Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE4D9]/60 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8378]">
            CLIMATE &amp; METEOROLOGY · 5-DAY OUTLOOK
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2A2620] mt-1">
            Atmospheric Conditions
          </h2>
          <p className="text-xs text-[#8A8378] mt-0.5">
            Observations and forecast for {destination.name}
          </p>
        </div>
        <span className="rounded-full border border-[#EAE4D9] bg-[#FAF6EE] px-3 py-1 text-xs font-medium text-[#8A8378]">
          Open-Meteo High-Resolution
        </span>
      </div>

      {/* ── Current Conditions Hero ── */}
      <div className="rounded-2xl border border-[#EAE4D9]/70 bg-[#FAF6EE]/50 p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E5B3C]">
              Current Reading
            </span>
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-5xl sm:text-6xl font-bold tracking-tight text-[#2A2620]">
                {Math.round(current.temperature)}°C
              </span>
              <span className="text-4xl">{current.emoji}</span>
            </div>
            <p className="text-sm font-medium text-[#2A2620]">
              {current.condition}
            </p>
            <p className="text-xs text-[#8A8378]">
              Feels like {Math.round(current.apparentTemperature)}°C
              {todayForecast && ` · High ${Math.round(todayForecast.tempMax)}° / Low ${Math.round(todayForecast.tempMin)}°`}
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 min-w-[240px]">
            <div className="rounded-xl border border-[#EAE4D9]/60 bg-white p-3 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs text-[#8A8378]">
                <Droplets className="h-3.5 w-3.5 text-[#0E5B3C]" />
                <span>Humidity</span>
              </div>
              <p className="font-serif text-lg font-bold text-[#2A2620] mt-1">
                {current.humidity}%
              </p>
            </div>

            <div className="rounded-xl border border-[#EAE4D9]/60 bg-white p-3 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs text-[#8A8378]">
                <Wind className="h-3.5 w-3.5 text-[#0E5B3C]" />
                <span>Wind Speed</span>
              </div>
              <p className="font-serif text-lg font-bold text-[#2A2620] mt-1">
                {current.windSpeed} km/h
              </p>
            </div>

            {todayForecast?.precipitationProbabilityMax !== undefined && (
              <div className="rounded-xl border border-[#EAE4D9]/60 bg-white p-3 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs text-[#8A8378]">
                  <CloudSun className="h-3.5 w-3.5 text-[#B45309]" />
                  <span>Rain Chance</span>
                </div>
                <p className="font-serif text-lg font-bold text-[#2A2620] mt-1">
                  {todayForecast.precipitationProbabilityMax}%
                </p>
              </div>
            )}

            {todayForecast?.sunrise && todayForecast?.sunset && (
              <div className="rounded-xl border border-[#EAE4D9]/60 bg-white p-3 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs text-[#8A8378]">
                  <Sunrise className="h-3.5 w-3.5 text-[#B45309]" />
                  <span>Daylight</span>
                </div>
                <p className="text-[11px] font-medium text-[#2A2620] mt-1">
                  {formatShortTime(todayForecast.sunrise)} – {formatShortTime(todayForecast.sunset)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 24-Hour Hourly Forecast ── */}
      {hourly && hourly.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A8378]">
              Hourly Trajectory (Next 24 Hours)
            </h3>
            <span className="text-[11px] text-[#8A8378]">Local Standard Time</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
            {hourly.slice(0, 24).map((hour, idx) => (
              <div
                key={idx}
                className="flex min-w-[76px] flex-col items-center justify-between rounded-xl border border-[#EAE4D9]/70 bg-[#FAF6EE]/60 py-3 px-2 text-center transition-all hover:border-[#0E5B3C]/40 hover:bg-white hover:shadow-xs"
              >
                <span className="text-[11px] text-[#8A8378] font-medium">
                  {formatHour(hour.time)}
                </span>
                <span className="my-2 text-2xl" title={hour.condition}>
                  {hour.emoji}
                </span>
                <span className="font-serif text-sm font-bold text-[#2A2620]">
                  {Math.round(hour.temperature)}°
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 5-Day Extended Forecast ── */}
      {daily && daily.length > 0 && (
        <div className="space-y-3 border-t border-[#EAE4D9]/60 pt-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A8378]">
              5-Day Outlook
            </h3>
            <span className="text-[11px] text-[#8A8378]">Expected Range</span>
          </div>

          <div className="divide-y divide-[#EAE4D9]/60 rounded-xl border border-[#EAE4D9]/70 bg-white overflow-hidden">
            {daily.slice(0, 5).map((day, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-4 sm:px-6 py-3.5 transition-colors hover:bg-[#FAF6EE]/50"
              >
                <div className="flex items-center gap-3 w-32 sm:w-40">
                  <span className="text-2xl">{day.emoji}</span>
                  <div>
                    <span className="text-xs font-semibold text-[#2A2620] block">
                      {formatDate(day.date)}
                    </span>
                    <span className="text-[11px] text-[#8A8378] line-clamp-1">
                      {day.condition}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-6 text-right">
                  <span className="text-xs text-[#8A8378] font-medium">
                    Low {Math.round(day.tempMin)}°
                  </span>
                  <div className="w-16 sm:w-28 bg-[#FAF6EE] h-1.5 rounded-full overflow-hidden hidden sm:block">
                    <div className="bg-[#0E5B3C] h-full w-2/3 rounded-full mx-auto" />
                  </div>
                  <span className="font-serif text-sm font-bold text-[#2A2620] min-w-[50px]">
                    High {Math.round(day.tempMax)}°
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
