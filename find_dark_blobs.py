import os
import numpy as np
from PIL import Image

def find_blobs(img_path, crop_box, threshold=95, min_size=5):
    with Image.open(img_path) as img:
        cropped = img.crop(crop_box)
        gray = cropped.convert('L')
        arr = np.array(gray)
        
    # Binarize: True for dark pixels (ink), False for light (paper)
    binary = arr < threshold
    
    # Simple labeling of connected components (4-connectivity)
    h, w = binary.shape
    visited = np.zeros_like(binary, dtype=bool)
    blobs = []
    
    for y in range(h):
        for x in range(w):
            if binary[y, x] and not visited[y, x]:
                # Start BFS/DFS for a new blob
                queue = [(y, x)]
                visited[y, x] = True
                min_y, max_y = y, y
                min_x, max_x = x, x
                pixel_count = 0
                
                while queue:
                    cy, cx = queue.pop(0)
                    pixel_count += 1
                    min_y = min(min_y, cy)
                    max_y = max(max_y, cy)
                    min_x = min(min_x, cx)
                    max_x = max(max_x, cx)
                    
                    # Check neighbors
                    for ny, nx in [(cy-1, cx), (cy+1, cx), (cy, cx-1), (cy, cx+1)]:
                        if 0 <= ny < h and 0 <= nx < w:
                            if binary[ny, nx] and not visited[ny, nx]:
                                visited[ny, nx] = True
                                queue.append((ny, nx))
                                
                if pixel_count >= min_size:
                    # Translate coordinates back to original image
                    orig_x = crop_box[0] + min_x
                    orig_y = crop_box[1] + min_y
                    width = max_x - min_x + 1
                    height = max_y - min_y + 1
                    blobs.append({
                        "x": orig_x,
                        "y": orig_y,
                        "w": width,
                        "h": height,
                        "size": pixel_count
                    })
                    
    print(f"Found {len(blobs)} dark blobs in the region:")
    # Sort blobs by Y then X
    blobs.sort(key=lambda b: (b['y'], b['x']))
    for i, b in enumerate(blobs[:50]): # Limit to first 50
        print(f"  Blob {i:2d} | [X:{b['x']:4d}, Y:{b['y']:4d}, W:{b['w']:3d}, H:{b['h']:3d}] | Size: {b['size']:4d} pixels")
    if len(blobs) > 50:
        print(f"  ... and {len(blobs) - 50} more blobs.")

def main():
    img_name = "23.jpeg"
    if not os.path.exists(img_name):
        print("Image not found")
        return
        
    crop_box = (600, 300, 1050, 560)
    print("Analyzing blobs at threshold 95 (strong dark ink)...")
    find_blobs(img_name, crop_box, threshold=95, min_size=10)
    
    print("\nAnalyzing blobs at threshold 120 (including lighter print/faint ink)...")
    find_blobs(img_name, crop_box, threshold=120, min_size=10)

if __name__ == "__main__":
    main()
