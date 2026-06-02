import asyncio
import os
import sys
from winrt.windows.media.ocr import OcrEngine
from winrt.windows.graphics.imaging import BitmapDecoder
from winrt.windows.storage import StorageFile, FileAccessMode
from winrt.windows.globalization import Language

async def perform_ocr(image_path):
    abs_path = os.path.abspath(image_path)
    if not os.path.exists(abs_path):
        print(f"File not found: {abs_path}")
        return None

    print(f"\nProcessing: {os.path.basename(abs_path)}")
    try:
        # Load image via WinRT StorageFile
        file = await StorageFile.get_file_from_path_async(abs_path)
        stream = await file.open_async(FileAccessMode.READ)
        decoder = await BitmapDecoder.create_async(stream)
        bitmap = await decoder.get_software_bitmap_async()

        # Create OCR engine for German
        lang = Language("de-DE")
        engine = OcrEngine.try_create_from_language(lang)
        if not engine:
            print("Could not create German OCR Engine, falling back to default")
            engine = OcrEngine.try_create_from_user_profile_languages()
            
        if not engine:
            print("Failed to initialize any OCR Engine.")
            return None

        # Recognize text
        result = await engine.recognize_async(bitmap)
        return result
    except Exception as e:
        print(f"Error during OCR processing: {e}")
        return None

def analyze_result(result):
    if not result:
        return

    print("\n--- Full Extracted Text ---")
    print(result.text)
    print("---------------------------\n")

    print("--- Line-by-Line with Bounding Boxes ---")
    for i, line in enumerate(result.lines):
        # Calculate line bounding box based on words
        if len(line.words) > 0:
            xs = [w.bounding_rect.x for w in line.words]
            ys = [w.bounding_rect.y for w in line.words]
            ws = [w.bounding_rect.width for w in line.words]
            hs = [w.bounding_rect.height for w in line.words]
            
            # Simple approximation of bounding box for the line
            x = min(xs)
            y = min(ys)
            r = max(xs[j] + ws[j] for j in range(len(xs)))
            b = max(ys[j] + hs[j] for j in range(len(ys)))
            width = r - x
            height = b - y
            
            print(f"Line {i:2d} | [X:{x:4.0f}, Y:{y:4.0f}, W:{width:4.0f}, H:{height:4.0f}] | {line.text}")
        else:
            print(f"Line {i:2d} | [No words] | {line.text}")
    print("----------------------------------------\n")

async def main():
    images = [
        "23.jpeg",
        "WhatsApp Image 2026-06-01 at 22.28.01.jpeg"
    ]
    
    for img in images:
        result = await perform_ocr(img)
        analyze_result(result)

if __name__ == "__main__":
    asyncio.run(main())
