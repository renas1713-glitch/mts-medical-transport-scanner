import os
import numpy as np
from PIL import Image, ImageOps

def generate_high_res_ascii(img_path, crop_box, out_width=120, threshold=128):
    with Image.open(img_path) as img:
        cropped = img.crop(crop_box)
        gray = cropped.convert('L')
        
        # Apply autocontrast to make the text stand out
        normalized = ImageOps.autocontrast(gray, cutoff=1)
        
        w, h = normalized.size
        aspect_ratio = h / w
        out_height = int(out_width * aspect_ratio * 0.5)
        
        resized = normalized.resize((out_width, out_height), Image.Resampling.BILINEAR)
        arr = np.array(resized)
        
        print(f"\n--- Zoomed ASCII Art of Region {crop_box} ---")
        for row in arr:
            line_chars = []
            for val in row:
                if val < threshold:
                    line_chars.append('#')
                else:
                    line_chars.append(' ')
            print("".join(line_chars))
        print("----------------------------------------------------\n")

def main():
    img_name = "23.jpeg"
    if not os.path.exists(img_name):
        print("Image not found")
        return
        
    # Crop the exact region below the title where checkboxes should be:
    # X: 700 to 950 (width 250), Y: 320 to 420 (height 100)
    crop_box = (700, 320, 950, 420)
    generate_high_res_ascii(img_name, crop_box, out_width=120, threshold=120)

if __name__ == "__main__":
    main()
