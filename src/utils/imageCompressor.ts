// src/utils/imageCompressor.ts
// Client-side automatic image compression and downscaling to avoid 413 (Content Too Large) errors

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeBytes?: number;
  mimeType?: 'image/jpeg' | 'image/webp';
}

export interface CompressResult {
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  width: number;
  height: number;
}

/**
 * Estimates the byte size of a base64 Data URL string
 */
export function getDataUrlSizeBytes(dataUrl: string): number {
  if (!dataUrl) return 0;
  const base64Index = dataUrl.indexOf(';base64,');
  if (base64Index === -1) return dataUrl.length;
  const base64String = dataUrl.substring(base64Index + 8);
  // Each base64 char is 6 bits -> 4 chars = 3 bytes
  const padding = base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.round((base64String.length * 3) / 4) - padding);
}

/**
 * Formats bytes to human-readable string (e.g. 142 KB, 1.2 MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Compresses an image given its base64 Data URL or Object URL.
 */
export async function compressImageDataUrl(
  sourceUrl: string,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82,
    maxSizeBytes = 700 * 1024, // 700 KB target maximum
    mimeType = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const originalSizeBytes = getDataUrlSizeBytes(sourceUrl);
    const img = new Image();

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          return reject(new Error('Unable to read image dimensions'));
        }

        // Calculate proportional dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas 2D context not available'));
        }

        // Fill white background for transparent PNGs converted to JPEG
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        let currentQuality = quality;
        let dataUrl = canvas.toDataURL(mimeType, currentQuality);
        let compressedSize = getDataUrlSizeBytes(dataUrl);

        // Adaptive step: if still exceeds max target size, lower quality
        let attempts = 0;
        while (compressedSize > maxSizeBytes && currentQuality > 0.4 && attempts < 4) {
          currentQuality -= 0.12;
          dataUrl = canvas.toDataURL(mimeType, currentQuality);
          compressedSize = getDataUrlSizeBytes(dataUrl);
          attempts++;
        }

        resolve({
          dataUrl,
          originalSizeBytes,
          compressedSizeBytes: compressedSize,
          width,
          height,
        });
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Image compression failed'));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    img.src = sourceUrl;
  });
}

/**
 * Automatically compresses and resizes an image File using HTML Canvas.
 * Safely converts multi-megabyte camera photos into ~100KB-300KB web-optimized images.
 */
export async function compressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<CompressResult> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Selected file is not an image');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const result = await compressImageDataUrl(objectUrl, options);
    return {
      ...result,
      originalSizeBytes: file.size,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
