from flask import Flask, request, jsonify
from tensorflow.keras.applications.efficientnet import preprocess_input

import io
import json
import os
from pathlib import Path

import keras
import numpy as np
import tensorflow as tf
from flask_cors import CORS
from google import genai
from PIL import Image

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent
MODEL_CANDIDATES = [
    BASE_DIR / "final_model_fixed.keras",
    BASE_DIR / "final_model.keras",
    BASE_DIR / "final_model_fixed.h5",
]
CLASSES_PATH = BASE_DIR / "classes.json"
IMG_SIZE = 224
model = None
MODEL_PATH = None
MODEL_LOAD_ERROR = None
classes = {}
CLASSES_LOAD_ERROR = None


def load_model_with_fallback():
    errors = []

    print(f"TensorFlow version: {tf.__version__}")
    print(f"Keras version: {keras.__version__}")

    for model_path in MODEL_CANDIDATES:
        if not model_path.exists():
            errors.append(f"{model_path.name}: file not found")
            continue

        try:
            print(f"Trying keras.models.load_model on {model_path.name}...")
            loaded_model = keras.models.load_model(model_path, compile=False)
            print(f"Model loaded successfully with keras: {model_path.name}")
            return loaded_model, str(model_path)
        except Exception as exc:
            errors.append(f"{model_path.name} via keras failed: {exc}")

        try:
            print(f"Trying tf.keras.models.load_model on {model_path.name}...")
            loaded_model = tf.keras.models.load_model(model_path, compile=False)
            print(f"Model loaded successfully with tf.keras: {model_path.name}")
            return loaded_model, str(model_path)
        except Exception as exc:
            errors.append(f"{model_path.name} via tf.keras failed: {exc}")

    raise RuntimeError(" | ".join(errors))


try:
    model, MODEL_PATH = load_model_with_fallback()
except Exception as exc:
    MODEL_LOAD_ERROR = str(exc)
    print(f"Model load failed during startup: {MODEL_LOAD_ERROR}")

try:
    with open(CLASSES_PATH, "r", encoding="utf-8") as f:
        classes = json.load(f)
except Exception as exc:
    CLASSES_LOAD_ERROR = str(exc)
    print(f"Classes load failed during startup: {CLASSES_LOAD_ERROR}")


def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE))
    img_array = np.array(img, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array


@app.route("/")
def home():
    return jsonify(
        {
            "message": "AI Plant Disease API Running",
            "model_path": MODEL_PATH,
            "model_loaded": model is not None,
            "model_load_error": MODEL_LOAD_ERROR,
            "classes_loaded": bool(classes),
            "classes_count": len(classes),
            "classes_load_error": CLASSES_LOAD_ERROR,
        }
    )


@app.route("/predict", methods=["POST"])
def predict():
    global model
    global MODEL_PATH
    global MODEL_LOAD_ERROR

    if model is None:
        try:
            model, MODEL_PATH = load_model_with_fallback()
            MODEL_LOAD_ERROR = None
        except Exception as exc:
            MODEL_LOAD_ERROR = str(exc)
            return (
                jsonify(
                    {
                        "error": "Model not loaded",
                        "details": MODEL_LOAD_ERROR,
                    }
                ),
                503,
            )

    print("=== /predict called ===")
    print("Content-Type:", request.content_type)
    print("request.files keys:", list(request.files.keys()))
    print("request.form keys:", list(request.form.keys()))

    files = request.files.getlist("images")
    if not files:
        single_file = request.files.get("image")
        if single_file:
            files = [single_file]

    if len(files) == 0:
        return (
            jsonify(
                {
                    "error": "No images uploaded",
                    "debug": {
                        "content_type": request.content_type,
                        "file_keys": list(request.files.keys()),
                        "form_keys": list(request.form.keys()),
                    },
                }
            ),
            400,
        )

    results = []

    for file in files:
        img_array = preprocess_image(file.read())
        predictions = model.predict(img_array, verbose=0)[0]

        top_idx = int(np.argmax(predictions))
        predicted_class = classes.get(str(top_idx), f"class_{top_idx}")
        confidence = float(predictions[top_idx])

        results.append(
            {
                "filename": file.filename,
                "predicted_class": predicted_class,
                "confidence": confidence,
            }
        )

    return jsonify(results)


@app.route("/explain-disease", methods=["POST"])
def explain_disease():
    data = request.get_json(silent=True) or {}
    disease = data.get("disease")

    if not disease:
        return jsonify({"error": "Missing 'disease' in body"}), 400

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return jsonify({"error": "GEMINI_API_KEY not configured on server"}), 500

    try:
        client = genai.Client(api_key=api_key)

        prompt = f"""
You are an expert agronomist. Briefly explain how to handle the following plant disease for a farmer.

Disease name: {disease}

Return ONLY valid JSON with this shape:
{{
  "recommended_fertilizer": "short fertilizer recommendation in 1-2 sentences",
  "procedure": "step-by-step treatment procedure in 2-4 short sentences",
  "prevention": "preventive measures in 2-4 short sentences"
}}
Do not include any additional text outside the JSON.
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        text = response.text.strip() if getattr(response, "text", None) else str(response)

        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1:
            text = text[start : end + 1]

        payload = json.loads(text)

        return jsonify(
            {
                "disease": disease,
                "recommended_fertilizer": payload.get("recommended_fertilizer", ""),
                "procedure": payload.get("procedure", ""),
                "prevention": payload.get("prevention", ""),
            }
        )
    except Exception as exc:
        return jsonify(
            {
                "error": "Failed to get explanation from Gemini",
                "details": str(exc),
            }
        ), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)
