import { useState } from 'react';
import { Search, MapPin, Globe } from 'lucide-react';

export default function Home() {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // API integration will be added in later phases
    if (query.trim()) {
      alert(`Searching for: ${query} (coming soon!)`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center px-4">
      {/* Header */}
      <header className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Globe className="w-10 h-10 text-blue-400" strokeWidth={1.5} />
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Sentry
          </h1>
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
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-xl transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Footer hint */}
      <p className="mt-8 text-sm text-blue-300/50 text-center">
        Phase 0 — UI scaffold · API integration coming soon
      </p>
    </div>
  );
}
