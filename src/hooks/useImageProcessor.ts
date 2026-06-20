import { useState, useRef, useEffect, useCallback } from 'react';
import JSZip from 'jszip';

export type PositionType = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

export interface LogoSettings {
  position: PositionType;
  size: number; // 5 - 30 (percentage of image width)
  margin: number; // 0 - 100 (relative scaling parameter)
}

export interface PhotoItem {
  id: string;
  file: File;
  name: string;
  size: number;
  dimensions: { width: number; height: number } | null;
  previewUrl: string; // original object URL for grid preview
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  processedUrl?: string; // object URL of the branded image (created on demand or stored for preview)
}

const CONCURRENCY_LIMIT = 2;

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const heic2any = typeof window !== 'undefined' ? (require('heic2any') as any) : null;


// Helper to load File as Image
const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve(img);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
};

// Helper to overlay logo
export const processSingleImage = async (
  photoFile: File,
  logoFile: File,
  settings: LogoSettings
): Promise<Blob> => {
  const [photoImg, logoImg] = await Promise.all([
    loadImage(photoFile),
    loadImage(logoFile)
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = photoImg.naturalWidth;
  canvas.height = photoImg.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas 2D context');
  }

  // Draw original image
  ctx.drawImage(photoImg, 0, 0);

  // Logo dimensions: size is percentage of photo's width
  const logoWidth = photoImg.naturalWidth * (settings.size / 100);
  const logoHeight = logoWidth * (logoImg.naturalHeight / logoImg.naturalWidth);

  // Scaled margin: 20 default means 2% of the photo's width (margin / 1000)
  const actualMargin = (photoImg.naturalWidth * settings.margin) / 1000;

  // Calculate coordinates
  let x = actualMargin;
  let y = actualMargin;

  switch (settings.position) {
    case 'top-left':
      x = actualMargin;
      y = actualMargin;
      break;
    case 'top-right':
      x = photoImg.naturalWidth - logoWidth - actualMargin;
      y = actualMargin;
      break;
    case 'bottom-left':
      x = actualMargin;
      y = photoImg.naturalHeight - logoHeight - actualMargin;
      break;
    case 'bottom-right':
      x = photoImg.naturalWidth - logoWidth - actualMargin;
      y = photoImg.naturalHeight - logoHeight - actualMargin;
      break;
    case 'center':
      x = (photoImg.naturalWidth - logoWidth) / 2;
      y = (photoImg.naturalHeight - logoHeight) / 2;
      break;
  }

  // Draw logo
  ctx.drawImage(logoImg, x, y, logoWidth, logoHeight);

  // Export blob with original image type
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image blob'));
        }
      },
      photoFile.type || 'image/jpeg',
      0.95 // Preserve image quality
    );
  });
};

export const useImageProcessor = () => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    position: 'top-left',
    size: 10,
    margin: 20
  });

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  // Store actual processed blobs out of state to prevent massive memory overhead
  const processedBlobsRef = useRef<Map<string, Blob>>(new Map());
  // Active queue state to control processing loop
  const isCancelledRef = useRef<boolean>(false);

  // Free resources when component unmounts
  useEffect(() => {
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
      photos.forEach((photo) => {
        if (photo.previewUrl) URL.revokeObjectURL(photo.previewUrl);
        if (photo.processedUrl) URL.revokeObjectURL(photo.processedUrl);
      });
    };
  }, [logoUrl, photos]);

  const handleLogoUpload = useCallback((file: File) => {
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoFile(file);
    setLogoUrl(URL.createObjectURL(file));
  }, [logoUrl]);

  const handleRemoveLogo = useCallback(() => {
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoFile(null);
    setLogoUrl(null);
  }, [logoUrl]);

  const addPhotos = useCallback(async (files: File[]) => {
    const newPhotosPromises = files.map(async (file): Promise<PhotoItem> => {
      const id = Math.random().toString(36).substring(2, 9);
      
      let finalFile = file;
      const isHeic = file.name.toLowerCase().endsWith('.heic') || 
                      file.name.toLowerCase().endsWith('.heif') || 
                      file.type === 'image/heic' || 
                      file.type === 'image/heif';

      if (isHeic) {
        try {
          if (heic2any) {
            const convertFn = heic2any.default || heic2any;
            const result = await convertFn({
              blob: file,
              toType: 'image/png'
            });
            const blob = Array.isArray(result) ? result[0] : result;
            const newName = file.name.replace(/\.heic$/i, '.png').replace(/\.heif$/i, '.png');
            finalFile = new File([blob], newName, { type: 'image/png' });
          } else {
            throw new Error('HEIC decoder not available in this environment');
          }
        } catch (err) {
          console.error('HEIC conversion failed for file:', file.name, err);
        }
      }

      const previewUrl = URL.createObjectURL(finalFile);

      let dimensions: { width: number; height: number } | null = null;
      try {
        const img = await loadImage(finalFile);
        dimensions = { width: img.naturalWidth, height: img.naturalHeight };
      } catch (err) {
        console.error('Error reading dimensions for file:', finalFile.name, err);
      }

      return {
        id,
        file: finalFile,
        name: finalFile.name,
        size: finalFile.size,
        dimensions,
        previewUrl,
        status: 'pending'
      };
    });

    const newPhotos = await Promise.all(newPhotosPromises);
    setPhotos((prev) => [...prev, ...newPhotos]);
    setZipBlob(null); // Reset ZIP when new files are added
  }, []);

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
        if (target.processedUrl) URL.revokeObjectURL(target.processedUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
    processedBlobsRef.current.delete(id);
    setZipBlob(null);
  }, []);

  const clearAll = useCallback(() => {
    isCancelledRef.current = true;
    setIsProcessing(false);
    photos.forEach((photo) => {
      URL.revokeObjectURL(photo.previewUrl);
      if (photo.processedUrl) URL.revokeObjectURL(photo.processedUrl);
    });
    setPhotos([]);
    processedBlobsRef.current.clear();
    setZipBlob(null);
  }, [photos]);

  const processImages = useCallback(async () => {
    if (!logoFile || photos.length === 0 || isProcessing) return;

    setIsProcessing(true);
    isCancelledRef.current = false;
    setZipBlob(null);

    // Reset processed states for any completed or failed items
    setPhotos((prev) =>
      prev.map((photo) => {
        if (photo.processedUrl) URL.revokeObjectURL(photo.processedUrl);
        return {
          ...photo,
          status: 'pending',
          errorMessage: undefined,
          processedUrl: undefined
        };
      })
    );
    processedBlobsRef.current.clear();

    const pendingPhotos = [...photos];
    let activeProcesses = 0;
    let nextIndex = 0;

    return new Promise<void>((resolve) => {
      const runNext = async () => {
        if (isCancelledRef.current) {
          resolve();
          return;
        }

        // If no more items and no active processes, we are done
        if (nextIndex >= pendingPhotos.length && activeProcesses === 0) {
          setIsProcessing(false);
          resolve();
          return;
        }

        // Fill up to concurrency limit
        while (activeProcesses < CONCURRENCY_LIMIT && nextIndex < pendingPhotos.length) {
          const currentPhoto = pendingPhotos[nextIndex];
          nextIndex++;
          activeProcesses++;

          // Update state to processing
          setPhotos((prev) =>
            prev.map((p) => (p.id === currentPhoto.id ? { ...p, status: 'processing' } : p))
          );

          // Execute processing
          (async () => {
            try {
              const processedBlob = await processSingleImage(
                currentPhoto.file,
                logoFile,
                logoSettings
              );

              if (isCancelledRef.current) return;

              // Store blob for ZIP construction
              processedBlobsRef.current.set(currentPhoto.id, processedBlob);

              // Generate preview URL for this processed photo
              const processedUrl = URL.createObjectURL(processedBlob);

              setPhotos((prev) =>
                prev.map((p) =>
                  p.id === currentPhoto.id
                    ? { ...p, status: 'completed', processedUrl }
                    : p
                )
              );
            } catch (err: unknown) {
              const error = err instanceof Error ? err : new Error('Processing failed');
              console.error('Error processing image:', currentPhoto.name, error);
              if (isCancelledRef.current) return;

              setPhotos((prev) =>
                prev.map((p) =>
                  p.id === currentPhoto.id
                    ? { ...p, status: 'failed', errorMessage: error.message }
                    : p
                )
              );
            } finally {
              activeProcesses--;
              // Yield thread slightly to maintain browser responsiveness
              setTimeout(runNext, 0);
            }
          })();
        }
      };

      runNext();
    });
  }, [logoFile, photos, logoSettings, isProcessing]);

  // Generate and download ZIP file
  const downloadZip = useCallback(async () => {
    if (processedBlobsRef.current.size === 0) return;

    const zip = new JSZip();

    photos.forEach((photo) => {
      const blob = processedBlobsRef.current.get(photo.id);
      if (blob && photo.status === 'completed') {
        // Naming pattern: original-name_branded.extension
        const dotIndex = photo.name.lastIndexOf('.');
        let baseName = photo.name;
        let ext = '';
        if (dotIndex !== -1) {
          baseName = photo.name.substring(0, dotIndex);
          ext = photo.name.substring(dotIndex); // includes the dot
        }
        const brandedName = `${baseName}_branded${ext}`;
        zip.file(brandedName, blob);
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    setZipBlob(content);

    // Trigger browser download
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'branded_photos.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [photos]);

  const processedCount = photos.filter((p) => p.status === 'completed').length;
  const failedCount = photos.filter((p) => p.status === 'failed').length;
  const totalCount = photos.length;

  return {
    logoFile,
    logoUrl,
    logoSettings,
    setLogoSettings,
    photos,
    isProcessing,
    processedCount,
    failedCount,
    totalCount,
    zipBlob,
    handleLogoUpload,
    handleRemoveLogo,
    addPhotos,
    removePhoto,
    clearAll,
    processImages,
    downloadZip
  };
};
