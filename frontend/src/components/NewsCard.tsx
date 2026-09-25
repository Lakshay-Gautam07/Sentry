import { useState } from 'react';
import { Newspaper, ExternalLink, Calendar, Loader2, AlertCircle } from 'lucide-react';
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
    <article className="group flex flex-col justify-between rounded-xl border border-[#EAE4D9]/70 bg-white p-4 transition-all duration-300 hover:border-[#0E5B3C]/30 hover:shadow-md">
      <div>
        {/* Article Image or Clean Fallback */}
        <div className="mb-3.5 h-44 w-full overflow-hidden rounded-xl bg-[#FAF6EE] relative border border-[#EAE4D9]/50">
          {hasValidImage && article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-[#FAF6EE] text-[#8A8378]">
              <Newspaper className="h-7 w-7 text-[#0E5B3C]/50 stroke-[1.5]" />
              <span className="mt-1.5 text-[10px] font-bold tracking-wider uppercase text-[#8A8378]">
                {article.source}
              </span>
            </div>
          )}
        </div>

        {/* Source & Published Date */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="rounded-full bg-[#EBF4EF] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0E5B3C]">
            {article.source}
          </span>
          {formattedDate && (
            <span className="flex items-center gap-1 text-[11px] text-[#8A8378]">
              <Calendar className="h-3 w-3 text-[#8A8378]" />
              <span>{formattedDate}</span>
            </span>
          )}
        </div>

        {/* Title in Editorial Serif */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-serif text-sm sm:text-base font-bold leading-snug text-[#2A2620] line-clamp-2 transition-colors group-hover:text-[#0E5B3C]"
        >
          {article.title}
        </a>
      </div>

      {/* Card Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-[#EAE4D9]/60 pt-3 text-xs text-[#8A8378]">
        <span className="truncate max-w-[170px] text-[11px]">
          {article.sourceCountry || article.source}
        </span>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-[#0E5B3C] transition-colors hover:text-[#0b472f]"
          aria-label={`Read article: ${article.title}`}
        >
          <span>Read story</span>
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
      <div className="rounded-[20px] bg-white p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(42,38,32,0.05)] border border-[#EAE4D9]/80">
        <div className="flex items-center gap-3 text-[#8A8378] mb-4">
          <Loader2 className="h-5 w-5 animate-spin text-[#0E5B3C]" />
          <span className="text-sm font-medium">Scanning international wire dispatches…</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
          <div className="h-60 rounded-xl bg-[#FAF6EE]" />
          <div className="h-60 rounded-xl bg-[#FAF6EE]" />
          <div className="h-60 rounded-xl bg-[#FAF6EE]" />
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
              News Feed
            </span>
            <h4 className="font-serif text-base font-bold text-[#2A2620] mt-0.5">
              News Dispatches Offline
            </h4>
            <p className="mt-1 text-xs text-[#8A8378] leading-relaxed">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!newsData) return null;

  const { count, articles, destination } = newsData;

  return (
    <div className="rounded-[20px] bg-white p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(42,38,32,0.05)] border border-[#EAE4D9]/80 space-y-6">
      {/* ── Section Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE4D9]/60 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8378]">
            LOCAL JOURNALISM &amp; WIRE DISPATCHES
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2A2620] mt-1">
            Recent News &amp; Developments
          </h2>
          <p className="text-xs text-[#8A8378] mt-0.5">
            Real-time coverage from global news organizations for {destination}
          </p>
        </div>
        <span className="rounded-full border border-[#EAE4D9] bg-[#FAF6EE] px-3 py-1 text-xs font-medium text-[#8A8378]">
          GDELT Global News Network ({count})
        </span>
      </div>

      {/* ── Empty State ── */}
      {count === 0 && (
        <div className="rounded-xl border border-[#EAE4D9]/70 bg-[#FAF6EE]/50 p-6 text-center">
          <Newspaper className="h-7 w-7 mx-auto mb-2 text-[#8A8378]" />
          <h4 className="font-serif text-sm font-bold text-[#2A2620]">
            No Recent Breaking Headlines
          </h4>
          <p className="text-xs text-[#8A8378] mt-1 max-w-sm mx-auto">
            No active major crises or disruptive news events were indexed for {destination} in recent news cycles.
          </p>
        </div>
      )}

      {/* ── News Articles Grid ── */}
      {count > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article, idx) => (
            <ArticleItem key={idx} article={article} />
          ))}
        </div>
      )}

      {/* Footer attribution */}
      <div className="border-t border-[#EAE4D9]/60 pt-4 flex items-center justify-between text-[11px] text-[#8A8378]">
        <span>Powered by GDELT Project DOC 2.0 Global Monitoring</span>
        <span>Updated real-time</span>
      </div>
    </div>
  );
}
