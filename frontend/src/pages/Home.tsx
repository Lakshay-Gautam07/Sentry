import { useState } from 'react';
import { Search, MapPin, Globe, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import type { Destination, DestinationSearchResponse } from '../types/destination';

type SearchState = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Destination[]>([]);
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastQuery, setLastQuery] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearchState('loading');
    setResults([]);
    setErrorMessage('');
    setLastQuery(trimmed);

    try {
      const { data } = await api.get<DestinationSearchResponse>('/api/destinations/search', {
        params: { q: trimmed },
      });

      if (!data.success) {
        setSearchState('error');
        setErrorMessage(data.message ?? 'Something went wrong.');
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
      setErrorMessage(
        axiosError?.response?.data?.message ??
          'Could not reach the server. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center px-4 py-16">
      {/* Header */}
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

      {/* Search Box */}
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

      {/* Results Area */}
      <div className="w-full max-w-xl mt-6">
        {/* Loading */}
        {searchState === 'loading' && (
          <div className="flex items-center justify-center gap-3 text-blue-300 py-10">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Finding destinations…</span>
          </div>
        )}

        {/* Error */}
        {searchState === 'error' && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4 text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Something went wrong</p>
              <p className="text-sm mt-0.5 text-red-300/80">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {searchState === 'empty' && (
          <div className="text-center text-blue-300/70 py-10">
            <MapPin className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No results for &quot;{lastQuery}&quot;</p>
            <p className="text-sm mt-1">Try a different spelling or a nearby city.</p>
          </div>
        )}

        {/* Success — result cards */}
        {searchState === 'success' && results.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-blue-300/50 mb-2 pl-1">
              {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{lastQuery}&quot;
            </p>
            {results.map((dest) => (
              <div
                key={dest.id}
                className="flex items-center justify-between bg-white/8 backdrop-blur-sm border border-white/12 rounded-2xl px-5 py-4 hover:bg-white/12 transition-colors cursor-pointer group"
                role="button"
                tabIndex={0}
                aria-label={`${dest.name}, ${dest.country}`}
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
              </div>
            ))}
          </div>
        )}

        {/* Idle hint */}
        {searchState === 'idle' && (
          <p className="text-center text-sm text-blue-300/40 mt-4">
            Weather, alerts, news &amp; AI insights — coming in next phases
          </p>
        )}
      </div>
    </div>
  );
}
