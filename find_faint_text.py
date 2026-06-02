import os
import numpy as np
from PIL import Image

def generate_ascii_art_str(img_path, crop_box, out_width=110, threshold=120):
    with Image.open(img_path) as img:
        cropped = img.crop(crop_box)
        gray = cropped.convert('L')
        w, h = gray.size
        aspect_ratio = h / w
        out_height = int(out_width * aspect_ratio * 0.5)
        resized = gray.resize((out_width, out_height), Image.Resampling.BILINEAR)
        arr = np.array(resized)
        
        lines = [f"--- ASCII Art with Threshold {threshold} ---"]
        for row in arr:
            line_chars = []
            for val in row:
                if val < threshold:
                    line_chars.append('#')
                else:
                    line_chars.append(' ')
            lines.append("".join(line_chars))
        lines.append("--------------------------------------------\n")
        return "\n".join(lines)

def main():
    img_name = "23.jpeg"
    if not os.path.exists(img_name):
        print("Image 23.jpeg not found")
        return

    # Checkbox region: X: 700 to 1050, Y: 320 to 560
    crop_box = (700, 320, 1050, 560)
    
    output_lines = []
    # Test thresholds from 110 to 150 in steps of 10
    for t in [110, 120, 130, 140, 150]:
        output_lines.append(generate_ascii_art_str(img_name, crop_box, out_width=110, threshold=t))
        
    scratch_dir = r"C:\Users\renas\.gemini\antigravity\scratch"
    os.makedirs(scratch_dir, exist_ok=True)
    out_file = os.path.join(scratch_dir, "ascii_thresholds.txt")
    
    with open(out_file, "w", encoding="utf-8") as f:
        f.write("\n".join(output_lines))
    print(f"Saved ASCII thresholds to: {out_file}")

if __name__ == "__main__":
    main()
