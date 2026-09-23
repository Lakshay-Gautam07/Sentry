import { useState } from 'react';
import { Search, MapPin, Globe, Loader2, AlertCircle, ChevronRight, X } from 'lucide-react';
import api from '../lib/api';
import type { Destination, DestinationSearchResponse } from '../types/destination';
import type { WeatherResponse, WeatherData } from '../types/weather';
import type { AlertsResponse } from '../types/alerts';
import type { NewsResponse } from '../types/news';
import type { ImagesResponse } from '../types/images';
import type { VideosResponse } from '../types/videos';
import WeatherCard from '../components/WeatherCard';
import AlertsCard from '../components/AlertsCard';
import NewsCard from '../components/NewsCard';
import ImageGallery from '../components/ImageGallery';
import VideoSection from '../components/VideoSection';

type SearchState = 'idle' | 'loading' | 'success' | 'error' | 'empty';
type WeatherState = 'idle' | 'loading' | 'success' | 'error';
type AlertsState = 'idle' | 'loading' | 'success' | 'error';
type NewsState = 'idle' | 'loading' | 'success' | 'error';
type ImagesState = 'idle' | 'loading' | 'success' | 'error';
type VideosState = 'idle' | 'loading' | 'success' | 'error';

export default function Home() {
  // ── Search state ──
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Destination[]>([]);
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [searchError, setSearchError] = useState('');
  const [lastQuery, setLastQuery] = useState('');

  // ── Selected destination + weather state ──
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherState, setWeatherState] = useState<WeatherState>('idle');
  const [weatherError, setWeatherError] = useState('');

  // ── Alerts state ──
  const [alertsData, setAlertsData] = useState<AlertsResponse | null>(null);
  const [alertsState, setAlertsState] = useState<AlertsState>('idle');
  const [alertsError, setAlertsError] = useState('');

  // ── News state ──
  const [newsData, setNewsData] = useState<NewsResponse | null>(null);
  const [newsState, setNewsState] = useState<NewsState>('idle');
  const [newsError, setNewsError] = useState('');

  // ── Images state ──
  const [imagesData, setImagesData] = useState<ImagesResponse | null>(null);
  const [imagesState, setImagesState] = useState<ImagesState>('idle');
  const [imagesError, setImagesError] = useState('');

  // ── Videos state ──
  const [videosData, setVideosData] = useState<VideosResponse | null>(null);
  const [videosState, setVideosState] = useState<VideosState>('idle');
  const [videosError, setVideosError] = useState('');

  /* ────────────────────────── Search ────────────────────────── */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearchState('loading');
    setResults([]);
    setSearchError('');
    setLastQuery(trimmed);
    // Clear any previous selection when doing a new search
    setSelectedDest(null);
    setWeather(null);
    setWeatherState('idle');
    setAlertsData(null);
    setAlertsState('idle');
    setAlertsError('');
    setNewsData(null);
    setNewsState('idle');
    setNewsError('');
    setImagesData(null);
    setImagesState('idle');
    setImagesError('');
    setVideosData(null);
    setVideosState('idle');
    setVideosError('');

    try {
      const { data } = await api.get<DestinationSearchResponse>('/api/destinations/search', {
        params: { q: trimmed },
      });

      if (!data.success) {
        setSearchState('error');
        setSearchError(data.message ?? 'Something went wrong.');
        return;
      }

      if (data.count === 0) {
        setSearchState('empty');
        return;
      }

      setResults(data.results);
      setSearchState('success');
    } catch (err: unknown) {
      setSearchState('error');
      const axiosError = err as { response?: { data?: { message?: string } } };
      setSearchError(
        axiosError?.response?.data?.message ??
          'Could not reach the server. Please try again.'
      );
    }
  };

  /* ────────────────────────── Select destination → fetch weather + alerts + news ────────────────────────── */
  const handleSelectDestination = async (dest: Destination) => {
    setSelectedDest(dest);
    setWeather(null);
    setWeatherError('');
    setWeatherState('loading');
    setAlertsData(null);
    setAlertsError('');
    setAlertsState('loading');
    setNewsData(null);
    setNewsError('');
    setNewsState('loading');
    setImagesData(null);
    setImagesError('');
    setImagesState('loading');
    setVideosData(null);
    setVideosError('');
    setVideosState('loading');

    // Fetch weather, alerts, news, images, and videos concurrently
    const [weatherResult, alertsResult, newsResult, imagesResult, videosResult] = await Promise.allSettled([
      api.get<WeatherResponse>('/api/weather', {
        params: { lat: dest.latitude, lon: dest.longitude },
      }),
      api.get<AlertsResponse>('/api/alerts', {
        params: {
          lat: dest.latitude,
          lon: dest.longitude,
          country: dest.country ?? '',
          countryCode: dest.countryCode ?? '',
          region: dest.region ?? '',
          name: dest.name ?? '',
        },
      }),
      api.get<NewsResponse>('/api/news', {
        params: {
          destination: dest.name ?? '',
          country: dest.country ?? '',
        },
      }),
      api.get<ImagesResponse>('/api/images', {
        params: {
          destination: dest.name ?? '',
          country: dest.country ?? '',
        },
      }),
      api.get<VideosResponse>('/api/videos', {
        params: {
          destination: dest.name ?? '',
          country: dest.country ?? '',
        },
      }),
    ]);

    // Handle weather result
    if (weatherResult.status === 'fulfilled') {
      const { data } = weatherResult.value;
      if (!data.success) {
        setWeatherState('error');
        setWeatherError(data.message ?? 'Could not load weather data.');
      } else {
        setWeather(data.weather);
        setWeatherState('success');
      }
    } else {
      setWeatherState('error');
      const axiosError = weatherResult.reason as { response?: { data?: { message?: string } } };
      setWeatherError(
        axiosError?.response?.data?.message ?? 'Could not fetch weather. Please try again.'
      );
    }

    // Handle alerts result
    if (alertsResult.status === 'fulfilled') {
      const { data } = alertsResult.value;
      setAlertsData(data);
      setAlertsState('success');
    } else {
      setAlertsState('error');
      const axiosError = alertsResult.reason as { response?: { data?: { message?: string } } };
      setAlertsError(
        axiosError?.response?.data?.message ?? 'Could not fetch alerts. Please try again.'
      );
    }

    // Handle news result
    if (newsResult.status === 'fulfilled') {
      const { data } = newsResult.value;
      if (data.error && data.count === 0 && !data.rateLimited) {
        setNewsState('error');
        setNewsError(data.message ?? 'Could not load news data.');
      } else {
        setNewsData(data);
        setNewsState('success');
      }
    } else {
      setNewsState('error');
      const axiosError = newsResult.reason as { response?: { data?: { message?: string } } };
      setNewsError(
        axiosError?.response?.data?.message ?? 'Could not fetch news. Please try again.'
      );
    }

    // Handle images result
    if (imagesResult.status === 'fulfilled') {
      const { data } = imagesResult.value;
      if (!data.success) {
        setImagesState('error');
        setImagesError(data.message ?? 'Could not load destination photos.');
      } else {
        setImagesData(data);
        setImagesState('success');
      }
    } else {
      setImagesState('error');
      const axiosError = imagesResult.reason as { response?: { data?: { message?: string } } };
      setImagesError(
        axiosError?.response?.data?.message ?? 'Could not fetch photos. Please try again.'
      );
    }

    // Handle videos result
    if (videosResult.status === 'fulfilled') {
      const { data } = videosResult.value;
      if (!data.success) {
        setVideosState('error');
        setVideosError(data.message ?? 'Could not load travel videos.');
      } else {
        setVideosData(data);
        setVideosState('success');
      }
    } else {
      setVideosState('error');
      const axiosError = videosResult.reason as { response?: { data?: { message?: string } } };
      setVideosError(
        axiosError?.response?.data?.message ?? 'Could not fetch travel videos. Please try again.'
      );
    }
  };

  /* ────────────────────────── Clear selection ────────────────────────── */
  const handleClearSelection = () => {
    setSelectedDest(null);
    setWeather(null);
    setWeatherState('idle');
    setWeatherError('');
    setAlertsData(null);
    setAlertsState('idle');
    setAlertsError('');
    setNewsData(null);
    setNewsState('idle');
    setNewsError('');
    setImagesData(null);
    setImagesState('idle');
    setImagesError('');
    setVideosData(null);
    setVideosState('idle');
    setVideosError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center px-4 py-16">
      {/* ── Header ── */}
      <header className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Globe className="w-10 h-10 text-blue-400" strokeWidth={1.5} />
          <h1 className="text-5xl font-bold tracking-tight text-white">Sentry</h1>
        </div>
        <p className="text-lg text-blue-200 max-w-md mx-auto leading-relaxed">
          Your intelligent travel companion — search any destination worldwide
          and get weather, alerts, news, images, and AI insights.
        </p>
      </header>

      {/* ── Search Box ── */}
      <form
        onSubmit={handleSearch}
        className="w-full max-w-xl"
        aria-label="Destination search"
      >
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-lg focus-within:ring-2 focus-within:ring-blue-400 transition">
          <MapPin className="w-5 h-5 text-blue-300 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a destination — Tokyo, Bali, Paris…"
            className="flex-1 bg-transparent text-white placeholder-blue-300/70 outline-none text-base"
            aria-label="Destination"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!query.trim() || searchState === 'loading'}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-xl transition-colors"
            aria-label="Search"
          >
            {searchState === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{searchState === 'loading' ? 'Searching…' : 'Search'}</span>
          </button>
        </div>
      </form>

      {/* ── Content area ── */}
      <div className="w-full max-w-xl mt-6">

        {/* Search: Loading */}
        {searchState === 'loading' && (
          <div className="flex items-center justify-center gap-3 text-blue-300 py-10">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Finding destinations…</span>
          </div>
        )}

        {/* Search: Error */}
        {searchState === 'error' && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4 text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Something went wrong</p>
              <p className="text-sm mt-0.5 text-red-300/80">{searchError}</p>
            </div>
          </div>
        )}

        {/* Search: Empty */}
        {searchState === 'empty' && (
          <div className="text-center text-blue-300/70 py-10">
            <MapPin className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No results for &quot;{lastQuery}&quot;</p>
            <p className="text-sm mt-1">Try a different spelling or a nearby city.</p>
          </div>
        )}

        {/* Search: Results list — shown when no destination is selected */}
        {searchState === 'success' && results.length > 0 && !selectedDest && (
          <div className="space-y-3">
            <p className="text-xs text-blue-300/50 mb-2 pl-1">
              {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{lastQuery}&quot; — tap to view weather
            </p>
            {results.map((dest) => (
              <button
                key={dest.id}
                onClick={() => handleSelectDestination(dest)}
                className="w-full flex items-center justify-between bg-white/8 backdrop-blur-sm border border-white/12 rounded-2xl px-5 py-4 hover:bg-white/14 transition-colors cursor-pointer group text-left"
                aria-label={`Select ${dest.name}, ${dest.country}`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold leading-tight">{dest.name}</p>
                    <p className="text-sm text-blue-300/80 mt-0.5">
                      {[dest.region, dest.country].filter(Boolean).join(', ')}
                    </p>
                    <p className="text-xs text-blue-300/40 mt-1">
                      {dest.latitude.toFixed(4)}°, {dest.longitude.toFixed(4)}°
                      {dest.timezone ? ` · ${dest.timezone}` : ''}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-400/40 group-hover:text-blue-400 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* ── Selected Destination + Weather ── */}
        {selectedDest && (
          <>
            {/* Back / clear button */}
            <button
              onClick={handleClearSelection}
              className="flex items-center gap-2 text-sm text-blue-300/60 hover:text-blue-300 transition-colors mb-4"
              aria-label="Back to search results"
            >
              <X className="w-4 h-4" />
              Back to results
            </button>

            {/* WeatherCard handles loading / error / data states */}
            <WeatherCard
              destination={selectedDest}
              weather={weather}
              isLoading={weatherState === 'loading'}
              error={weatherError}
            />

            {/* AlertsCard — shown once weather fetch is no longer loading */}
            {weatherState !== 'loading' && (
              <AlertsCard
                alertsData={alertsData}
                isLoading={alertsState === 'loading'}
                error={alertsError}
              />
            )}

            {/* NewsCard — shown once weather fetch is no longer loading */}
            {weatherState !== 'loading' && (
              <NewsCard
                newsData={newsData}
                isLoading={newsState === 'loading'}
                error={newsError}
              />
            )}

            {/* ImageGallery — shown once weather fetch is no longer loading */}
            {weatherState !== 'loading' && (
              <ImageGallery
                imagesData={imagesData}
                isLoading={imagesState === 'loading'}
                error={imagesError}
              />
            )}

            {/* VideoSection — shown once weather fetch is no longer loading */}
            {weatherState !== 'loading' && (
              <VideoSection
                videosData={videosData}
                isLoading={videosState === 'loading'}
                error={videosError}
              />
            )}
          </>
        )}

        {/* Idle hint */}
        {searchState === 'idle' && (
          <p className="text-center text-sm text-blue-300/40 mt-4">
            Weather, alerts, news &amp; AI insights — select a destination to begin
          </p>
        )}
      </div>
    </div>
  );
}
