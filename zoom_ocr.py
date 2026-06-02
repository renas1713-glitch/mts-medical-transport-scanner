import asyncio
import os
from PIL import Image, ImageEnhance, ImageOps
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

async def main():
    img_name = "23.jpeg"
    if not os.path.exists(img_name):
        print("Image not found")
        return
        
    crop_box = (700, 320, 950, 450)
    
    scratch_dir = r"C:\Users\renas\.gemini\antigravity\scratch"
    os.makedirs(scratch_dir, exist_ok=True)
    zoomed_path = os.path.join(scratch_dir, "crop_zoomed.jpg")
    
    with Image.open(img_name) as img:
        cropped = img.crop(crop_box)
        gray = cropped.convert('L')
        
        # Resize to 3x using Lanczos
        w, h = gray.size
        zoomed = gray.resize((w * 3, h * 3), Image.Resampling.LANCZOS)
        
        # Apply autocontrast
        norm = ImageOps.autocontrast(zoomed, cutoff=1)
        
        # Enhance contrast further
        enh = ImageEnhance.Contrast(norm)
        enhanced = enh.enhance(2.0)
        
        enhanced.save(zoomed_path, "JPEG")
        print(f"Saved zoomed and enhanced crop to: {zoomed_path}")
        
    result = await perform_ocr(zoomed_path)
    if result:
        print("\n--- Zoomed OCR Text ---")
        print(result.text if result.text else "None")
        print("--- Detailed lines ---")
        for i, line in enumerate(result.lines):
            print(f"Line {i}: {line.text}")
            for word in line.words:
                print(f"  Word: {word.text} at [{word.bounding_rect.x}, {word.bounding_rect.y}]")

if __name__ == "__main__":
    asyncio.run(main())
