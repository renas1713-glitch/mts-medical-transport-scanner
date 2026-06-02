import asyncio
from winrt.windows.graphics.imaging import BitmapDecoder, BitmapRotation, BitmapTransform

def inspect_winrt_imaging():
    print("BitmapRotation attributes:", dir(BitmapRotation))
    # We can inspect BitmapDecoder attributes by creating an instance or using the class itself
    print("BitmapDecoder attributes:", dir(BitmapDecoder))

if __name__ == "__main__":
    inspect_winrt_imaging()
