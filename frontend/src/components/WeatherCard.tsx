import { Loader2, AlertCircle, Wind, Droplets, Thermometer, Sunrise, Sunset } from 'lucide-react';
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
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatShortTime(isoTime: string) {
  const d = new Date(isoTime);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function WeatherCard({ destination, weather, isLoading, error }: Props) {
  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="mt-6 bg-white/8 border border-white/12 rounded-3xl px-6 py-8 flex items-center justify-center gap-3 text-blue-300">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Fetching weather for {destination.name}…</span>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="mt-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-3xl px-5 py-4 text-red-300">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Weather unavailable</p>
          <p className="text-sm mt-0.5 text-red-300/80">{error}</p>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const { current, hourly, daily } = weather;

  return (
    <div className="mt-6 space-y-4">
      {/* ── Current Conditions ── */}
      <div className="bg-white/8 backdrop-blur-sm border border-white/12 rounded-3xl px-6 py-6">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-blue-300/50 uppercase tracking-widest mb-1">
              Current Weather
            </p>
            <h2 className="text-white font-bold text-xl leading-tight">
              {destination.name}
            </h2>
            <p className="text-sm text-blue-300/70 mt-0.5">
              {[destination.region, destination.country].filter(Boolean).join(', ')}
            </p>
            <p className="text-xs text-blue-300/40 mt-0.5">{weather.timezone}</p>
          </div>
          <div className="text-right">
            <p className="text-6xl font-extralight text-white leading-none">
              {Math.round(current.temperature)}°
            </p>
            <p className="text-sm text-blue-200 mt-1">
              {current.emoji} {current.condition}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-white/6 rounded-2xl px-4 py-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-blue-300/60">
              <Thermometer className="w-3.5 h-3.5" />
              <span className="text-xs">Feels like</span>
            </div>
            <p className="text-white font-semibold">{Math.round(current.apparentTemperature)}°C</p>
          </div>
          <div className="bg-white/6 rounded-2xl px-4 py-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-blue-300/60">
              <Droplets className="w-3.5 h-3.5" />
              <span className="text-xs">Humidity</span>
            </div>
            <p className="text-white font-semibold">{current.humidity}%</p>
          </div>
          <div className="bg-white/6 rounded-2xl px-4 py-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-blue-300/60">
              <Wind className="w-3.5 h-3.5" />
              <span className="text-xs">Wind</span>
            </div>
            <p className="text-white font-semibold">
              {current.windSpeed} km/h {current.windDirection}
            </p>
          </div>
        </div>
      </div>

      {/* ── Hourly Forecast (next 8 hours) ── */}
      <div className="bg-white/8 backdrop-blur-sm border border-white/12 rounded-3xl px-6 py-5">
        <p className="text-xs text-blue-300/50 uppercase tracking-widest mb-4">
          Next 8 Hours
        </p>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {hourly.slice(0, 8).map((h) => (
            <div
              key={h.time}
              className="flex flex-col items-center gap-1.5 bg-white/6 rounded-2xl px-3 py-3 min-w-[64px]"
            >
              <p className="text-xs text-blue-300/60 whitespace-nowrap">{formatHour(h.time)}</p>
              <p className="text-lg">{h.emoji}</p>
              <p className="text-white text-sm font-semibold">{Math.round(h.temperature)}°</p>
              {h.precipitationProbability > 0 && (
                <p className="text-xs text-blue-300/60">💧{h.precipitationProbability}%</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 5-Day Daily Forecast ── */}
      <div className="bg-white/8 backdrop-blur-sm border border-white/12 rounded-3xl px-6 py-5">
        <p className="text-xs text-blue-300/50 uppercase tracking-widest mb-4">
          5-Day Forecast
        </p>
        <div className="space-y-2">
          {daily.map((day) => (
            <div
              key={day.date}
              className="flex items-center justify-between bg-white/6 rounded-2xl px-4 py-3"
            >
              <div className="flex items-center gap-3 w-28 shrink-0">
                <p className="text-lg">{day.emoji}</p>
                <div>
                  <p className="text-white text-sm font-semibold">{formatDate(day.date)}</p>
                  <p className="text-xs text-blue-300/50">{day.condition}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {day.precipitationProbabilityMax > 0 && (
                  <p className="text-blue-300/60 text-xs">
                    💧{day.precipitationProbabilityMax}%
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <p className="text-blue-300/60">{Math.round(day.tempMin)}°</p>
                  <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{
                        marginLeft: `${((day.tempMin - (day.tempMin - 5)) / 30) * 100}%`,
                        width: `${((day.tempMax - day.tempMin) / 30) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-white font-semibold">{Math.round(day.tempMax)}°</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-blue-300/50">
                <span className="flex items-center gap-1">
                  <Sunrise className="w-3 h-3" />
                  {formatShortTime(day.sunrise)}
                </span>
                <span className="flex items-center gap-1">
                  <Sunset className="w-3 h-3" />
                  {formatShortTime(day.sunset)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
