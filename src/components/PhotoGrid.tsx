'use client';

import React from 'react';
import { PhotoItem } from '@/hooks/useImageProcessor';
import { Trash2, Eye, CheckCircle2, AlertCircle, Loader2, Sparkles, FileImage } from 'lucide-react';

interface PhotoGridProps {
  photos: PhotoItem[];
  onRemovePhoto: (id: string) => void;
  onPreviewPhoto: (photo: PhotoItem) => void;
  onClearAll: () => void;
  isProcessing: boolean;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  onRemovePhoto,
  onPreviewPhoto,
  onClearAll,
  isProcessing
}) => {
  // Helper to format file size
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <FileImage className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-zinc-200">
            Uploaded Photos <span className="text-zinc-500 font-normal">({photos.length})</span>
          </h2>
        </div>
        <button
          onClick={onClearAll}
          disabled={isProcessing}
          className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs font-medium text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 hover:bg-zinc-950/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto max-h-[580px] pr-1.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {photos.map((photo) => {
          const isPending = photo.status === 'pending';
          const isWorking = photo.status === 'processing';
          const isDone = photo.status === 'completed';
          const isError = photo.status === 'failed';

          // Determine current thumbnail URL (show processed URL if done, else original preview)
          const currentThumbnail = isDone && photo.processedUrl ? photo.processedUrl : photo.previewUrl;

          return (
            <div
              key={photo.id}
              className={`group relative overflow-hidden rounded-xl border bg-zinc-900/40 p-2.5 transition-all duration-300 flex flex-col justify-between h-[210px]
                ${isWorking ? 'border-amber-500 bg-amber-950/5 ring-1 ring-amber-500/20' : ''}
                ${isDone ? 'border-emerald-500/30 bg-emerald-950/5 hover:border-emerald-500/60' : 'border-zinc-800 hover:border-zinc-700'}`}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-zinc-950 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentThumbnail}
                  alt={photo.name}
                  className="w-full h-full object-cover select-none transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Status Badges Overlay */}
                <div className="absolute top-1.5 right-1.5 flex gap-1">
                  {isWorking && (
                    <span className="p-1 rounded-md bg-amber-900/80 text-amber-300 backdrop-blur-md border border-amber-600/30 flex items-center justify-center animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    </span>
                  )}
                  {isDone && (
                    <span className="p-1 rounded-md bg-emerald-950/80 text-emerald-300 backdrop-blur-md border border-emerald-600/20 flex items-center justify-center" title="Branded Successfully">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {isError && (
                    <span className="p-1 rounded-md bg-rose-950/80 text-rose-300 backdrop-blur-md border border-rose-600/20 flex items-center justify-center" title={photo.errorMessage || 'Failed'}>
                      <AlertCircle className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Actions Hover Cover overlay */}
                <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <button
                    onClick={() => onPreviewPhoto(photo)}
                    className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-700 text-zinc-100 hover:scale-105 transition-all duration-150 flex items-center justify-center"
                    title="Compare / Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemovePhoto(photo.id)}
                    disabled={isProcessing}
                    className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-rose-500/50 hover:bg-rose-950/60 text-zinc-100 hover:text-rose-400 disabled:opacity-40 disabled:scale-100 hover:scale-105 transition-all duration-150 flex items-center justify-center"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Text metadata */}
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium text-zinc-200 truncate" title={photo.name}>
                  {photo.name}
                </p>
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono leading-none">
                  <span>{photo.dimensions ? `${photo.dimensions.width}x${photo.dimensions.height}` : 'Reading...'}</span>
                  <span>{formatSize(photo.size)}</span>
                </div>
              </div>

              {/* Mini Status Tag for Non-hover state */}
              <div className="mt-2 flex items-center gap-1.5 pt-1.5 border-t border-zinc-800/60">
                <span className={`w-1.5 h-1.5 rounded-full 
                  ${isPending ? 'bg-zinc-500' : ''}
                  ${isWorking ? 'bg-amber-400 animate-ping' : ''}
                  ${isDone ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}
                  ${isError ? 'bg-rose-500 animate-pulse' : ''}`}
                />
                <span className={`text-[10px] font-medium tracking-wide uppercase
                  ${isPending ? 'text-zinc-500' : ''}
                  ${isWorking ? 'text-amber-400 font-semibold' : ''}
                  ${isDone ? 'text-emerald-400' : ''}
                  ${isError ? 'text-rose-450' : ''}`}
                >
                  {isPending && 'Pending'}
                  {isWorking && 'Overlaying...'}
                  {isDone && 'Ready'}
                  {isError && 'Error'}
                </span>
                {isDone && (
                  <span className="ml-auto text-[9px] text-emerald-500 font-semibold flex items-center gap-0.5 bg-emerald-950/30 px-1 rounded border border-emerald-900/30">
                    <Sparkles className="w-2.5 h-2.5" /> branded
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
