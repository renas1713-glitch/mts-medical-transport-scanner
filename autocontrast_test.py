import asyncio
import os
from PIL import Image, ImageOps
from winrt.windows.media.ocr import OcrEngine
from winrt.windows.graphics.imaging import BitmapDecoder
from winrt.windows.storage import StorageFile, FileAccessMode
from winrt.windows.globalization import Language

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

def preprocess_autocontrast(image_path, out_path, mode="autocontrast"):
    with Image.open(image_path) as img:
        gray = img.convert('L')
        if mode == "autocontrast":
            # Cut off 1% of the lightest and darkest pixels for better stretching
            stretched = ImageOps.autocontrast(gray, cutoff=1)
        elif mode == "equalize":
            stretched = ImageOps.equalize(gray)
        else:
            stretched = gray
            
        stretched.save(out_path, "JPEG")
        
        # Analyze new pixel values
        import numpy as np
        arr = np.array(stretched)
        print(f"[{mode.upper()}] Mean: {np.mean(arr):.1f} | Std: {np.std(arr):.1f} | Min/Max: {np.min(arr)}/{np.max(arr)}")

async def run_test_for_image(img_name, label):
    scratch_dir = r"C:\Users\renas\.gemini\antigravity\scratch"
    os.makedirs(scratch_dir, exist_ok=True)
    
    for mode in ["autocontrast", "equalize"]:
        out_path = os.path.join(scratch_dir, f"{label}_{mode}.jpg")
        preprocess_autocontrast(img_name, out_path, mode=mode)
        
        result = await perform_ocr(out_path)
        print(f"  OCR Text Length for {mode}: {len(result.text) if result else 0}")
        if result and result.text:
            text_lower = result.text.lower()
            print("  Keyword Check:")
            for kw in ["hinfahrt", "rückfahrt", "behandlungs", "mühlen", "datteln"]:
                print(f"    '{kw}': {'FOUND' if kw in text_lower else 'NOT FOUND'}")
                
            # Print first 200 chars of text
            print(f"  Preview: {result.text.replace('\n', ' | ')[:200]}...")

async def main():
    print("=== Testing 23.jpeg ===")
    await run_test_for_image("23.jpeg", "23")
    print("\n=== Testing WhatsApp Image ===")
    await run_test_for_image("WhatsApp Image 2026-06-01 at 22.28.01.jpeg", "wa")

if __name__ == "__main__":
    asyncio.run(main())
