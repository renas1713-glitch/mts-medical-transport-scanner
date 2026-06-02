import os
import numpy as np
from PIL import Image

def analyze_full_image():
    img_name = "23.jpeg"
    if not os.path.exists(img_name):
        print("Image 23.jpeg not found")
        return
        
    with Image.open(img_name) as img:
        w, h = img.size
        print(f"Image dimensions: {w}x{h}")
        
        # Convert to grayscale
        gray = img.convert('L')
        arr = np.array(gray)
        
        # Statistics for the entire image
        print(f"Full Image Stats:")
        print(f"  Mean value: {np.mean(arr):.2f}")
        print(f"  Standard Deviation: {np.std(arr):.2f}")
        
        # Statistics for 4 quadrants
        quadrants = {
            "Top-Left (Patient Box)": (0, 0, w//2, h//2),
            "Top-Right (Title/Checkboxes)": (w//2, 0, w, h//2),
            "Bottom-Left": (0, h//2, w//2, h),
            "Bottom-Right": (w//2, h//2, w, h)
        }
        
        for name, box in quadrants.items():
            cropped = gray.crop(box)
            c_arr = np.array(cropped)
            dark_pixels = np.sum(c_arr < 200)
            total_pixels = c_arr.size
            dark_ratio = dark_pixels / total_pixels
            print(f"{name} Stats:")
            print(f"  Mean: {np.mean(c_arr):.2f} | Std: {np.std(c_arr):.2f}")
            print(f"  Dark pixel ratio (<200): {dark_ratio:.2%}")

if __name__ == "__main__":
    analyze_full_image()
