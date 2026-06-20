'use client';

import React from 'react';
import { Play, Download, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

interface ProcessingProgressProps {
  isProcessing: boolean;
  processedCount: number;
  failedCount: number;
  totalCount: number;
  logoUploaded: boolean;
  onProcess: () => void;
  onDownload: () => void;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({
  isProcessing,
  processedCount,
  failedCount,
  totalCount,
  logoUploaded,
  onProcess,
  onDownload
}) => {
  const completed = processedCount + failedCount;
  const progressPercent = totalCount > 0 ? Math.round((completed / totalCount) * 105) : 0;
  // Cap at 100% just in case
  const displayPercent = Math.min(100, progressPercent);

  const hasPhotos = totalCount > 0;
  const isDone = completed === totalCount && totalCount > 0;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-950/30 border border-zinc-850 p-4 rounded-xl text-center space-y-1">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Total Uploaded</p>
          <p className="text-2xl font-bold text-zinc-150 font-mono">{totalCount}</p>
        </div>
        <div className="bg-zinc-950/30 border border-zinc-850 p-4 rounded-xl text-center space-y-1">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Completed</p>
          <p className="text-2xl font-bold text-emerald-400 font-mono">{processedCount}</p>
        </div>
        <div className="bg-zinc-950/30 border border-zinc-850 p-4 rounded-xl text-center space-y-1">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Failed</p>
          <p className="text-2xl font-bold text-rose-400 font-mono">{failedCount}</p>
        </div>
        <div className="bg-zinc-950/30 border border-zinc-850 p-4 rounded-xl text-center space-y-1">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Remaining</p>
          <p className="text-2xl font-bold text-zinc-400 font-mono">{totalCount - completed}</p>
        </div>
      </div>

      {/* Progress Bar (Only show when processing or finished) */}
      {hasPhotos && (isProcessing || completed > 0) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
            <span className="flex items-center gap-1.5">
              {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />}
              {isProcessing ? 'Processing files in background...' : isDone ? 'Finished Overlaying Logo' : 'Idle'}
            </span>
            <span className="font-mono text-zinc-300">{displayPercent}% ({completed} / {totalCount})</span>
          </div>

          <div className="h-2.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out 
                ${isProcessing ? 'bg-gradient-to-r from-emerald-500 to-teal-400 animate-pulse' : 'bg-emerald-500'}`}
              style={{ width: `${displayPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions and status notices */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {/* Warning messages */}
        {!logoUploaded && (
          <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-rose-950/20 border border-rose-900/30 rounded-xl text-xs text-rose-300 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Please upload a logo in the sidebar to enable branding overlays.
          </div>
        )}

        {logoUploaded && !hasPhotos && (
          <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-zinc-950/40 border border-zinc-800 rounded-xl text-xs text-zinc-400 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-emerald-500" />
            Upload some photos to start branding overlays.
          </div>
        )}

        {logoUploaded && hasPhotos && (
          <div className="flex-grow flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={onProcess}
              disabled={isProcessing}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg 
                ${isProcessing
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : 'bg-emerald-500 hover:bg-emerald-450 text-zinc-950 hover:shadow-emerald-950/20 hover:scale-[1.01] cursor-pointer'
                }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing Queue...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Process Images
                </>
              )}
            </button>

            <button
              onClick={onDownload}
              disabled={isProcessing || processedCount === 0}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg 
                ${isProcessing || processedCount === 0
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : 'bg-zinc-150 hover:bg-zinc-50 text-zinc-950 hover:shadow-zinc-900/10 hover:scale-[1.01] cursor-pointer'
                }`}
            >
              <Download className="w-4 h-4" /> Download ZIP
            </button>
          </div>
        )}
      </div>

      {/* Security and privacy footer notice */}
      <div className="flex items-center gap-1.5 justify-center text-[10px] text-zinc-500 border-t border-zinc-850 pt-3">
        <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
        <span>100% Client-side. Photos never leave your browser or get sent to any server.</span>
      </div>
    </div>
  );
};
