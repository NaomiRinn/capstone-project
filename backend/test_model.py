import os
import tensorflow as tf
import numpy as np

# Load model
model_path = os.path.join("app", "models", "skin_classifier.keras")
print("Loading model from:", model_path)
model = tf.keras.models.load_model(model_path)

# Print model summary input/output shape
print("Input shape:", model.input_shape)
print("Output shape:", model.output_shape)

# Load classes
classes_path = os.path.join("app", "models", "jumlah_kelas.txt")
if os.path.exists(classes_path):
    with open(classes_path, "r", encoding="utf-8") as f:
        classes = [line.strip() for line in f if line.strip()]
else:
    classes = [
        "Kulit Sehat", "Hyperpigmentation", "Eczema", "Solar Lentigo",
        "Melasma", "Sunburn", "Psoriasis", "Basal Cell Carcinoma (BCC)",
        "Melanoma", "Seborrheic Keratoses and other Benign Tumors"
    ]
print("Classes:", classes)

# Create a few synthetic images
# 1. Zero image (all black)
# 2. Max image (all white)
# 3. Mid image (all gray)
# 4. Standard preprocess_input of MobileNetV3 (wait, preprocess_input is no-op for v3, but let's test scaling)

for scale_by_255 in [True, False]:
    print(f"\n--- Scaling by 255.0: {scale_by_255} ---")
    for name, val in [("Black", 0), ("Gray", 128), ("White", 255)]:
        img = np.ones((1, 224, 224, 3), dtype=np.float32) * val
        if scale_by_255:
            img = img / 255.0
        preds = model.predict(img, verbose=0)[0]
        top_idx = np.argmax(preds)
        print(f"Image {name} (val={val}): top_idx={top_idx}, prob={preds[top_idx]:.4f}, class={classes[top_idx]}")
