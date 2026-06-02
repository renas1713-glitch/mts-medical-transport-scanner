import os
import numpy as np
from PIL import Image, ImageOps

def generate_ascii_art(img_path, out_width=110, threshold=90):
    if not os.path.exists(img_path):
        print("Image not found")
        return
        
    with Image.open(img_path) as img:
        gray = img.convert('L')
        w, h = gray.size
        aspect_ratio = h / w
        out_height = int(out_width * aspect_ratio * 0.55)
        resized = gray.resize((out_width, out_height), Image.Resampling.BILINEAR)
        arr = np.array(resized)
        
        print(f"\n--- ASCII Art with Threshold {threshold} ---")
        for row in arr:
            line_chars = []
            for val in row:
                if val < threshold:
                    line_chars.append('#')
                else:
                    line_chars.append(' ')
            print("".join(line_chars))
        print("--------------------------------------------\n")

def main():
    img_name = "23.jpeg"
    if not os.path.exists(img_name):
        print("Image 23.jpeg not found")
        return

    crop_box = (700, 320, 1150, 560)
    
    scratch_dir = r"C:\Users\renas\.gemini\antigravity\scratch"
    os.makedirs(scratch_dir, exist_ok=True)
    cropped_path = os.path.join(scratch_dir, "crop_ascii_raw.jpg")
    
    with Image.open(img_name) as img:
        cropped = img.crop(crop_box)
        gray = cropped.convert('L')
        gray.save(cropped_path, "JPEG")
        
    # Test thresholds 75, 85, and 95 on raw grayscale (no autocontrast)
    for t in [75, 85, 95]:
        generate_ascii_art(cropped_path, out_width=110, threshold=t)

if __name__ == "__main__":
    main()
