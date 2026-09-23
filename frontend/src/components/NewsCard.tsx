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
      year: 'numeric'
    });
  } catch {
    return null;
  }
}

function ArticleItem({ article }: { article: NewsArticle }) {
  const [imgError, setImgError] = useState(false);
  const formattedDate = formatDate(article.publishedAt);

  return (
    <article className="group bg-white/6 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between">
      <div>
        {article.imageUrl && !imgError && (
          <div className="mb-3 w-full h-36 rounded-xl overflow-hidden bg-black/20">
            <img
              src={article.imageUrl}
              alt={article.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300">
            {article.source}
          </span>
          {formattedDate && (
            <span className="text-xs text-blue-200/50 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
          )}
        </div>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white font-semibold text-sm leading-snug line-clamp-2 hover:text-blue-300 transition-colors"
        >
          {article.title}
        </a>
      </div>

      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-blue-300/60">
        <span className="truncate max-w-[180px]">{article.sourceCountry || article.source}</span>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium transition-colors"
          aria-label={`Read full article: ${article.title}`}
        >
          Read <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </article>
  );
}

export default function NewsCard({ newsData, isLoading, error }: Props) {
  /* ── Loading state ── */
  if (isLoading) {
    return (
      <div className="mt-4 bg-white/8 border border-white/12 rounded-3xl px-6 py-6 flex items-center gap-3 text-blue-300">
        <Loader2 className="w-5 h-5 animate-spin shrink-0" />
        <span>Searching recent news &amp; articles…</span>
      </div>
    );
  }

  /* ── Hard error state ── */
  if (error) {
    return (
      <div className="mt-4 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-3xl px-5 py-4 text-red-300">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">News unavailable</p>
          <p className="text-xs mt-0.5 text-red-300/80">{error}</p>
        </div>
      </div>
    );
  }

  if (!newsData) return null;

  const { articles, count, fromCache, rateLimited, destination } = newsData;

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs text-blue-300/50 uppercase tracking-widest font-semibold">
            Recent News &amp; Articles
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {fromCache && (
            <span className="text-[11px] text-blue-300/50 flex items-center gap-1 bg-white/6 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3" /> cached
            </span>
          )}
          <span className="text-xs text-blue-300/60 bg-white/8 px-2 py-0.5 rounded-full">
            GDELT DOC 2.0
          </span>
        </div>
      </div>

      {/* Rate limited note if applicable */}
      {rateLimited && count === 0 && (
        <div className="mb-3 flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/25 rounded-2xl px-4 py-3 text-yellow-200/90 text-xs">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-yellow-400" />
          <span>
            News provider rate limit reached. Recent articles will be updated automatically on your next request.
          </span>
        </div>
      )}

      {/* Empty State */}
      {count === 0 && (
        <div className="bg-white/6 border border-white/10 rounded-3xl px-6 py-6 flex items-center gap-3 text-blue-300/60">
          <Newspaper className="w-5 h-5 shrink-0 opacity-60 text-blue-300" />
          <div>
            <p className="font-medium text-white/70 text-sm">No recent news found</p>
            <p className="text-xs mt-0.5 text-blue-300/50">
              No recent news articles were indexed for {destination} in the past month.
            </p>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      {count > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {articles.map((article) => (
            <ArticleItem key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
