import asyncio
import os
import json
import numpy as np
from PIL import Image
from winrt.windows.media.ocr import OcrEngine
from winrt.windows.graphics.imaging import BitmapDecoder
from winrt.windows.storage import StorageFile, FileAccessMode
from winrt.windows.globalization import Language

async def run_ocr_on_file(image_path):
    abs_path = os.path.abspath(image_path)
    file = await StorageFile.get_file_from_path_async(abs_path)
    stream = await file.open_async(FileAccessMode.READ)
    decoder = await BitmapDecoder.create_async(stream)
    bitmap = await decoder.get_software_bitmap_async()

    lang = Language("de-DE")
    engine = OcrEngine.try_create_from_language(lang)
    if not engine:
        engine = OcrEngine.try_create_from_user_profile_languages()
        
    result = await engine.recognize_async(bitmap)
    return result

def clean_ocr_text(text):
    # Standardize common typos
    corrections = {
        "KMSerkiinik": "Kinderklinik",
        "Neuropdiatrie": "Neuropdiatrie",
        "Neurop&atrie": "Neuropdiatrie",
        "Neuropdjatrie": "Neuropdiatrie",
        "Krankenbetrderung": "Krankenbefrderung",
        "Krankenbeirderung": "Krankenbefrderung",
    }
    for typo, correction in corrections.items():
        text = text.replace(typo, correction)
    return text

def is_checkbox_checked(img_arr, box_coords, threshold=105, check_threshold=0.08):
    x1, y1, x2, y2 = box_coords
    box_region = img_arr[y1:y2, x1:x2]
    
    # Isolate inner 60% of the box to exclude borders
    h, w = box_region.shape
    mx = int(w * 0.20)
    my = int(h * 0.20)
    inner_region = box_region[my : h - my, mx : w - mx]
    
    dark_pixels = np.sum(inner_region < threshold)
    total_pixels = inner_region.size
    dark_ratio = dark_pixels / total_pixels if total_pixels > 0 else 0
    
    return bool(dark_ratio > check_threshold)

async def scan_medical_form(image_path):
    if not os.path.exists(image_path):
        return {"error": f"File {image_path} not found"}
        
    # 1. Run OCR to extract text and spatial bounding boxes
    ocr_result = await run_ocr_on_file(image_path)
    if not ocr_result:
        return {"error": "OCR failed to initialize"}
        
    # Load grayscale image for pixel analysis
    with Image.open(image_path) as img:
        gray = img.convert('L')
        img_arr = np.array(gray)
        
    # 2. Extract Abholort (Pickup Address) from patient details block
    # Bounding box: X: 200 to 550, Y: 400 to 480
    pickup_lines = []
    for line in ocr_result.lines:
        # Calculate line coordinates
        if len(line.words) > 0:
            xs = [w.bounding_rect.x for w in line.words]
            ys = [w.bounding_rect.y for w in line.words]
            line_x = min(xs)
            line_y = min(ys)
            
            # If line is within the patient details address region
            if 200 <= line_x <= 550 and 400 <= line_y <= 480:
                pickup_lines.append(line.text)
                
    pickup_address = ", ".join(pickup_lines)
    # Clean up country code prefix
    if pickup_address.startswith("D "):
        pickup_address = pickup_address[2:]
    elif " D " in pickup_address:
        pickup_address = pickup_address.replace(" D ", " ")
        
    # 3. Extract Zielort (Destination) from Section 2 block
    # Bounding box: X: 200 to 600, Y: 1030 to 1080
    destination_lines = []
    for line in ocr_result.lines:
        if len(line.words) > 0:
            xs = [w.bounding_rect.x for w in line.words]
            ys = [w.bounding_rect.y for w in line.words]
            line_x = min(xs)
            line_y = min(ys)
            
            if 200 <= line_x <= 600 and 1030 <= line_y <= 1080:
                cleaned_text = clean_ocr_text(line.text)
                destination_lines.append(cleaned_text)
                
    destination = " - ".join(destination_lines)
    
    # 4. Check Hinfahrt and Rckfahrt Checkboxes
    # Bounding boxes (outer coordinates from blob detection)
    hinfahrt_coords = (693, 344, 727, 379)
    rueckfahrt_coords = (696, 393, 729, 428)
    
    hinfahrt_checked = is_checkbox_checked(img_arr, hinfahrt_coords)
    rueckfahrt_checked = is_checkbox_checked(img_arr, rueckfahrt_coords)
    
    # Determine Trip Type
    if hinfahrt_checked and rueckfahrt_checked:
        trip_type = "Hin- & Rckfahrt"
    elif hinfahrt_checked:
        trip_type = "Hinfahrt"
    elif rueckfahrt_checked:
        trip_type = "Rckfahrt"
    else:
        trip_type = "Nicht angegeben (kein Hkchen erkannt)"
        
    # Compile extracted data
    scanned_data = {
        "status": "success",
        "file": os.path.basename(image_path),
        "abholort": pickup_address.strip(),
        "zielort": destination.strip(),
        "fahrtart": trip_type,
        "details": {
            "hinfahrt_box_checked": hinfahrt_checked,
            "rueckfahrt_box_checked": rueckfahrt_checked
        }
    }
    
    return scanned_data

async def main():
    img = "23.jpeg"
    print(f"Scanning medical transport form: {img}...")
    data = await scan_medical_form(img)
    print("\n--- Scanned Result (JSON) ---")
    print(json.dumps(data, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    asyncio.run(main())
