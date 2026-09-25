import { useState, useEffect } from 'react';
import { Search, MapPin, Loader2, AlertCircle, ChevronRight, X, ArrowUp, Compass } from 'lucide-react';
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
    setSummaryData(null);
    setSummaryError('');
    setSummaryState('loading');

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
    <div className="min-h-screen bg-[#FAF6EE] flex flex-col items-center px-4 sm:px-6 py-10 sm:py-14 text-[#2A2620]">
      {/* ── Editorial Header ── */}
      <header
        className={`w-full max-w-xl text-center transition-all duration-300 ${
          selectedDest ? 'mb-6 sm:mb-8' : 'mb-8 sm:mb-12'
        }`}
      >
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#8A8378]">
            SENTRY TRAVEL INTELLIGENCE
          </span>
        </div>

        <div className="flex items-center justify-center gap-3 mb-2 sm:mb-3">
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[#2A2620]">
            Sentry
          </h1>
        </div>

        {!selectedDest && (
          <p className="text-sm sm:text-base text-[#8A8378] max-w-md mx-auto leading-relaxed font-normal">
            A real-time travel intelligence journal — search any destination worldwide for current weather, safety advisories, local news, and synthesized briefings.
          </p>
        )}
      </header>

      {/* ── Search Input Box (16px radius, white rounded input, search icon on left, attached deep-green button) ── */}
      <form
        onSubmit={handleSearch}
        className="w-full max-w-xl"
        aria-label="Destination search"
      >
        <div className="relative flex items-center rounded-2xl bg-white p-2 sm:p-2.5 shadow-[0_4px_24px_-4px_rgba(42,38,32,0.06)] border border-[#EAE4D9] transition-all focus-within:border-[#0E5B3C] focus-within:shadow-[0_8px_30px_-4px_rgba(14,91,60,0.12)]">
          <Search className="h-5 w-5 text-[#8A8378] ml-2.5 mr-2 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a destination — Tokyo, Paris, Manali…"
            className="flex-1 bg-transparent text-sm sm:text-base text-[#2A2620] placeholder-[#8A8378]/70 outline-none font-sans"
            aria-label="Search destination"
            autoComplete="off"
          />

          {/* Quick Clear Query Button */}
          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={handleClearQuery}
              className="p-1 mr-1 rounded-full text-[#8A8378] hover:text-[#2A2620] hover:bg-[#FAF6EE] transition-colors"
              aria-label="Clear input text"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Attached Deep-Green Button with text "Check destination" */}
          <button
            type="submit"
            disabled={!query.trim() || searchState === 'loading'}
            className="flex items-center gap-2 rounded-xl bg-[#0E5B3C] px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#0b472f] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap"
            aria-label="Check destination"
          >
            {searchState === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Compass className="h-4 w-4 text-white" />
            )}
            <span>{searchState === 'loading' ? 'Searching…' : 'Check destination'}</span>
          </button>
        </div>

        {/* Quick Popular Destination Chips (when search is idle or results cleared) */}
        {!selectedDest && searchState === 'idle' && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8378] mr-1">
              Popular:
            </span>
            {POPULAR_DESTINATIONS.map((pop) => (
              <button
                key={pop.name}
                type="button"
                onClick={() => executeSearch(pop.name)}
                className="rounded-full border border-[#EAE4D9] bg-white px-3.5 py-1 text-xs font-medium text-[#2A2620] shadow-2xs transition-all hover:border-[#0E5B3C] hover:text-[#0E5B3C] hover:bg-[#EBF4EF] active:scale-95"
              >
                {pop.label}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* ── Content View Area ── */}
      <main className={`w-full ${selectedDest ? 'max-w-5xl' : 'max-w-xl'} mt-8 transition-all duration-300`}>

        {/* Search State: Loading */}
        {searchState === 'loading' && (
          <div className="flex flex-col items-center justify-center gap-3 text-[#8A8378] py-14">
            <Loader2 className="h-7 w-7 animate-spin text-[#0E5B3C]" />
            <span className="font-serif text-base text-[#2A2620]">Searching worldwide geography archives…</span>
          </div>
        )}

        {/* Search State: Error */}
        {searchState === 'error' && (
          <div className="rounded-2xl border border-[#FECACA] bg-[#FEE2E2]/60 p-6 text-[#2A2620]">
            <div className="flex items-start gap-3.5">
              <AlertCircle className="h-5 w-5 shrink-0 text-[#B91C1C] mt-0.5" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B91C1C]">Search Error</span>
                <h4 className="font-serif text-base font-bold text-[#2A2620] mt-0.5">Could not complete search</h4>
                <p className="mt-1 text-xs text-[#8A8378] leading-relaxed">{searchError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search State: Empty */}
        {searchState === 'empty' && (
          <div className="rounded-2xl border border-[#EAE4D9] bg-white p-8 text-center text-[#8A8378] shadow-xs">
            <Compass className="h-8 w-8 mx-auto mb-2 text-[#8A8378]/60" />
            <h3 className="font-serif text-lg font-bold text-[#2A2620]">No destinations found for &ldquo;{lastQuery}&rdquo;</h3>
            <p className="mt-1.5 text-xs text-[#8A8378] max-w-sm mx-auto leading-relaxed">
              Please verify the spelling, try a nearby major city, or select one of the popular travel destinations.
            </p>
          </div>
        )}

        {/* Search: Results list — shown when no destination is selected */}
        {searchState === 'success' && results.length > 0 && !selectedDest && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8A8378]">
                {results.length} destination{results.length !== 1 ? 's' : ''} discovered for &ldquo;{lastQuery}&rdquo;
              </p>
              <span className="text-[11px] text-[#8A8378]">Select a location to explore</span>
            </div>
            {results.map((dest) => (
              <button
                key={dest.id}
                onClick={() => handleSelectDestination(dest)}
                className="w-full flex items-center justify-between rounded-[20px] bg-white border border-[#EAE4D9] p-5 text-left shadow-xs transition-all duration-200 hover:border-[#0E5B3C]/40 hover:shadow-md active:scale-[0.99] group"
                aria-label={`Select ${dest.name}, ${dest.country}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF4EF] text-[#0E5B3C] group-hover:bg-[#0E5B3C] group-hover:text-white transition-colors">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-[#2A2620] group-hover:text-[#0E5B3C] transition-colors">
                      {dest.name}
                    </h2>
                    <p className="text-xs text-[#8A8378] mt-0.5">
                      {[dest.region, dest.country].filter(Boolean).join(', ')}
                    </p>
                    <p className="text-[11px] text-[#8A8378]/70 mt-1 font-mono">
                      {typeof dest.latitude === 'number' ? dest.latitude.toFixed(3) : dest.latitude}°,{' '}
                      {typeof dest.longitude === 'number' ? dest.longitude.toFixed(3) : dest.longitude}°
                      {dest.timezone ? ` · ${dest.timezone}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF6EE] text-[#8A8378] group-hover:bg-[#EBF4EF] group-hover:text-[#0E5B3C] transition-colors shrink-0">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Complete Destination Intelligence Profile ── */}
        {selectedDest && (
          <div className="space-y-8">
            {/* 1. Destination Overview (Hero Profile + Navigation Tab Bar) */}
            <DestinationOverview
              destination={selectedDest}
              weather={weather}
              alertsData={alertsData}
              summaryData={summaryData}
              photosCount={imagesData?.count || 0}
              videosCount={videosData?.count || 0}
              newsCount={newsData?.count || 0}
              heroImageUrl={imagesData?.images?.[0]?.url}
              onBack={handleClearSelection}
            />

            {/* 2. Destination Brief / AI Travel Summary */}
            <section id="section-summary" className="scroll-mt-24">
              <SummaryCard
                summaryData={summaryData}
                isLoading={summaryState === 'loading'}
                error={summaryError}
                onRefresh={handleRefreshSummary}
              />
            </section>

            {/* 3. WeatherCard */}
            <section id="section-weather" className="scroll-mt-24">
              <WeatherCard
                destination={selectedDest}
                weather={weather}
                isLoading={weatherState === 'loading'}
                error={weatherError}
              />
            </section>

            {/* 4. AlertsCard */}
            <section id="section-alerts" className="scroll-mt-24">
              <AlertsCard
                alertsData={alertsData}
                isLoading={alertsState === 'loading'}
                error={alertsError}
              />
            </section>

            {/* 5. NewsCard */}
            <section id="section-news" className="scroll-mt-24">
              <NewsCard
                newsData={newsData}
                isLoading={newsState === 'loading'}
                error={newsError}
              />
            </section>

            {/* 6. ImageGallery */}
            <section id="section-photos" className="scroll-mt-24">
              <ImageGallery
                imagesData={imagesData}
                isLoading={imagesState === 'loading'}
                error={imagesError}
              />
            </section>

            {/* 7. VideoSection */}
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
          className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#0E5B3C] text-white shadow-xl transition-all hover:bg-[#0b472f] hover:scale-105 active:scale-95"
          aria-label="Scroll to top of page"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      {/* ── Travel Editorial Footer ── */}
      <footer className="mt-16 w-full max-w-xl text-center text-xs text-[#8A8378] border-t border-[#EAE4D9]/60 pt-6">
        <p className="font-serif italic text-sm text-[#2A2620]">Sentry Travel Intelligence Journal</p>
        <p className="mt-1">Real-time global destination briefings &amp; traveler advisory</p>
      </footer>
    </div>
  );
}
