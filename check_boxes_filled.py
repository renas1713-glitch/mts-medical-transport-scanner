import os
import numpy as np
from PIL import Image

def analyze_box(img_arr, box_coords, label, threshold=105):
    x1, y1, x2, y2 = box_coords
    
    # Extract the box region
    box_region = img_arr[y1:y2, x1:x2]
    
    # Calculate inner box coordinates (exclude borders - about 20% margin on each side)
    w = x2 - x1
    h = y2 - y1
    mx = int(w * 0.20)
    my = int(h * 0.20)
    
    inner_region = box_region[my : h - my, mx : w - mx]
    
    # Count dark pixels in the inner region
    dark_pixels = np.sum(inner_region < threshold)
    total_pixels = inner_region.size
    dark_ratio = dark_pixels / total_pixels
    
    print(f"Checkbox: {label}")
    print(f"  Outer Box: [{x1}, {y1}, {x2}, {y2}] | Inner Box size: {inner_region.shape[1]}x{inner_region.shape[0]}")
    print(f"  Dark pixels (< {threshold}): {dark_pixels} / {total_pixels} ({dark_ratio:.2%})")
    
    # Threshold for checked box (usually > 8%)
    is_checked = dark_ratio > 0.08
    print(f"  Status: {'CHECKED [X]' if is_checked else 'EMPTY [ ]'}")
    return is_checked

def main():
    img_name = "23.jpeg"
    if not os.path.exists(img_name):
        print("Image 23.jpeg not found")
        return
        
    with Image.open(img_name) as img:
        gray = img.convert('L')
        arr = np.array(gray)
        
    # Coordinates of Box A (Hinfahrt) and Box B (Rückfahrt) based on blob detection
    hinfahrt_box = (693, 344, 727, 379)
    rueckfahrt_box = (696, 393, 729, 428)
    
    print("Analyzing checkboxes in 23.jpeg:")
    analyze_box(arr, hinfahrt_box, "Hinfahrt", threshold=105)
    analyze_box(arr, rueckfahrt_box, "Rückfahrt", threshold=105)

if __name__ == "__main__":
    main()
