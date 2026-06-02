import asyncio
import os
from PIL import Image
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
        print("Image 23.jpeg not found")
        return

    # Define crop region for the top-right section (Title + Checkboxes)
    # The heading is at X: 710, Y: 276. Let's crop X: 600 to 1200, Y: 200 to 500
    crop_box = (600, 200, 1200, 500)
    
    scratch_dir = r"C:\Users\renas\.gemini\antigravity\scratch"
    os.makedirs(scratch_dir, exist_ok=True)
    cropped_path = os.path.join(scratch_dir, "crop_top_right.jpg")
    
    with Image.open(img_name) as img:
        cropped = img.crop(crop_box)
        cropped.save(cropped_path, "JPEG")
        print(f"Saved cropped image to: {cropped_path}")
        
    result = await perform_ocr(cropped_path)
    if result:
        print("\n--- Cropped OCR Text ---")
        print(result.text)
        print("--- Detailed lines ---")
        for i, line in enumerate(result.lines):
            print(f"Line {i}: {line.text}")
            
if __name__ == "__main__":
    asyncio.run(main())
