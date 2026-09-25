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
      <div className="rounded-[20px] bg-white p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(42,38,32,0.05)] border border-[#EAE4D9]/80">
        <div className="flex items-center gap-3 text-[#8A8378] mb-4">
          <Loader2 className="h-5 w-5 animate-spin text-[#0E5B3C]" />
          <span className="text-sm font-medium">Curating Wikimedia Commons photographic archive…</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
          <div className="aspect-[4/3] rounded-xl bg-[#FAF6EE]" />
          <div className="aspect-[4/3] rounded-xl bg-[#FAF6EE]" />
          <div className="aspect-[4/3] rounded-xl bg-[#FAF6EE]" />
          <div className="aspect-[4/3] rounded-xl bg-[#FAF6EE]" />
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
              Visual Archive
            </span>
            <h4 className="font-serif text-base font-bold text-[#2A2620] mt-0.5">
              Photographs Unavailable
            </h4>
            <p className="mt-1 text-xs text-[#8A8378] leading-relaxed">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!imagesData) return null;

  const { count, destination } = imagesData;

  return (
    <div className="rounded-[20px] bg-white p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(42,38,32,0.05)] border border-[#EAE4D9]/80 space-y-6">
      {/* ── Section Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE4D9]/60 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8378]">
            HISTORICAL PLACES &amp; VISUAL ANTHOLOGY
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2A2620] mt-1">
            Famous Places &amp; Landmarks
          </h2>
          <p className="text-xs text-[#8A8378] mt-0.5">
            Photographic archive and licensed imagery of {destination}
          </p>
        </div>
        <span className="rounded-full border border-[#EAE4D9] bg-[#FAF6EE] px-3 py-1 text-xs font-medium text-[#8A8378]">
          Wikimedia Commons ({count})
        </span>
      </div>

      {/* ── Empty State ── */}
      {count === 0 && (
        <div className="rounded-xl border border-[#EAE4D9]/70 bg-[#FAF6EE]/50 p-6 text-center">
          <Camera className="h-7 w-7 mx-auto mb-2 text-[#8A8378]" />
          <h4 className="font-serif text-sm font-bold text-[#2A2620]">
            No Indexed Photographs
          </h4>
          <p className="text-xs text-[#8A8378] mt-1 max-w-sm mx-auto">
            No public domain or Creative Commons photos were indexed for {destination}.
          </p>
        </div>
      )}

      {/* ── Images Grid ── */}
      {count > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-[#EAE4D9]/70 bg-[#FAF6EE] text-left transition-all duration-300 hover:border-[#0E5B3C]/30 hover:shadow-md active:scale-[0.98]"
              aria-label={`View photo: ${img.title}`}
            >
              {/* Photo Box */}
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#FAF6EE]">
                <img
                  src={img.thumbUrl || img.url}
                  alt={img.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Caption */}
              <div className="p-3 bg-white">
                <p className="font-serif text-xs font-bold text-[#2A2620] line-clamp-1 group-hover:text-[#0E5B3C] transition-colors">
                  {img.title}
                </p>
                {img.creator && (
                  <p className="text-[10px] text-[#8A8378] mt-0.5 truncate">
                    Photo by {img.creator}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Modal Lightbox ── */}
      {selectedImage && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1815]/80 backdrop-blur-md transition-opacity"
          onClick={() => setSelectedIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-4xl w-full rounded-2xl bg-white p-4 sm:p-6 shadow-2xl border border-[#FAF6EE] overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 border border-[#EAE4D9] text-[#2A2620] hover:bg-[#FAF6EE] transition-colors"
              aria-label="Close photo preview"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedIndex((prev) =>
                      prev !== null && prev > 0 ? prev - 1 : images.length - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/90 border border-[#EAE4D9] text-[#2A2620] hover:bg-[#FAF6EE] shadow-md transition-all active:scale-95"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() =>
                    setSelectedIndex((prev) =>
                      prev !== null && prev < images.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/90 border border-[#EAE4D9] text-[#2A2620] hover:bg-[#FAF6EE] shadow-md transition-all active:scale-95"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Image Preview Container */}
            <div className="relative flex-1 min-h-[300px] max-h-[60vh] flex items-center justify-center overflow-hidden rounded-xl bg-[#FAF6EE]">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Caption & Metadata Footer */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#EAE4D9]/60 pt-3">
              <div>
                <h4 className="font-serif text-base font-bold text-[#2A2620]">
                  {selectedImage.title}
                </h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#8A8378] mt-1">
                  {selectedImage.creator && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-[#0E5B3C]" />
                      <span>{selectedImage.creator}</span>
                    </span>
                  )}
                  {selectedImage.license && (
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-[#0E5B3C]" />
                      <span>{selectedImage.license}</span>
                    </span>
                  )}
                  <span>
                    Photo {selectedIndex + 1} of {images.length}
                  </span>
                </div>
              </div>

              {selectedImage.sourceUrl && (
                <a
                  href={selectedImage.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#0E5B3C]/30 bg-[#EBF4EF] px-3.5 py-1.5 text-xs font-semibold text-[#0E5B3C] hover:bg-[#0E5B3C] hover:text-white transition-all shrink-0"
                >
                  <span>Wikimedia Commons</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer attribution */}
      <div className="border-t border-[#EAE4D9]/60 pt-4 flex items-center justify-between text-[11px] text-[#8A8378]">
        <span>Imagery sourced from Wikimedia Commons under Creative Commons licenses</span>
        <span>Curated collection</span>
      </div>
    </div>
  );
}
