import os
import sys

# Ensure backend directory is in python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from PIL import Image
import io

def make_dummy_image(color):
    img = Image.new("RGB", (224, 224), color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

async def main():
    # Import ai_service from app.services.ai_service
    from app.services.ai_service import skin_classifier
    
    print("AI Mode:", skin_classifier.mode)
    print("Class names:", skin_classifier.class_names)
    
    # Test with different colors
    # 1. Dark image (previously triggered Seborrheic Keratoses / index 9)
    print("\n--- Testing with Dark Image (10, 10, 10) ---")
    dark_bytes = make_dummy_image((10, 10, 10))
    res_dark = await skin_classifier.predict(dark_bytes)
    print("Result fields:")
    print("Severity:", res_dark.get("severity"))
    print("Overall Score:", res_dark.get("overallScore"))
    print("Features:")
    for f in res_dark.get("features", []):
        print(f"  {f['name']}: {f['description']}")
        
    # 2. Bright image (240, 240, 240)
    print("\n--- Testing with Bright Image (240, 240, 240) ---")
    bright_bytes = make_dummy_image((240, 240, 240))
    res_bright = await skin_classifier.predict(bright_bytes)
    print("Result fields:")
    print("Severity:", res_bright.get("severity"))
    print("Overall Score:", res_bright.get("overallScore"))
    print("Features:")
    for f in res_bright.get("features", []):
        print(f"  {f['name']}: {f['description']}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
