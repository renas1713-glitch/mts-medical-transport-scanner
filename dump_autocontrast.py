import asyncio
import os
from winrt.windows.media.ocr import OcrEngine
from winrt.windows.graphics.imaging import BitmapDecoder
from winrt.windows.storage import StorageFile, FileAccessMode
from winrt.windows.globalization import Language

async def main():
    img_path = r"C:\Users\renas\.gemini\antigravity\scratch\23_autocontrast.jpg"
    if not os.path.exists(img_path):
        print("File not found. Please run autocontrast_test.py first.")
        return
        
    file = await StorageFile.get_file_from_path_async(os.path.abspath(img_path))
    stream = await file.open_async(FileAccessMode.READ)
    decoder = await BitmapDecoder.create_async(stream)
    bitmap = await decoder.get_software_bitmap_async()
    
    lang = Language("de-DE")
    engine = OcrEngine.try_create_from_language(lang)
    result = await engine.recognize_async(bitmap)
    
    print("--- Detailed OCR lines for 23_autocontrast.jpg ---")
    for i, line in enumerate(result.lines):
        if len(line.words) > 0:
            xs = [w.bounding_rect.x for w in line.words]
            ys = [w.bounding_rect.y for w in line.words]
            w = max(w.bounding_rect.x + w.bounding_rect.width for w in line.words) - min(xs)
            h = max(w.bounding_rect.y + w.bounding_rect.height for w in line.words) - min(ys)
            x = min(xs)
            y = min(ys)
            print(f"Line {i:2d} | [X:{x:4.0f}, Y:{y:4.0f}, W:{w:4.0f}, H:{h:4.0f}] | {line.text}")
        else:
            print(f"Line {i:2d} | [No words] | {line.text}")

if __name__ == "__main__":
    asyncio.run(main())
