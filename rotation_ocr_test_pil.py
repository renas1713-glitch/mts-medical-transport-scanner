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
        if not engine:
            engine = OcrEngine.try_create_from_user_profile_languages()
            
        result = await engine.recognize_async(bitmap)
        return result.text
    except Exception as e:
        return f"Error: {e}"

async def main():
    images = [
        "23.jpeg",
        "WhatsApp Image 2026-06-01 at 22.28.01.jpeg"
    ]
    
    scratch_dir = r"C:\Users\renas\.gemini\antigravity\scratch"
    os.makedirs(scratch_dir, exist_ok=True)
    temp_path = os.path.join(scratch_dir, "temp_rot.jpg")
    
    for img_name in images:
        print(f"\n==================== {img_name} ====================")
        if not os.path.exists(img_name):
            print("Image not found")
            continue
            
        for deg in [0, 90, 180, 270]:
            # Rotate image with PIL
            with Image.open(img_name) as img:
                if deg == 90:
                    rotated = img.rotate(270, expand=True) # PIL rotates counter-clockwise, so 270 is 90 clockwise
                elif deg == 180:
                    rotated = img.rotate(180, expand=True)
                elif deg == 270:
                    rotated = img.rotate(90, expand=True)
                else:
                    rotated = img.copy()
                rotated.save(temp_path, "JPEG")
                
            text = await perform_ocr(temp_path)
            
            # Clean up temp file
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception:
                    pass
                    
            preview = text.replace('\n', ' | ')[:150]
            print(f"Rotation {deg:3d}° | Words: {len(text.split())} | Preview: {preview}...")

if __name__ == "__main__":
    asyncio.run(main())
