'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadProps {
  onPhotosUpload: (files: File[]) => void;
  disabled: boolean;
  compact?: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotosUpload, disabled, compact = false }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onPhotosUpload(acceptedFiles);
    }
  }, [onPhotosUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
      'image/heif': ['.heif']
    },
    disabled,
    multiple: true
  });

  if (compact) {
    return (
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl px-4 py-2 text-center cursor-pointer transition-all duration-200 flex items-center justify-center gap-2
          ${disabled 
            ? 'opacity-40 cursor-not-allowed border-zinc-800 bg-zinc-900/10' 
            : isDragActive
              ? 'border-emerald-500 bg-emerald-950/15 text-emerald-400'
              : 'border-zinc-700 bg-zinc-900/20 hover:border-zinc-500 hover:bg-zinc-900/40 text-zinc-300'
          }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-xs font-semibold">
          {isDragActive ? 'Drop files here' : 'Add More Photos'}
        </span>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] 
        ${disabled 
          ? 'opacity-40 cursor-not-allowed border-zinc-800 bg-zinc-900/10' 
          : isDragActive
            ? 'border-emerald-500 bg-emerald-950/15 shadow-[0_0_24px_rgba(16,185,129,0.06)]'
            : 'border-zinc-700 bg-zinc-900/20 hover:border-zinc-500 hover:bg-zinc-900/40 hover:shadow-[0_0_24px_rgba(255,255,255,0.01)]'
        }`}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-4 max-w-md">
        <div className="p-4 bg-zinc-800/60 rounded-2xl text-zinc-400 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-8 h-8 text-emerald-400" />
        </div>
        
        <div className="space-y-1">
          <p className="text-base font-semibold text-zinc-200">
            {isDragActive ? 'Drop your photos now!' : 'Drag & drop your photos'}
          </p>
          <p className="text-sm text-zinc-400">
            or <span className="text-emerald-400 underline decoration-dotted underline-offset-4 hover:text-emerald-300">browse folders</span> from your computer
          </p>
        </div>

        <p className="text-xs text-zinc-500 flex items-center gap-2">
          <ImageIcon className="w-3.5 h-3.5" /> Supports PNG, JPG, JPEG, WEBP, and HEIC. Upload up to hundreds at once.
        </p>
      </div>
    </div>
  );
};
