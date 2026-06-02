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

async def main():
    img_name = "23.jpeg"
    if not os.path.exists(img_name):
        print("Image 23.jpeg not found")
        return

    crop_box = (600, 320, 1150, 520)
    
    scratch_dir = r"C:\Users\renas\.gemini\antigravity\scratch"
    os.makedirs(scratch_dir, exist_ok=True)
    
    cropped_path = os.path.join(scratch_dir, "crop_checkboxes.jpg")
    inverted_path = os.path.join(scratch_dir, "crop_checkboxes_inverted.jpg")
    
    with Image.open(img_name) as img:
        cropped = img.crop(crop_box)
        cropped.save(cropped_path, "JPEG")
        
        # Invert the cropped image
        inverted = ImageOps.invert(cropped.convert('RGB'))
        inverted.save(inverted_path, "JPEG")
        print(f"Saved inverted image to: {inverted_path}")
        
    result_norm = await perform_ocr(cropped_path)
    result_inv = await perform_ocr(inverted_path)
    
    print("\n--- Normal Crop OCR ---")
    print(result_norm.text if result_norm else "None")
    
    print("\n--- Inverted Crop OCR ---")
    print(result_inv.text if result_inv else "None")

if __name__ == "__main__":
    asyncio.run(main())
