from PIL import Image

def inspect_images():
    for name in ["23.jpeg", "WhatsApp Image 2026-06-01 at 22.28.01.jpeg"]:
        try:
            with Image.open(name) as img:
                print(f"Image: {name}")
                print(f"  Format: {img.format}")
                print(f"  Size (WxH): {img.size}")
                print(f"  Mode: {img.mode}")
        except Exception as e:
            print(f"Error reading {name}: {e}")

if __name__ == "__main__":
    inspect_images()
