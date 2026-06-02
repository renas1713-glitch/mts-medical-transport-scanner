import os
import numpy as np
from PIL import Image

def check_zoomed():
    path = r"C:\Users\renas\.gemini\antigravity\scratch\crop_zoomed.jpg"
    if not os.path.exists(path):
        print("File not found")
        return
        
    with Image.open(path) as img:
        arr = np.array(img)
        print(f"Zoomed Image Dimensions: {img.size}")
        print(f"Mean: {np.mean(arr):.2f}")
        print(f"Std: {np.std(arr):.2f}")
        print(f"Min: {np.min(arr)} | Max: {np.max(arr)}")
        
        # Check dark vs light pixel counts
        dark = np.sum(arr < 128)
        light = np.sum(arr >= 128)
        print(f"Dark pixels (<128): {dark} ({dark/arr.size:.2%})")
        print(f"Light pixels (>=128): {light} ({light/arr.size:.2%})")

if __name__ == "__main__":
    check_zoomed()
