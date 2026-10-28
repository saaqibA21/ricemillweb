import os
import glob
import shutil
import cv2
import numpy as np

def main():
    images_dir = 'images'
    backup_dir = 'images_backup'
    os.makedirs(backup_dir, exist_ok=True)
    
    # Load exact mask and alpha map
    mask = cv2.imread('star_mask_clean.png', cv2.IMREAD_GRAYSCALE) > 0
    alpha = cv2.imread('alpha_exact.png', cv2.IMREAD_GRAYSCALE).astype(np.float32) / 255.0
    scale = 0.30
    a = alpha * scale
    a3 = np.expand_dims(a, axis=2)
    
    image_files = sorted(glob.glob(os.path.join(images_dir, '*.jpeg')) + glob.glob(os.path.join(images_dir, '*.jpg')))
    print(f'Found {len(image_files)} images to process.')
    
    for img_path in image_files:
        filename = os.path.basename(img_path)
        backup_path = os.path.join(backup_dir, filename)
        
        # 1. Backup original
        if not os.path.exists(backup_path):
            shutil.copy2(img_path, backup_path)
            
        # 2. Read image
        img = cv2.imread(img_path)
        if img is None:
            print(f'Failed to read {img_path}')
            continue
            
        h, w, _ = img.shape
        if h != 1200 or w != 896:
            print(f'Warning: {filename} has unexpected shape {w}x{h}')
            continue
            
        # Target watermark box: y: 1050..1120, x: 746..816
        star_roi = img[1050:1120, 746:816].astype(np.float32)
        
        # Reverse alpha blend: (I - alpha * 255) / (1 - alpha)
        restored = (star_roi - a3 * 255.0) / np.maximum(1.0 - a3, 0.01)
        restored = np.clip(restored, 0, 255).astype(np.uint8)
        
        # Apply within mask
        patched_roi = img[1050:1120, 746:816].copy()
        for ch in range(3):
            patched_roi[:, :, ch] = np.where(mask, restored[:, :, ch], patched_roi[:, :, ch])
            
        img[1050:1120, 746:816] = patched_roi
        
        # Save back with high quality (98)
        cv2.imwrite(img_path, img, [cv2.IMWRITE_JPEG_QUALITY, 98])
        print(f'Processed & watermark removed: {filename}')
        
    print('\nAll images successfully processed!')

if __name__ == '__main__':
    main()
