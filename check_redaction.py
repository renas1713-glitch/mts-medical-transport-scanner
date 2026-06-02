import os
import numpy as np
from PIL import Image

def check_redaction():
    img_name = "23.jpeg"
    if not os.path.exists(img_name):
        print("Image not found")
        return
        
    crop_box = (700, 320, 1150, 560)
    
    with Image.open(img_name) as img:
        cropped = img.crop(crop_box)
        gray = cropped.convert('L')
        arr = np.array(gray)
        
        print("Raw Pixel Values in the Checkbox Region:")
        print(f"  Min pixel value: {np.min(arr)}")
        print(f"  Max pixel value: {np.max(arr)}")
        print(f"  Mean pixel value: {np.mean(arr):.2f}")
        print(f"  Standard Deviation: {np.std(arr):.2f}")
        
        # Check if it's solid black
        unique_vals = len(np.unique(arr))
        print(f"  Number of unique pixel values: {unique_vals}")
        
        # Count pixels that are strictly less than 15 (very black)
        very_black_pixels = np.sum(arr < 15)
        print(f"  Pixels < 15: {very_black_pixels} out of {arr.size} ({very_black_pixels / arr.size:.2%})")
        
        # Print a small 10x10 sample of the center of this region
        h, w = arr.shape
        center_y, center_x = h // 2, w // 2
        print("\nCenter 10x10 pixel grid:")
        for row in arr[center_y - 5 : center_y + 5, center_x - 5 : center_x + 5]:
            print(" ".join(f"{val:3d}" for val in row))

if __name__ == "__main__":
    check_redaction()
