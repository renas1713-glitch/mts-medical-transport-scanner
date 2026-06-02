import asyncio
import os
import numpy as np
from PIL import Image
from winrt.windows.media.ocr import OcrEngine
from winrt.windows.graphics.imaging import BitmapDecoder
from winrt.windows.storage import StorageFile, FileAccessMode
from winrt.windows.globalization import Language

def adaptive_threshold(img_path, out_path, block_size=41, c=15):
    with Image.open(img_path) as img:
        gray = img.convert('L')
        arr = np.array(gray, dtype=np.float32)
        
    h, w = arr.shape
    # Pad array to handle borders
    half_b = block_size // 2
    padded = np.pad(arr, half_b, mode='reflect')
    
    # Compute 2D box filter (moving average) using integral image
    # For speed and simplicity, we can use integral image
    integral = np.cumsum(np.cumsum(padded, axis=0), axis=1)
    
    # Extract the sums for each window
    # Window coords in padded array:
    # row from i to i + block_size
    # col from j to j + block_size
    # The sum is integral[i+b, j+b] - integral[i, j+b] - integral[i+b, j] + integral[i, j]
    y_indices = np.arange(h)
    x_indices = np.arange(w)
    
    y1 = y_indices
    y2 = y_indices + block_size
    x1 = x_indices
    x2 = x_indices + block_size
    
    # We can do this with vectorization or a simple loop since the image is 1200x1600
    # Let's use a fast numpy implementation using uniform filter if scipy is available,
    # or just write a simple and correct numpy box filter.
    # Actually, we can use a simple trick: Box blur via PIL.Image.filter!
    # Yes! PIL has ImageFilter.BoxBlur! It is extremely fast and written in C.
    return PIL_box_blur_adaptive(img_path, out_path, radius=block_size//2, c=c)

def PIL_box_blur_adaptive(img_path, out_path, radius=15, c=10):
    from PIL import ImageFilter
    with Image.open(img_path) as img:
        gray = img.convert('L')
        # Apply BoxBlur to get local background mean
        local_mean = gray.filter(ImageFilter.BoxBlur(radius))
        
        # Convert both to numpy arrays
        arr_orig = np.array(gray, dtype=np.int16)
        arr_mean = np.array(local_mean, dtype=np.int16)
        
        # Adaptive thresholding: if pixel < local_mean - c, it is dark (0), else light (255)
        # Note: we want dark text on white background
        binarized = np.where(arr_orig < (arr_mean - c), 0, 255).astype(np.uint8)
        
        result_img = Image.fromarray(binarized)
        result_img.save(out_path, "JPEG")
        print(f"Saved adaptive threshold image to: {out_path}")

async def perform_ocr(image_path):
    abs_path = os.path.abspath(image_path)
    try:
        file = await StorageFile.get_file_from_path_async(abs_path)
        stream = await file.open_async(FileAccessMode.READ)
        decoder = await BitmapDecoder.create_async(stream)
        bitmap = await decoder.get_software_bitmap_async()

        lang = Language("de-DE")
        engine = OcrEngine.try_create_from_language(lang)
        result = await engine.recognize_async(bitmap)
        return result
    except Exception as e:
        print(f"Error in OCR: {e}")
        return None

async def main():
    img_name = "23.jpeg"
    if not os.path.exists(img_name):
        print("Image 23.jpeg not found")
        return
        
    scratch_dir = r"C:\Users\renas\.gemini\antigravity\scratch"
    os.makedirs(scratch_dir, exist_ok=True)
    out_path = os.path.join(scratch_dir, "23_adaptive.jpg")
    
    # Run adaptive thresholding with a radius of 25 pixels and constant of 12
    PIL_box_blur_adaptive(img_name, out_path, radius=25, c=12)
    
    # Run OCR on the adaptive thresholded image
    result = await perform_ocr(out_path)
    if result:
        print(f"\n--- Adaptive Threshold OCR Text Length: {len(result.text)} ---")
        # Check keywords
        text_lower = result.text.lower()
        print("Keyword Check:")
        for kw in ["hinfahrt", "rückfahrt", "behandlungs", "mühlen", "datteln"]:
            print(f"  '{kw}': {'FOUND' if kw in text_lower else 'NOT FOUND'}")
            
        print("\n--- Detailed OCR lines for 23_adaptive.jpg ---")
        for i, line in enumerate(result.lines):
            print(f"Line {i:2d}: {line.text}")

if __name__ == "__main__":
    asyncio.run(main())
