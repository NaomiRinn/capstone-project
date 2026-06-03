import os
import tensorflow as tf
import numpy as np

# Use absolute path to avoid directory resolution issues
output_file = r"d:\GITHUB REPO\capstone\backend\output.txt"
with open(output_file, "w", encoding="utf-8") as f:
    f.write("=== RUNNING MODEL INSPECTION ===\n")
    
    try:
        model_path = r"d:\GITHUB REPO\capstone\backend\app\models\skin_classifier.keras"
        f.write(f"Loading model from: {model_path}\n")
        model = tf.keras.models.load_model(model_path)
        f.write("Model loaded successfully.\n")
        
        f.write(f"Input shape: {model.input_shape}\n")
        f.write(f"Output shape: {model.output_shape}\n\n")
        
        classes_path = r"d:\GITHUB REPO\capstone\backend\app\models\jumlah_kelas.txt"
        if os.path.exists(classes_path):
            with open(classes_path, "r", encoding="utf-8") as c_f:
                classes = [line.strip() for line in c_f if line.strip()]
            f.write(f"Loaded classes from {classes_path}:\n")
        else:
            classes = [
                "Kulit Sehat", "Hyperpigmentation", "Eczema", "Solar Lentigo",
                "Melasma", "Sunburn", "Psoriasis", "Basal Cell Carcinoma (BCC)",
                "Melanoma", "Seborrheic Keratoses and other Benign Tumors"
            ]
            f.write("Using default classes fallback:\n")
        
        for idx, cls in enumerate(classes):
            f.write(f"  Class {idx}: {cls}\n")
        f.write("\n")
        
        # Test inputs
        for scale_by_255 in [True, False]:
            f.write(f"--- Scaling by 255.0: {scale_by_255} ---\n")
            for name, val in [("Black", 0), ("Gray", 128), ("White", 255)]:
                img = np.ones((1, 224, 224, 3), dtype=np.float32) * val
                if scale_by_255:
                    img = img / 255.0
                preds = model.predict(img, verbose=0)[0]
                
                f.write(f"Image {name} (val={val}):\n")
                sorted_indices = np.argsort(preds)[::-1]
                for i in range(min(5, len(preds))):
                    idx = sorted_indices[i]
                    f.write(f"  - index {idx:<2} ({classes[idx] if idx < len(classes) else 'Unknown'}): {preds[idx]*100:.4f}%\n")
                f.write("\n")
                
    except Exception as e:
        f.write(f"ERROR: {str(e)}\n")
        import traceback
        traceback.print_exc(file=f)

print("Inspection script completed writing to output.txt")
