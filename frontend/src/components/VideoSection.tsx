import { Play, ExternalLink, Calendar, User, Loader2, AlertCircle } from 'lucide-react';
import type { YouTubeVideo, VideosResponse } from '../types/videos';

interface Props {
  videosData: VideosResponse | null;
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

function VideoItem({ video }: { video: YouTubeVideo }) {
  const formattedDate = formatDate(video.publishedAt);

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#EAE4D9]/70 bg-white transition-all duration-300 hover:border-[#0E5B3C]/30 hover:shadow-md active:scale-[0.98]"
      aria-label={`Watch video: ${video.title}`}
    >
      <div>
        {/* 16:9 Thumbnail with YouTube Play Badge Overlay */}
        <div className="relative aspect-video w-full overflow-hidden bg-[#FAF6EE]">
          {video.thumbnail && (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          )}

          {/* Centered Play Button */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/10">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0E5B3C] text-white shadow-lg transition-transform duration-200 group-hover:scale-110">
              <Play className="h-4 w-4 fill-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="p-4">
          <h4 className="font-serif text-sm font-bold leading-snug text-[#2A2620] line-clamp-2 transition-colors group-hover:text-[#0E5B3C]">
            {video.title}
          </h4>

          <div className="mt-3 flex items-center justify-between text-xs text-[#8A8378]">
            <span className="flex items-center gap-1.5 truncate max-w-[170px]">
              <User className="h-3.5 w-3.5 shrink-0 text-[#0E5B3C]" />
              <span className="truncate">{video.channelName}</span>
            </span>

            {formattedDate && (
              <span className="flex items-center gap-1 shrink-0 text-[11px] text-[#8A8378]">
                <Calendar className="h-3 w-3" />
                <span>{formattedDate}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="flex items-center justify-end border-t border-[#EAE4D9]/60 px-4 py-2.5 text-xs font-semibold text-[#0E5B3C] transition-colors group-hover:text-[#0b472f]">
        <span className="inline-flex items-center gap-1">
          <span>Watch on YouTube</span>
          <ExternalLink className="h-3 w-3" />
        </span>
      </div>
    </a>
  );
}

export default function VideoSection({ videosData, isLoading, error }: Props) {
  /* ── Loading Skeleton ── */
  if (isLoading) {
    return (
      <div className="rounded-[20px] bg-white p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(42,38,32,0.05)] border border-[#EAE4D9]/80">
        <div className="flex items-center gap-3 text-[#8A8378] mb-4">
          <Loader2 className="h-5 w-5 animate-spin text-[#0E5B3C]" />
          <span className="text-sm font-medium">Curating verified YouTube travel guides and documentaries…</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
          <div className="aspect-[16/11] rounded-xl bg-[#FAF6EE]" />
          <div className="aspect-[16/11] rounded-xl bg-[#FAF6EE]" />
          <div className="aspect-[16/11] rounded-xl bg-[#FAF6EE]" />
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
              Video Guides
            </span>
            <h4 className="font-serif text-base font-bold text-[#2A2620] mt-0.5">
              Travel Guides Unavailable
            </h4>
            <p className="mt-1 text-xs text-[#8A8378] leading-relaxed">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!videosData) return null;

  const { count, videos, destination } = videosData;

  return (
    <div className="rounded-[20px] bg-white p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(42,38,32,0.05)] border border-[#EAE4D9]/80 space-y-6">
      {/* ── Section Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE4D9]/60 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8378]">
            CINEMATIC TRAVEL JOURNALS &amp; ITINERARIES
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2A2620] mt-1">
            Curated Travel Guides &amp; Walking Tours
          </h2>
          <p className="text-xs text-[#8A8378] mt-0.5">
            Handpicked video explorations of {destination}
          </p>
        </div>
        <span className="rounded-full border border-[#EAE4D9] bg-[#FAF6EE] px-3 py-1 text-xs font-medium text-[#8A8378]">
          YouTube Travel Archive ({count})
        </span>
      </div>

      {/* ── Empty State ── */}
      {count === 0 && (
        <div className="rounded-xl border border-[#EAE4D9]/70 bg-[#FAF6EE]/50 p-6 text-center">
          <Play className="h-7 w-7 mx-auto mb-2 text-[#8A8378]" />
          <h4 className="font-serif text-sm font-bold text-[#2A2620]">
            No Travel Guides Indexed
          </h4>
          <p className="text-xs text-[#8A8378] mt-1 max-w-sm mx-auto">
            No travel guide videos were found for {destination}.
          </p>
        </div>
      )}

      {/* ── Videos Grid ── */}
      {count > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {videos.map((video) => (
            <VideoItem key={video.id} video={video} />
          ))}
        </div>
      )}

      {/* Footer attribution */}
      <div className="border-t border-[#EAE4D9]/60 pt-4 flex items-center justify-between text-[11px] text-[#8A8378]">
        <span>Powered by YouTube Data API v3</span>
        <span>Curated video itineraries</span>
      </div>
    </div>
  );
}
