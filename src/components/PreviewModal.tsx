'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PhotoItem, LogoSettings } from '@/hooks/useImageProcessor';
import { X, Sparkles, SlidersHorizontal, Image as ImageIcon, Eye } from 'lucide-react';

interface PreviewModalProps {
  photo: PhotoItem | null;
  logoUrl: string | null;
  settings: LogoSettings;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  photo,
  logoUrl,
  settings,
  onClose
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState<'slider' | 'original' | 'branded'>('slider');
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset slider position on load
  useEffect(() => {
    setSliderPos(50);
    if (photo && !photo.processedUrl) {
      // If it's not processed yet, show side-by-side or layered original
      setViewMode('branded'); // Shows live CSS preview
    } else {
      setViewMode('slider');
    }
  }, [photo]);

  if (!photo) return null;

  const isProcessed = !!photo.processedUrl;

  // Handle slider movement
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  // Helper to calculate CSS positioning for real-time preview (when not processed yet)
  const getLogoStyle = () => {
    const { position, size, margin } = settings;
    // scale margin from 0-100px: 20px means 2% margin relative to width
    const marginPct = margin / 10; // 0% to 10%
    const sizePct = size; // 5% to 30%

    const style: React.CSSProperties = {
      width: `${sizePct}%`,
      position: 'absolute',
      margin: `${marginPct}%`,
    };

    switch (position) {
      case 'top-left':
        style.top = 0;
        style.left = 0;
        break;
      case 'top-right':
        style.top = 0;
        style.right = 0;
        break;
      case 'bottom-left':
        style.bottom = 0;
        style.left = 0;
        break;
      case 'bottom-right':
        style.bottom = 0;
        style.right = 0;
        break;
      case 'center':
        style.top = '50%';
        style.left = '50%';
        style.transform = 'translate(-50%, -50%)';
        style.margin = 0;
        break;
    }

    return style;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-zinc-150 truncate">{photo.name}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {photo.dimensions ? `${photo.dimensions.width} x ${photo.dimensions.height} px` : 'Pending dimensions'}
              {' • '}
              {photo.status === 'completed' ? (
                <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Processed
                </span>
              ) : (
                <span className="text-zinc-500 font-medium">Unprocessed (Live Preview Mode)</span>
              )}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-zinc-700 bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View mode toggle tabs (only if processed) */}
        {isProcessed && (
          <div className="flex justify-center border-b border-zinc-800 bg-zinc-950/20 py-2.5 gap-1">
            <button
              onClick={() => setViewMode('slider')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors 
                ${viewMode === 'slider' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
            >
              <Eye className="w-3.5 h-3.5" /> Split Slider
            </button>
            <button
              onClick={() => setViewMode('original')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors 
                ${viewMode === 'original' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Original
            </button>
            <button
              onClick={() => setViewMode('branded')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors 
                ${viewMode === 'branded' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Branded
            </button>
          </div>
        )}

        {/* Content Preview Canvas/Overlay */}
        <div className="flex-1 bg-zinc-950 p-6 flex items-center justify-center min-h-[350px] overflow-hidden select-none">
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="relative max-w-full max-h-[55vh] rounded-lg overflow-hidden border border-zinc-800 shadow-xl cursor-ew-resize flex items-center justify-center aspect-video bg-zinc-900"
          >
            {/* 1. SLIDER MODE (Only if processed) */}
            {isProcessed && viewMode === 'slider' && (
              <>
                {/* Bottom Image: Original */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.previewUrl}
                  alt="Original"
                  className="max-h-[55vh] object-contain select-none pointer-events-none"
                />

                {/* Top Image: Branded (Clipped) */}
                <div
                  className="absolute inset-0 overflow-hidden flex items-center justify-center"
                  style={{ width: `${sliderPos}%` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.processedUrl}
                    alt="Branded"
                    className="absolute max-h-[55vh] object-contain select-none pointer-events-none max-w-none"
                    style={{ width: containerRef.current?.getBoundingClientRect().width }}
                  />
                </div>

                {/* Vertical slider divider bar */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)] z-10"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-zinc-900 border-2 border-emerald-400 shadow-lg flex items-center justify-center text-emerald-400 font-bold select-none cursor-ew-resize">
                    ↔
                  </div>
                </div>
              </>
            )}

            {/* 2. ORIGINAL MODE */}
            {viewMode === 'original' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo.previewUrl}
                alt="Original"
                className="max-h-[55vh] object-contain pointer-events-none"
              />
            )}

            {/* 3. BRANDED MODE / LIVE CSS OVERLAY MODE */}
            {viewMode === 'branded' && (
              <div className="relative max-h-[55vh] aspect-video flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.previewUrl}
                  alt="Original"
                  className="max-h-[55vh] object-contain pointer-events-none"
                />

                {/* Processed URL display if available, else show the live interactive CSS overlay */}
                {isProcessed && photo.processedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.processedUrl}
                    alt="Branded"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  />
                ) : (
                  // Live Settings preview via CSS overlay over original image
                  logoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {/* Inner wrapper matches the display dimensions of the underlying object-contain image */}
                      <div className="relative w-full h-full max-h-[55vh] aspect-video">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logoUrl}
                          alt="Logo Overlay"
                          style={getLogoStyle()}
                          className="opacity-90 max-h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer controls/hints */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            {isProcessed ? (
              <span>Drag the slider handle to inspect changes.</span>
            ) : (
              <span>Adjust size and margin in the sidebar to test overlays live.</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 font-semibold text-zinc-200 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
