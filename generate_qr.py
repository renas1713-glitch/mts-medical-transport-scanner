import os
import qrcode

def make_qr():
    url = "exp://192.168.0.238:8081"
    
    # Generate QR Code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save directly to the conversation folder
    target_dir = r"C:\Users\renas\.gemini\antigravity\brain\1404dfe5-5d05-450a-92d7-604ecce089f0"
    os.makedirs(target_dir, exist_ok=True)
    target_path = os.path.join(target_dir, "expo_qr.png")
    
    img.save(target_path)
    print(f"QR code saved successfully to: {target_path}")

if __name__ == "__main__":
    make_qr()
