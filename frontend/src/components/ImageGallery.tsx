import { useState } from 'react';
import { Camera, ExternalLink, User, Shield, X, Loader2, AlertCircle } from 'lucide-react';
import type { DestinationImage, ImagesResponse } from '../types/images';

interface Props {
  imagesData: ImagesResponse | null;
  isLoading: boolean;
  error: string;
}

export default function ImageGallery({ imagesData, isLoading, error }: Props) {
  const [selectedImage, setSelectedImage] = useState<DestinationImage | null>(null);

  /* ── Loading state ── */
  if (isLoading) {
    return (
      <div className="mt-4 bg-white/8 border border-white/12 rounded-3xl px-6 py-6 flex items-center gap-3 text-blue-300">
        <Loader2 className="w-5 h-5 animate-spin shrink-0" />
        <span>Loading destination photographs…</span>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="mt-4 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-3xl px-5 py-4 text-red-300">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">Photos unavailable</p>
          <p className="text-xs mt-0.5 text-red-300/80">{error}</p>
        </div>
      </div>
    );
  }

  if (!imagesData) return null;

  const { images, count, destination } = imagesData;

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs text-blue-300/50 uppercase tracking-widest font-semibold">
            Destination Photos
          </h3>
        </div>
        <span className="text-xs text-blue-300/60 bg-white/8 px-2 py-0.5 rounded-full">
          Wikimedia Commons {count > 0 ? `(${count})` : ''}
        </span>
      </div>

      {/* Empty State */}
      {count === 0 && (
        <div className="bg-white/6 border border-white/10 rounded-3xl px-6 py-6 flex items-center gap-3 text-blue-300/60">
          <Camera className="w-5 h-5 shrink-0 opacity-60 text-purple-300" />
          <div>
            <p className="font-medium text-white/70 text-sm">No photos found</p>
            <p className="text-xs mt-0.5 text-blue-300/50">
              No public domain or Creative Commons photos were found for {destination}.
            </p>
          </div>
        </div>
      )}

      {/* Images Grid */}
      {count > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => setSelectedImage(img)}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/30 border border-white/10 cursor-pointer transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedImage(img);
                }
              }}
              aria-label={`View photo: ${img.title}`}
            >
              <img
                src={img.thumbUrl}
                alt={img.title}
                className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-300"
                loading="lazy"
              />

              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2.5 flex flex-col justify-end">
                <p className="text-white text-xs font-semibold line-clamp-1">
                  {img.title}
                </p>
                {img.creator && (
                  <p className="text-[11px] text-blue-200/80 truncate mt-0.5">
                    By {img.creator}
                  </p>
                )}
                {img.license && (
                  <span className="text-[10px] text-purple-300/90 font-medium truncate mt-0.5">
                    {img.license}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Image Detail Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.title}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900/95 border border-white/15 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo preview */}
            <div className="w-full max-h-[60vh] bg-black/60 flex items-center justify-center overflow-hidden">
              <img
                src={selectedImage.url || selectedImage.thumbUrl}
                alt={selectedImage.title}
                className="max-h-[60vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Details bar */}
            <div className="p-5 space-y-2.5">
              <h4 className="text-white font-bold text-base leading-snug">
                {selectedImage.title}
              </h4>

              {selectedImage.description && (
                <p className="text-xs text-blue-200/70 line-clamp-3">
                  {selectedImage.description}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs text-blue-300/70">
                <div className="flex flex-wrap items-center gap-3">
                  {selectedImage.creator && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      {selectedImage.creator}
                    </span>
                  )}
                  {selectedImage.license && (
                    <span className="flex items-center gap-1 text-purple-300">
                      <Shield className="w-3.5 h-3.5" />
                      {selectedImage.licenseUrl ? (
                        <a
                          href={selectedImage.licenseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {selectedImage.license}
                        </a>
                      ) : (
                        selectedImage.license
                      )}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={selectedImage.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Commons page <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={selectedImage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors font-medium"
                  >
                    Full Image <ExternalLink className="w-3 h-3" />
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
