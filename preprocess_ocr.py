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

def preprocess_image(image_path, out_path, contrast_factor=2.0, sharpness_factor=2.0, threshold=128):
    with Image.open(image_path) as img:
        # Convert to grayscale
        gray = img.convert('L')
        
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(gray)
        enhanced = enhancer.enhance(contrast_factor)
        
        # Enhance sharpness
        sharp = ImageEnhance.Sharpness(enhanced)
        sharpened = sharp.enhance(sharpness_factor)
        
        # Optional: Thresholding (binarization)
        if threshold is not None:
            binarized = sharpened.point(lambda p: 255 if p > threshold else 0)
            binarized.save(out_path, "JPEG")
        else:
            sharpened.save(out_path, "JPEG")

async def test_preprocess_ocr(image_name, label):
    scratch_dir = r"C:\Users\renas\.gemini\antigravity\scratch"
    os.makedirs(scratch_dir, exist_ok=True)
    out_img = os.path.join(scratch_dir, f"preprocessed_{label}.jpg")
    
    # Preprocess (high contrast, sharpened, but no thresholding first)
    preprocess_image(image_name, out_img, contrast_factor=2.5, sharpness_factor=3.0, threshold=None)
    result1 = await perform_ocr(out_img)
    
    # Preprocess with thresholding
    out_img_bin = os.path.join(scratch_dir, f"preprocessed_bin_{label}.jpg")
    preprocess_image(image_name, out_img_bin, contrast_factor=2.5, sharpness_factor=3.0, threshold=140)
    result2 = await perform_ocr(out_img_bin)
    
    print(f"\n==================== PREPROCESSED: {image_name} ====================")
    print(f"--- Option 1 (Contrast/Sharpness) Text length: {len(result1.text) if result1 else 0} ---")
    if result1 and result1.text:
        print(result1.text[:300])
    
    print(f"\n--- Option 2 (Binarized) Text length: {len(result2.text) if result2 else 0} ---")
    if result2 and result2.text:
        print(result2.text[:300])
        
    # Search for keywords
    for r, opt in [(result1, "Option 1"), (result2, "Option 2")]:
        if r:
            text_lower = r.text.lower()
            print(f"\nKeyword search in {opt}:")
            for kw in ["hinfahrt", "rückfahrt", "behandlungs", "mühlen", "datteln"]:
                print(f"  '{kw}': {'FOUND' if kw in text_lower else 'NOT FOUND'}")

async def main():
    await test_preprocess_ocr("23.jpeg", "23")
    await test_preprocess_ocr("WhatsApp Image 2026-06-01 at 22.28.01.jpeg", "wa")

if __name__ == "__main__":
    asyncio.run(main())
