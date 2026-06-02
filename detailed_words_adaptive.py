import asyncio
import os
from winrt.windows.media.ocr import OcrEngine
from winrt.windows.graphics.imaging import BitmapDecoder
from winrt.windows.storage import StorageFile, FileAccessMode
from winrt.windows.globalization import Language

async def main():
    img_path = r"C:\Users\renas\.gemini\antigravity\scratch\23_adaptive.jpg"
    if not os.path.exists(img_path):
        print("File not found")
        return
        
    file = await StorageFile.get_file_from_path_async(os.path.abspath(img_path))
    stream = await file.open_async(FileAccessMode.READ)
    decoder = await BitmapDecoder.create_async(stream)
    bitmap = await decoder.get_software_bitmap_async()
    
    lang = Language("de-DE")
    engine = OcrEngine.try_create_from_language(lang)
    result = await engine.recognize_async(bitmap)
    
    print("--- Detailed Word List (Adaptive) ---")
    words_found = []
    for line in result.lines:
        for word in line.words:
            words_found.append(word)
            
    # Sort words by Y then X
    words_found.sort(key=lambda w: (w.bounding_rect.y, w.bounding_rect.x))
    
    for i, word in enumerate(words_found):
        r = word.bounding_rect
        print(f"Word {i:3d} | [X:{r.x:4.0f}, Y:{r.y:4.0f}, W:{r.width:3.0f}, H:{r.height:3.0f}] | {word.text}")

if __name__ == "__main__":
    asyncio.run(main())
