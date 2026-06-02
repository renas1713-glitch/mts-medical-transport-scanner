import os
import numpy as np
from PIL import Image

def analyze_checkbox_region():
    img_name = "23.jpeg"
    if not os.path.exists(img_name):
        print("Image 23.jpeg not found")
        return
        
    crop_box = (600, 320, 1150, 520)
    
    scratch_dir = r"C:\Users\renas\.gemini\antigravity\scratch"
    os.makedirs(scratch_dir, exist_ok=True)
    cropped_path = os.path.join(scratch_dir, "crop_checkboxes.jpg")
    
    with Image.open(img_name) as img:
        cropped = img.crop(crop_box)
        cropped.save(cropped_path, "JPEG")
        print(f"Saved cropped region to: {cropped_path}")
        
        # Convert to numpy array to analyze pixels
        arr = np.array(cropped.convert('L'))
        mean_val = np.mean(arr)
        std_val = np.std(arr)
        min_val = np.min(arr)
        max_val = np.max(arr)
        
        print(f"Pixel Statistics:")
        print(f"  Mean value: {mean_val:.2f} (0 is black, 255 is white)")
        print(f"  Standard Deviation: {std_val:.2f}")
        print(f"  Min value: {min_val}")
        print(f"  Max value: {max_val}")
        
        # Count dark pixels (less than 200, which indicates ink/lines)
        dark_pixels = np.sum(arr < 200)
        total_pixels = arr.size
        dark_ratio = dark_pixels / total_pixels
        print(f"  Dark pixel count (val < 200): {dark_pixels} / {total_pixels} ({dark_ratio:.2%})")

if __name__ == "__main__":
    analyze_checkbox_region()
