import os
import tensorflow as tf
import numpy as np
from PIL import Image
import io

# Load model
model_path = os.path.join("app", "models", "skin_classifier.keras")
print("Loading model from:", model_path)
model = tf.keras.models.load_model(model_path)

print("Input shape:", model.input_shape)
print("Output shape:", model.output_shape)

classes = [
    "Kulit Sehat", "Hyperpigmentation", "Eczema", "Solar Lentigo",
    "Melasma", "Sunburn", "Psoriasis", "Basal Cell Carcinoma (BCC)",
    "Melanoma", "Seborrheic Keratoses and other Benign Tumors"
]

def make_dummy_image(color):
    img = Image.new("RGB", (224, 224), color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

# We will test 4 different preprocessing methods:
# Method A: scale to [0, 1] (divide by 255.0)
# Method B: raw scale [0, 255] (no division)
# Method C: scale to [-1, 1] (x / 127.5 - 1.0)
# Method D: using tf.keras.applications.mobilenet_v3.preprocess_input

methods = {
    "A: Scale to [0, 1] (x / 255.0)": lambda x: x / 255.0,
    "B: Raw scale [0, 255] (no division)": lambda x: x,
    "C: Scale to [-1, 1] (x / 127.5 - 1.0)": lambda x: x / 127.5 - 1.0,
    "D: Keras MobileNetV3 preprocess_input": lambda x: tf.keras.applications.mobilenet_v3.preprocess_input(x)
}

# Test colors
colors = [
    ("Red-like Skin", (200, 80, 80)),
    ("Brown-like Skin", (150, 100, 80)),
    ("Yellow-like Skin", (220, 180, 140)),
]

for method_name, preprocess_fn in methods.items():
    print("\n" + "="*60)
    print(f"PREPROCESSING METHOD: {method_name}")
    print("="*60)
    
    for color_name, color_rgb in colors:
        print(f"\n* Testing color: {color_name} {color_rgb}")
        img_bytes = make_dummy_image(color_rgb)
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        img = img.resize((224, 224))
        arr = np.array(img, dtype=np.float32)
        arr = preprocess_fn(arr)
        arr = np.expand_dims(arr, axis=0)
        
        preds = model.predict(arr, verbose=0)[0]
        sorted_indices = np.argsort(preds)[::-1]
        
        print("  Top 3 Predictions:")
        for i in range(3):
            idx = sorted_indices[i]
            print(f"    - {classes[idx]:<45} : {preds[idx]*100:.2f}%")
