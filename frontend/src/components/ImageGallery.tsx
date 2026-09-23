import { useState, useEffect } from 'react';
import { Camera, ExternalLink, User, Shield, X, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ImagesResponse } from '../types/images';

interface Props {
  imagesData: ImagesResponse | null;
  isLoading: boolean;
  error: string;
}

export default function ImageGallery({ imagesData, isLoading, error }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const images = imagesData?.images || [];
  const selectedImage = selectedIndex !== null && images[selectedIndex] ? images[selectedIndex] : null;

  // Handle keyboard navigation for modal (ESC to close, Left/Right arrows to navigate)
  useEffect(() => {
    if (selectedImage === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowRight' && images.length > 0) {
        setSelectedIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft' && images.length > 0) {
        setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, images.length]);

  /* ── Loading Skeleton ── */
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 text-blue-300 mb-4">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
          <span className="text-sm font-medium">Curating Wikimedia Commons photographs…</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
          <div className="aspect-[4/3] rounded-2xl bg-white/5" />
          <div className="aspect-[4/3] rounded-2xl bg-white/5" />
          <div className="aspect-[4/3] rounded-2xl bg-white/5" />
          <div className="aspect-[4/3] rounded-2xl bg-white/5" />
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
            <h4 className="text-sm font-bold text-white">Photographs Unavailable</h4>
            <p className="mt-1 text-xs text-red-300/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!imagesData) return null;

  const { count, destination } = imagesData;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-blue-300/60">
            Destination Gallery
          </h3>
        </div>
        <span className="rounded-full border border-white/8 bg-white/5 px-2.5 py-0.5 text-[11px] text-blue-300/60">
          Wikimedia Commons {count > 0 ? `(${count})` : ''}
        </span>
      </div>

      {/* Empty State */}
      {count === 0 && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 text-center text-blue-300/60 backdrop-blur-md">
          <Camera className="h-8 w-8 mx-auto mb-2 opacity-40 text-indigo-400" />
          <p className="text-sm font-semibold text-white/80">No photos available</p>
          <p className="text-xs mt-1 text-blue-300/50">
            No public domain or Creative Commons photos were indexed for {destination}.
          </p>
        </div>
      )}

      {/* Images Grid */}
      {count > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, idx) => (
            <div
              key={img.id}
              onClick={() => setSelectedIndex(idx)}
              className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-md transition-all duration-300 hover:border-white/25 hover:shadow-xl active:scale-95"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedIndex(idx);
                }
              }}
              aria-label={`View photo: ${img.title}`}
            >
              <img
                src={img.thumbUrl}
                alt={img.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />

              {/* Hover Overlay with details */}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <p className="text-xs font-semibold text-white line-clamp-1">{img.title}</p>
                {img.creator && (
                  <p className="mt-0.5 text-[11px] text-blue-200/80 truncate">By {img.creator}</p>
                )}
                {img.license && (
                  <span className="mt-0.5 text-[10px] font-medium text-purple-300/90 truncate">
                    {img.license}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / High-Res Image Detail Modal */}
      {selectedImage && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setSelectedIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.title}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-slate-900/95 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Actions */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <button
                onClick={() => setSelectedIndex(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white/80 transition-colors hover:bg-black/90 hover:text-white"
                aria-label="Close photo viewer (Escape)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Left / Right Nav Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex((prev) =>
                      prev !== null && prev > 0 ? prev - 1 : images.length - 1
                    );
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white/80 transition-colors hover:bg-black/90 hover:text-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex((prev) =>
                      prev !== null && prev < images.length - 1 ? prev + 1 : 0
                    );
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white/80 transition-colors hover:bg-black/90 hover:text-white"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Photo Container */}
            <div className="flex h-[55vh] sm:h-[65vh] w-full items-center justify-center bg-black/70 p-2 overflow-hidden">
              <img
                src={selectedImage.url || selectedImage.thumbUrl}
                alt={selectedImage.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Meta & Attribution Bar */}
            <div className="border-t border-white/10 bg-slate-900/90 p-5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-1">
                  {selectedImage.title}
                </h4>
                <span className="text-xs text-blue-300/50">
                  {selectedIndex + 1} of {images.length}
                </span>
              </div>

              {selectedImage.description && (
                <p className="text-xs text-blue-200/70 line-clamp-2 leading-relaxed">
                  {selectedImage.description}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-blue-300/70 border-t border-white/5">
                <div className="flex flex-wrap items-center gap-3">
                  {selectedImage.creator && (
                    <span className="flex items-center gap-1.5 text-blue-200/80">
                      <User className="h-3.5 w-3.5 text-blue-400" />
                      <span>{selectedImage.creator}</span>
                    </span>
                  )}
                  {selectedImage.license && (
                    <span className="flex items-center gap-1 text-purple-300">
                      <Shield className="h-3.5 w-3.5" />
                      <span>{selectedImage.license}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 font-semibold">
                  <a
                    href={selectedImage.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>Commons</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href={selectedImage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>Full Resolution</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
