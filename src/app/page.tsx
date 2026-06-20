'use client';

import React, { useState, useEffect } from 'react';
import { useImageProcessor, PhotoItem } from '@/hooks/useImageProcessor';
import { LogoUpload } from '@/components/LogoUpload';
import { LogoSettings } from '@/components/LogoSettings';
import { PhotoUpload } from '@/components/PhotoUpload';
import { PhotoGrid } from '@/components/PhotoGrid';
import { PreviewModal } from '@/components/PreviewModal';
import { ProcessingProgress } from '@/components/ProcessingProgress';
import { useTheme } from 'next-themes';
import { Sun, Moon, Sparkles, Image as ImageIcon, ShieldAlert } from 'lucide-react';

export default function Home() {
  const {
    logoFile,
    logoUrl,
    logoSettings,
    setLogoSettings,
    photos,
    isProcessing,
    processedCount,
    failedCount,
    totalCount,
    handleLogoUpload,
    handleRemoveLogo,
    addPhotos,
    removePhoto,
    clearAll,
    processImages,
    downloadZip
  } = useImageProcessor();

  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  // Prevent Next.js hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  // Find currently open photo to keep its details up-to-date in preview modal if settings change
  const activePreviewPhoto = selectedPhoto
    ? photos.find((p) => p.id === selectedPhoto.id) || selectedPhoto
    : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Navbar / Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 bg-emerald-500 rounded-xl text-zinc-950 shadow-md shadow-emerald-500/10">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-300 bg-clip-text text-transparent">
              Bulk Photo Logo Overlay Tool
            </h1>
            <p className="text-[10px] text-zinc-500 font-medium">Local-first browser watermarking utility</p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-250 transition-all duration-200"
            title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar: Logo uploads & Settings (1 Column wide) */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-6 shadow-xs">
            {/* Logo Upload Panel */}
            <LogoUpload
              logoFile={logoFile}
              logoUrl={logoUrl}
              onLogoUpload={handleLogoUpload}
              onRemoveLogo={handleRemoveLogo}
            />

            {/* Divider */}
            <div className="border-t border-zinc-200 dark:border-zinc-800" />

            {/* Logo Positioning & Sliders */}
            <LogoSettings
              settings={logoSettings}
              onSettingsChange={setLogoSettings}
              disabled={!logoFile}
            />
          </div>

          {/* Local storage warning/tip */}
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-[11px] text-amber-600 dark:text-amber-400 leading-normal flex gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Privacy Guaranteed</span>
              All processing executes directly inside your browser cache. Zero files are uploaded to any server. Completely safe to use with private templates.
            </div>
          </div>
        </aside>

        {/* Dashboard Work Area (3 Columns wide) */}
        <main className="lg:col-span-3 space-y-6">
          {/* Progress Overlay bar (appears once photos exist) */}
          <ProcessingProgress
            isProcessing={isProcessing}
            processedCount={processedCount}
            failedCount={failedCount}
            totalCount={totalCount}
            logoUploaded={!!logoFile}
            onProcess={processImages}
            onDownload={downloadZip}
          />

          {/* Photo Dropzone Container */}
          {photos.length === 0 ? (
            <PhotoUpload onPhotosUpload={addPhotos} disabled={isProcessing} />
          ) : (
            /* Sub-Dropzone to append more photos when list is already populated */
            <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-semibold text-zinc-300">Need to add more?</h3>
                  <p className="text-xs text-zinc-500">Append more files to the current branding queue.</p>
                </div>
              </div>

              {/* Smaller overlay Dropzone button */}
              <PhotoUpload 
                onPhotosUpload={addPhotos} 
                disabled={isProcessing} 
                compact
              />
            </div>
          )}

          {/* Photo Grid Preview */}
          <PhotoGrid
            photos={photos}
            onRemovePhoto={removePhoto}
            onPreviewPhoto={setSelectedPhoto}
            onClearAll={clearAll}
            isProcessing={isProcessing}
          />
        </main>
      </div>

      {/* Comparison Split Slider Modal */}
      {selectedPhoto && (
        <PreviewModal
          photo={activePreviewPhoto}
          logoUrl={logoUrl}
          settings={logoSettings}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
}
