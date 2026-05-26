import os
import tensorflow as tf
import json

model_path = os.path.join("app", "models", "skin_classifier.keras")
model = tf.keras.models.load_model(model_path)

# Print model config to see if class names are in the metadata or layer names
config = model.get_config()
print("Model Config:")
# We'll save the config to a json file to inspect it
with open("model_config.json", "w", encoding="utf-8") as f:
    json.dump(config, f, indent=2, default=str)
print("Saved model_config.json")

# Also print layer names
for layer in model.layers:
    print(f"Layer: {layer.name}, Type: {type(layer).__name__}")
