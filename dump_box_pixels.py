import os
import numpy as np
from PIL import Image

def dump_pixels(arr, coords, label):
    x1, y1, x2, y2 = coords
    print(f"\n=== Pixel Grid for {label} (Coords: {coords}) ===")
    region = arr[y1:y2, x1:x2]
    for row in region:
        print(" ".join(f"{val:3d}" for val in row))

def main():
    img_name = "23.jpeg"
    if not os.path.exists(img_name):
        print("Image not found")
        return
        
    with Image.open(img_name) as img:
        gray = img.convert('L')
        arr = np.array(gray)
        
    hinfahrt_box = (693, 344, 727, 379)
    rueckfahrt_box = (696, 393, 729, 428)
    
    dump_pixels(arr, hinfahrt_box, "Hinfahrt Box")
    dump_pixels(arr, rueckfahrt_box, "Rückfahrt Box")

if __name__ == "__main__":
    main()
