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
      year: 'numeric'
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
      className="group bg-white/6 hover:bg-white/10 border border-white/10 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between hover:shadow-lg hover:border-white/20"
      aria-label={`Watch video: ${video.title}`}
    >
      <div>
        {/* Thumbnail with 16:9 aspect ratio and play button overlay */}
        <div className="relative aspect-video w-full overflow-hidden bg-black/40">
          {video.thumbnail && (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          )}

          {/* Play button hover badge */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-red-600/90 group-hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="p-4">
          <h4 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-red-300 transition-colors">
            {video.title}
          </h4>

          <div className="mt-2.5 flex items-center justify-between text-xs text-blue-200/60">
            <span className="flex items-center gap-1.5 truncate max-w-[170px]">
              <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">{video.channelName}</span>
            </span>

            {formattedDate && (
              <span className="flex items-center gap-1 shrink-0 text-blue-300/50">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 pt-1 border-t border-white/5 flex items-center justify-end text-xs text-red-400 group-hover:text-red-300 font-medium">
        <span className="inline-flex items-center gap-1">
          Watch on YouTube <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </a>
  );
}

export default function VideoSection({ videosData, isLoading, error }: Props) {
  /* ── Loading state ── */
  if (isLoading) {
    return (
      <div className="mt-4 bg-white/8 border border-white/12 rounded-3xl px-6 py-6 flex items-center gap-3 text-blue-300">
        <Loader2 className="w-5 h-5 animate-spin shrink-0 text-red-400" />
        <span>Finding travel videos &amp; guides…</span>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="mt-4 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-3xl px-5 py-4 text-red-300">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">Videos unavailable</p>
          <p className="text-xs mt-0.5 text-red-300/80">{error}</p>
        </div>
      </div>
    );
  }

  if (!videosData) return null;

  const { videos, count, destination, quotaExceeded, missingKey, fromCache } = videosData;

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-600 flex items-center justify-center">
            <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
          </div>
          <h3 className="text-xs text-blue-300/50 uppercase tracking-widest font-semibold">
            Travel Videos &amp; Guides
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {fromCache && (
            <span className="text-[11px] text-blue-300/50 flex items-center gap-1 bg-white/6 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3" /> cached
            </span>
          )}
          <span className="text-xs text-blue-300/60 bg-white/8 px-2 py-0.5 rounded-full">
            YouTube {count > 0 ? `(${count})` : ''}
          </span>
        </div>
      </div>

      {/* Quota / Missing Key notice */}
      {(quotaExceeded || missingKey) && count === 0 && (
        <div className="mb-3 flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/25 rounded-2xl px-4 py-3 text-yellow-200/90 text-xs">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-yellow-400" />
          <span>
            {quotaExceeded
              ? 'YouTube daily API quota has been reached. Video updates will resume shortly.'
              : 'YouTube video search is not configured.'}
          </span>
        </div>
      )}

      {/* Empty State */}
      {count === 0 && !quotaExceeded && !missingKey && (
        <div className="bg-white/6 border border-white/10 rounded-3xl px-6 py-6 flex items-center gap-3 text-blue-300/60">
          <Play className="w-5 h-5 shrink-0 opacity-60 text-red-400" />
          <div>
            <p className="font-medium text-white/70 text-sm">No videos found</p>
            <p className="text-xs mt-0.5 text-blue-300/50">
              No recent travel videos were found for {destination}.
            </p>
          </div>
        </div>
      )}

      {/* Videos Grid */}
      {count > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {videos.map((video) => (
            <VideoItem key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
