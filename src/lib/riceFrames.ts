// src/lib/riceFrames.ts
// Shared frame-sequence cache for the rice separation footage
// (public/assets/rice-frames/frame-001.jpg … frame-080.jpg). Both scroll
// sections on the homepage scrub through the same preloaded image set
// instead of each fetching and decoding their own copy.

export const RICE_FRAME_COUNT = 80;

const frameSrc = (i: number) => `/assets/rice-frames/frame-${String(i + 1).padStart(3, '0')}.jpg`;

let cachedFrames: HTMLImageElement[] | null = null;

export function getRiceFrames(): HTMLImageElement[] {
  if (!cachedFrames) {
    cachedFrames = Array.from({ length: RICE_FRAME_COUNT }, (_, i) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = frameSrc(i);
      return img;
    });
  }
  return cachedFrames;
}

// Draws the frame at `index` into the canvas with object-fit: cover
// behaviour, falling back to the nearest earlier loaded frame so scrubbing
// never flashes blank while later frames are still downloading.
// Returns true if a frame was actually drawn. Callers should only mark the
// index as "drawn" when this returns true, so a not-yet-loaded frame gets
// retried on the next tick instead of leaving the canvas stuck blank.
export function drawRiceFrame(
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  index: number,
  w: number,
  h: number
): boolean {
  let i = Math.min(images.length - 1, Math.max(0, index));
  while (i > 0 && !(images[i].complete && images[i].naturalWidth > 0)) i--;
  const img = images[i];
  if (!img.complete || img.naturalWidth === 0) return false;

  const ir = img.naturalWidth / img.naturalHeight;
  const cr = w / h;
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
  if (ir > cr) {
    sw = img.naturalHeight * cr;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / cr;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  return true;
}

export function frameIndexForProgress(p: number) {
  return Math.min(RICE_FRAME_COUNT - 1, Math.max(0, Math.round(p * (RICE_FRAME_COUNT - 1))));
}
