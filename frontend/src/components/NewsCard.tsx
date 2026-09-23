import { useState } from 'react';
import { Newspaper, ExternalLink, Calendar, Loader2, AlertCircle, Clock, Info } from 'lucide-react';
import type { NewsArticle, NewsResponse } from '../types/news';

interface Props {
  newsData: NewsResponse | null;
  isLoading: boolean;
  error: string;
}

function formatDate(isoStr: string | null) {
  if (!isoStr) return null;
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

function ArticleItem({ article }: { article: NewsArticle }) {
  const [imgError, setImgError] = useState(false);
  const formattedDate = formatDate(article.publishedAt);
  const hasValidImage = article.imageUrl && !imgError;

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-4 transition-all duration-200 hover:border-white/20 hover:bg-slate-900/80 hover:shadow-xl">
      <div>
        {/* Article Image or Elegant Fallback Header */}
        <div className="mb-3.5 h-40 w-full overflow-hidden rounded-xl border border-white/8 bg-black/30 relative">
          {hasValidImage && article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-blue-950/40 to-slate-900/80 text-blue-300/40">
              <Newspaper className="h-8 w-8 stroke-[1.5]" />
              <span className="mt-1 text-[11px] font-medium tracking-wider uppercase text-blue-300/40">
                {article.source}
              </span>
            </div>
          )}
        </div>

        {/* Source & Published Date */}
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded-md border border-blue-500/25 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-300">
            {article.source}
          </span>
          {formattedDate && (
            <span className="flex items-center gap-1 text-[11px] text-blue-300/50">
              <Calendar className="h-3 w-3" />
              <span>{formattedDate}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold leading-snug text-white line-clamp-2 transition-colors group-hover:text-blue-300"
        >
          {article.title}
        </a>
      </div>

      {/* Card Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-xs text-blue-300/60">
        <span className="truncate max-w-[170px] text-[11px]">
          {article.sourceCountry || article.source}
        </span>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-blue-400 transition-colors hover:text-blue-300 group-hover:underline"
          aria-label={`Read article: ${article.title}`}
        >
          <span>Read Story</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </article>
  );
}

export default function NewsCard({ newsData, isLoading, error }: Props) {
  /* ── Loading Skeleton ── */
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 text-blue-300 mb-4">
          <Loader2 className="h-5 w-5 animate-spin text-sky-400" />
          <span className="text-sm font-medium">Scanning global news and regional articles…</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
          <div className="h-52 rounded-2xl bg-white/5" />
          <div className="h-52 rounded-2xl bg-white/5" />
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
            <h4 className="text-sm font-bold text-white">News Feed Unavailable</h4>
            <p className="mt-1 text-xs text-red-300/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!newsData) return null;

  const { articles, count, fromCache, rateLimited, destination } = newsData;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-sky-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-blue-300/60">
            Recent News &amp; Reports
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {fromCache && (
            <span className="flex items-center gap-1 rounded-full border border-white/8 bg-white/5 px-2.5 py-0.5 text-[11px] text-blue-300/60">
              <Clock className="h-3 w-3" /> Cached
            </span>
          )}
          <span className="rounded-full border border-white/8 bg-white/5 px-2.5 py-0.5 text-[11px] text-blue-300/60">
            GDELT DOC 2.0
          </span>
        </div>
      </div>

      {/* Rate Limited Notice */}
      {rateLimited && count === 0 && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-yellow-500/25 bg-yellow-500/10 p-3.5 text-xs text-yellow-200/90">
          <Info className="h-4 w-4 shrink-0 text-yellow-400 mt-0.5" />
          <span>
            Provider rate limit encountered. Sentry will update news automatically on subsequent requests.
          </span>
        </div>
      )}

      {/* Empty State */}
      {count === 0 && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 text-center text-blue-300/60 backdrop-blur-md">
          <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-40 text-sky-400" />
          <p className="text-sm font-semibold text-white/80">No recent articles found</p>
          <p className="text-xs mt-1 text-blue-300/50">
            No international or local news articles were recorded for {destination} over the past 30 days.
          </p>
        </div>
      )}

      {/* Articles Grid */}
      {count > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {articles.map((article) => (
            <ArticleItem key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
