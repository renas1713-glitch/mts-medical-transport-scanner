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

async def test_channel(channel_img, name, label):
    scratch_dir = r"C:\Users\renas\.gemini\antigravity\scratch"
    os.makedirs(scratch_dir, exist_ok=True)
    out_path = os.path.join(scratch_dir, f"{label}_{name}.jpg")
    
    # Apply autocontrast to the channel image
    norm = ImageOps.autocontrast(channel_img, cutoff=1)
    norm.save(out_path, "JPEG")
    
    result = await perform_ocr(out_path)
    print(f"\n--- Channel {name} OCR (Length: {len(result.text) if result else 0}) ---")
    if result:
        text_lower = result.text.lower()
        print("Keyword check:")
        for kw in ["hinfahrt", "rückfahrt", "behandlungs", "mühlen", "datteln"]:
            print(f"  '{kw}': {'FOUND' if kw in text_lower else 'NOT FOUND'}")
        
        # Check if the words are found and print the lines containing them
        for i, line in enumerate(result.lines):
            line_lower = line.text.lower()
            if any(kw in line_lower for kw in ["hinfahrt", "rückfahrt", "hin-", "rück-"]):
                print(f"  Found target line {i}: {line.text}")

async def main():
    img_name = "23.jpeg"
    if not os.path.exists(img_name):
        print("Image not found")
        return
        
    with Image.open(img_name) as img:
        if img.mode != 'RGB':
            img = img.convert('RGB')
        r, g, b = img.split()
        
    print("Testing color channels on 23.jpeg...")
    await test_channel(r, "red", "23")
    await test_channel(g, "green", "23")
    await test_channel(b, "blue", "23")

if __name__ == "__main__":
    asyncio.run(main())
