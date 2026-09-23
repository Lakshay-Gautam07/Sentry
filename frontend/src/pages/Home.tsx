import { useState, useEffect } from 'react';
import { Search, MapPin, Globe, Loader2, AlertCircle, ChevronRight, X, ArrowUp, Compass } from 'lucide-react';
import api from '../lib/api';
import type { Destination, DestinationSearchResponse } from '../types/destination';
import type { WeatherResponse, WeatherData } from '../types/weather';
import type { AlertsResponse } from '../types/alerts';
import type { NewsResponse } from '../types/news';
import type { ImagesResponse } from '../types/images';
import type { VideosResponse } from '../types/videos';
import type { SummaryResponse } from '../types/summary';
import WeatherCard from '../components/WeatherCard';
import AlertsCard from '../components/AlertsCard';
import NewsCard from '../components/NewsCard';
import ImageGallery from '../components/ImageGallery';
import VideoSection from '../components/VideoSection';
import SummaryCard from '../components/SummaryCard';
import DestinationOverview from '../components/DestinationOverview';

type SearchState = 'idle' | 'loading' | 'success' | 'error' | 'empty';
type WeatherState = 'idle' | 'loading' | 'success' | 'error';
type AlertsState = 'idle' | 'loading' | 'success' | 'error';
type NewsState = 'idle' | 'loading' | 'success' | 'error';
type ImagesState = 'idle' | 'loading' | 'success' | 'error';
type VideosState = 'idle' | 'loading' | 'success' | 'error';
type SummaryState = 'idle' | 'loading' | 'success' | 'error';

const POPULAR_DESTINATIONS = [
  { name: 'Tokyo', country: 'Japan', label: 'Tokyo, Japan' },
  { name: 'Paris', country: 'France', label: 'Paris, France' },
  { name: 'Manali', country: 'India', label: 'Manali, India' },
  { name: 'Dubai', country: 'UAE', label: 'Dubai, UAE' },
  { name: 'Delhi', country: 'India', label: 'Delhi, India' },
];

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

  // ── AI Summary state ──
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);
  const [summaryState, setSummaryState] = useState<SummaryState>('idle');
  const [summaryError, setSummaryError] = useState('');

  // ── Scroll to top state ──
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ────────────────────────── Execute Search ────────────────────────── */
  const executeSearch = async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    setQuery(trimmed);
    setSearchState('loading');
    setResults([]);
    setSearchError('');
    setLastQuery(trimmed);

    // Reset details view
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
    setSummaryData(null);
    setSummaryState('idle');
    setSummaryError('');

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleClearQuery = () => {
    setQuery('');
  };

  /* ────────────────────────── Select destination → fetch all data ────────────────────────── */
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

    // Scroll smoothly to top of destination view
    window.scrollTo({ top: 0, behavior: 'smooth' });

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

    // Fetch AI Summary with gathered context
    fetchSummary(
      dest,
      weatherResult.status === 'fulfilled' && weatherResult.value.data.success ? weatherResult.value.data.weather : null,
      alertsResult.status === 'fulfilled' ? alertsResult.value.data : null,
      newsResult.status === 'fulfilled' ? newsResult.value.data : null
    );
  };

  /* ────────────────────────── Fetch AI Summary ────────────────────────── */
  const fetchSummary = async (
    dest: Destination,
    weatherContext?: WeatherData | null,
    alertsContext?: AlertsResponse | null,
    newsContext?: NewsResponse | null,
    forceRefresh = false
  ) => {
    setSummaryState('loading');
    setSummaryError('');
    try {
      const { data } = await api.post<SummaryResponse>('/api/summary', {
        destination: dest.name,
        country: dest.country || '',
        weather: weatherContext ? { current: weatherContext.current, daily: weatherContext.daily } : undefined,
        alerts: alertsContext ? alertsContext.alerts : undefined,
        news: newsContext ? newsContext.articles : undefined,
        forceRefresh,
      });

      if (data.success) {
        setSummaryData(data);
        setSummaryState('success');
      } else {
        setSummaryState('error');
        setSummaryError(data.message || 'Failed to generate AI travel summary.');
      }
    } catch (err: unknown) {
      setSummaryState('error');
      const axiosError = err as { response?: { data?: { message?: string } } };
      setSummaryError(axiosError?.response?.data?.message || 'Could not reach summary service.');
    }
  };

  const handleRefreshSummary = () => {
    if (!selectedDest) return;
    fetchSummary(selectedDest, weather, alertsData, newsData, true);
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
    setSummaryData(null);
    setSummaryState('idle');
    setSummaryError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12 text-slate-100">
      {/* ── Brand Header ── */}
      <header
        className={`w-full max-w-xl text-center transition-all duration-300 ${
          selectedDest ? 'mb-6 sm:mb-8' : 'mb-8 sm:mb-12'
        }`}
      >
        <div className="flex items-center justify-center gap-3 mb-2 sm:mb-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/15 text-blue-400 shadow-lg shadow-blue-500/10">
            <Globe className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.75} />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Sentry
          </h1>
        </div>

        {!selectedDest && (
          <p className="text-sm sm:text-base text-blue-200/80 max-w-md mx-auto leading-relaxed font-normal">
            Intelligent destination intelligence — search any place worldwide for real-time weather, safety alerts, news, images, and AI summaries.
          </p>
        )}
      </header>

      {/* ── Search Input Box ── */}
      <form
        onSubmit={handleSearch}
        className="w-full max-w-xl"
        aria-label="Destination search"
      >
        <div className="group relative flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-xl transition-all focus-within:border-blue-400 focus-within:bg-white/[0.12] focus-within:ring-2 focus-within:ring-blue-400/20">
          <MapPin className="h-5 w-5 text-blue-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a destination — Tokyo, Paris, Manali…"
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-blue-300/50 outline-none"
            aria-label="Search destination"
            autoComplete="off"
          />

          {/* Quick Clear Query Button */}
          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={handleClearQuery}
              className="p-1 rounded-full text-blue-300/50 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Clear input text"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={!query.trim() || searchState === 'loading'}
            className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Execute search"
          >
            {searchState === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span>{searchState === 'loading' ? 'Searching…' : 'Search'}</span>
          </button>
        </div>

        {/* Quick Popular Destination Chips (when search is idle or results cleared) */}
        {!selectedDest && searchState === 'idle' && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-blue-300/40 uppercase tracking-wider font-semibold text-[10px] mr-1">
              <Compass className="h-3.5 w-3.5 text-blue-400/60" /> Popular:
            </span>
            {POPULAR_DESTINATIONS.map((pop) => (
              <button
                key={pop.name}
                type="button"
                onClick={() => executeSearch(pop.name)}
                className="rounded-xl border border-white/8 bg-white/5 px-2.5 py-1 text-xs text-blue-200/80 transition-all hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white active:scale-95"
              >
                {pop.label}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* ── Content View Area ── */}
      <main className={`w-full ${selectedDest ? 'max-w-5xl' : 'max-w-xl'} mt-6 transition-all duration-300`}>

        {/* Search State: Loading */}
        {searchState === 'loading' && (
          <div className="flex flex-col items-center justify-center gap-3 text-blue-300 py-12">
            <Loader2 className="h-7 w-7 animate-spin text-blue-400" />
            <span className="text-sm font-medium">Querying worldwide geocoding registry…</span>
          </div>
        )}

        {/* Search State: Error */}
        {searchState === 'error' && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-200 backdrop-blur-md">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-white">Search Error</p>
              <p className="mt-0.5 text-xs text-red-300/80 leading-relaxed">{searchError}</p>
            </div>
          </div>
        )}

        {/* Search State: Empty */}
        {searchState === 'empty' && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 text-center text-blue-300/70 backdrop-blur-md">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-40 text-blue-400" />
            <p className="font-bold text-white text-base">No locations found for &quot;{lastQuery}&quot;</p>
            <p className="mt-1 text-xs text-blue-300/60 max-w-sm mx-auto">
              Please verify the spelling, try a nearby major city, or select one of the popular travel destinations.
            </p>
          </div>
        )}

        {/* Search: Results list — shown when no destination is selected */}
        {searchState === 'success' && results.length > 0 && !selectedDest && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-300/50 mb-2 pl-1">
              {results.length} result{results.length !== 1 ? 's' : ''} found for &quot;{lastQuery}&quot; — select a destination to view full profile:
            </p>
            {results.map((dest) => (
              <button
                key={dest.id}
                onClick={() => handleSelectDestination(dest)}
                className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-5 py-4 text-left shadow-lg backdrop-blur-md transition-all duration-200 hover:border-blue-400/40 hover:bg-slate-900/90 hover:shadow-xl active:scale-[0.99] group"
                aria-label={`Select ${dest.name}, ${dest.country}`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white group-hover:text-blue-200 transition-colors">
                      {dest.name}
                    </h2>
                    <p className="text-xs text-blue-200/80 mt-0.5">
                      {[dest.region, dest.country].filter(Boolean).join(', ')}
                    </p>
                    <p className="text-[11px] text-blue-300/40 mt-1 font-mono">
                      {dest.latitude.toFixed(4)}°, {dest.longitude.toFixed(4)}°
                      {dest.timezone ? ` · ${dest.timezone}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-blue-300/50 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors shrink-0">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Complete Destination Intelligence Profile (Phases 1-9) ── */}
        {selectedDest && (
          <div className="space-y-6 sm:space-y-8">
            {/* 1. Destination Overview (Hero Profile, Coordinates, Live Weather Glance, Sticky Nav) */}
            <DestinationOverview
              destination={selectedDest}
              weather={weather}
              alertsData={alertsData}
              summaryData={summaryData}
              photosCount={imagesData?.count || 0}
              videosCount={videosData?.count || 0}
              newsCount={newsData?.count || 0}
              onBack={handleClearSelection}
            />

            {/* 2. Gemini AI Travel Summary (with MongoDB Atlas caching) */}
            <section id="section-summary" className="scroll-mt-24">
              <SummaryCard
                summaryData={summaryData}
                isLoading={summaryState === 'loading'}
                error={summaryError}
                onRefresh={handleRefreshSummary}
              />
            </section>

            {/* 3. WeatherCard (Current conditions, 24-hr hourly & 5-day forecast) */}
            <section id="section-weather" className="scroll-mt-24">
              <WeatherCard
                destination={selectedDest}
                weather={weather}
                isLoading={weatherState === 'loading'}
                error={weatherError}
              />
            </section>

            {/* 4. AlertsCard (GDACS Global Disasters & SACHET Official Indian Alerts) */}
            <section id="section-alerts" className="scroll-mt-24">
              <AlertsCard
                alertsData={alertsData}
                isLoading={alertsState === 'loading'}
                error={alertsError}
              />
            </section>

            {/* 5. NewsCard (GDELT DOC 2.0 Recent Articles) */}
            <section id="section-news" className="scroll-mt-24">
              <NewsCard
                newsData={newsData}
                isLoading={newsState === 'loading'}
                error={newsError}
              />
            </section>

            {/* 6. ImageGallery (Wikimedia Commons Photographs & Lightbox) */}
            <section id="section-photos" className="scroll-mt-24">
              <ImageGallery
                imagesData={imagesData}
                isLoading={imagesState === 'loading'}
                error={imagesError}
              />
            </section>

            {/* 7. VideoSection (YouTube Data API v3 Curated Travel Guides) */}
            <section id="section-videos" className="scroll-mt-24">
              <VideoSection
                videosData={videosData}
                isLoading={videosState === 'loading'}
                error={videosError}
              />
            </section>
          </div>
        )}
      </main>

      {/* ── Floating Back-to-Top Button ── */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-slate-900/90 text-white shadow-2xl backdrop-blur-xl transition-all hover:bg-blue-600 hover:scale-105 active:scale-95"
          aria-label="Scroll to top of page"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
