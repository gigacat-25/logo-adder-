'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileImage, RefreshCw } from 'lucide-react';

interface LogoUploadProps {
  logoFile: File | null;
  logoUrl: string | null;
  onLogoUpload: (file: File) => void;
  onRemoveLogo: () => void;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({
  logoFile,
  logoUrl,
  onLogoUpload,
  onRemoveLogo
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onLogoUpload(acceptedFiles[0]);
    }
  }, [onLogoUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/svg+xml': ['.svg'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">Logo Image</h3>
        {logoFile && (
          <button
            onClick={onRemoveLogo}
            className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-400 font-medium transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Remove
          </button>
        )}
      </div>

      {!logoFile ? (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 
            ${isDragActive 
              ? 'border-emerald-500 bg-emerald-950/20 shadow-emerald-950/10' 
              : 'border-zinc-700 bg-zinc-900/40 hover:border-zinc-500 hover:bg-zinc-900/60'
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="p-3 bg-zinc-800/80 rounded-full text-zinc-400">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-zinc-200">
              {isDragActive ? 'Drop your logo here' : 'Drag & drop your logo'}
            </p>
            <p className="text-xs text-zinc-400">
              Supports PNG, SVG, or WEBP
            </p>
            <span className="mt-2 text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded font-mono">
              Transparent background recommended
            </span>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
          {/* Logo preview with transparent chess pattern */}
          <div className="flex flex-col items-center gap-4">
            <div 
              className="relative w-full aspect-video rounded-lg overflow-hidden flex items-center justify-center border border-zinc-800"
              style={{
                backgroundImage: 'conic-gradient(#27272a 0.25turn, #18181b 0.25turn 0.5turn, #27272a 0.5turn 0.75turn, #18181b 0.75turn)',
                backgroundSize: '20px 20px',
              }}
            >
              {logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="max-w-[80%] max-h-[80%] object-contain"
                />
              )}
            </div>

            <div className="w-full flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2 truncate">
                <FileImage className="w-4 h-4 shrink-0 text-emerald-500" />
                <span className="truncate font-medium text-zinc-300">{logoFile.name}</span>
              </div>
              <span className="shrink-0">{(logoFile.size / 1024).toFixed(1)} KB</span>
            </div>

            <div 
              {...getRootProps()} 
              className="w-full py-2 flex items-center justify-center gap-2 border border-zinc-700 rounded-lg hover:border-zinc-500 bg-zinc-800/40 hover:bg-zinc-800/80 cursor-pointer text-xs font-medium text-zinc-300 transition-all duration-200"
            >
              <input {...getInputProps()} />
              <RefreshCw className="w-3.5 h-3.5 text-zinc-400" /> Replace Logo
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
