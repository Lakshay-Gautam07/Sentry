import { Play, ExternalLink, Calendar, User, Loader2, AlertCircle, Info, Clock } from 'lucide-react';
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
      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 transition-all duration-300 hover:border-white/25 hover:bg-slate-900/80 hover:shadow-xl active:scale-[0.98]"
      aria-label={`Watch video: ${video.title}`}
    >
      <div>
        {/* 16:9 Thumbnail with YouTube Play Badge Overlay */}
        <div className="relative aspect-video w-full overflow-hidden bg-black/50">
          {video.thumbnail && (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          )}

          {/* Centered Play Button on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/10">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600/90 text-white shadow-lg transition-transform duration-200 group-hover:scale-110 group-hover:bg-red-600">
              <Play className="h-4 w-4 fill-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="p-4">
          <h4 className="text-sm font-semibold leading-snug text-white line-clamp-2 transition-colors group-hover:text-red-300">
            {video.title}
          </h4>

          <div className="mt-3 flex items-center justify-between text-xs text-blue-200/60">
            <span className="flex items-center gap-1.5 truncate max-w-[170px]">
              <User className="h-3.5 w-3.5 shrink-0 text-blue-400" />
              <span className="truncate">{video.channelName}</span>
            </span>

            {formattedDate && (
              <span className="flex items-center gap-1 shrink-0 text-[11px] text-blue-300/50">
                <Calendar className="h-3 w-3" />
                <span>{formattedDate}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="flex items-center justify-end border-t border-white/8 px-4 py-2.5 text-xs font-semibold text-red-400 transition-colors group-hover:text-red-300 group-hover:underline">
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
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 text-blue-300 mb-4">
          <Loader2 className="h-5 w-5 animate-spin text-rose-400" />
          <span className="text-sm font-medium">Fetching curated travel videos and guides…</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-pulse">
          <div className="aspect-[16/11] rounded-2xl bg-white/5" />
          <div className="aspect-[16/11] rounded-2xl bg-white/5" />
          <div className="aspect-[16/11] rounded-2xl bg-white/5" />
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
            <h4 className="text-sm font-bold text-white">Travel Videos Unavailable</h4>
            <p className="mt-1 text-xs text-red-300/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!videosData) return null;

  const { videos, count, destination, quotaExceeded, missingKey, fromCache } = videosData;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-4 w-4 items-center justify-center rounded bg-red-600">
            <Play className="h-2.5 w-2.5 fill-white text-white ml-0.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-blue-300/60">
            Travel Videos &amp; Experiences
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {fromCache && (
            <span className="flex items-center gap-1 rounded-full border border-white/8 bg-white/5 px-2.5 py-0.5 text-[11px] text-blue-300/60">
              <Clock className="h-3 w-3" /> Cached
            </span>
          )}
          <span className="rounded-full border border-white/8 bg-white/5 px-2.5 py-0.5 text-[11px] text-blue-300/60">
            YouTube {count > 0 ? `(${count})` : ''}
          </span>
        </div>
      </div>

      {/* Quota / Missing Key notice */}
      {(quotaExceeded || missingKey) && count === 0 && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-yellow-500/25 bg-yellow-500/10 p-3.5 text-xs text-yellow-200/90">
          <Info className="h-4 w-4 shrink-0 text-yellow-400 mt-0.5" />
          <span>
            {quotaExceeded
              ? 'YouTube daily API search quota has been reached. Video updates will resume tomorrow.'
              : 'YouTube video search is currently operating in fallback mode.'}
          </span>
        </div>
      )}

      {/* Empty State */}
      {count === 0 && !quotaExceeded && !missingKey && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 text-center text-blue-300/60 backdrop-blur-md">
          <Play className="h-8 w-8 mx-auto mb-2 opacity-40 text-red-400" />
          <p className="text-sm font-semibold text-white/80">No travel videos found</p>
          <p className="text-xs mt-1 text-blue-300/50">
            No travel documentaries or guide videos were matched for {destination}.
          </p>
        </div>
      )}

      {/* Videos Grid */}
      {count > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {videos.map((video) => (
            <VideoItem key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
