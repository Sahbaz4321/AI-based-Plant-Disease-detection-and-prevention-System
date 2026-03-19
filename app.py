from flask import Flask, request, jsonify
from tensorflow.keras.applications.efficientnet import preprocess_input

import tensorflow as tf
import numpy as np
from PIL import Image
import io
import json
from flask_cors import CORS
import os
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# -------------------------
# Load model & classes
# -------------------------
MODEL_PATH = "final_model.keras"   # ✅ updated
model = tf.keras.models.load_model(MODEL_PATH)

with open("classes.json", "r") as f:
    classes = json.load(f)

IMG_SIZE = 224

# -------------------------
# Preprocess
# -------------------------

def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((IMG_SIZE, IMG_SIZE))
    img_array = np.array(img, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)  # ✅ EfficientNet preprocessing
    return img_array
# -------------------------
# Predict API
# -------------------------
@app.route('/predict', methods=['POST'])
def predict():
    files = request.files.getlist('images')   # ✅ fixed

    if len(files) == 0:
        return jsonify({'error': 'No images uploaded'}), 400

    results = []

    for file in files:
        img_array = preprocess_image(file.read())
        predictions = model.predict(img_array)[0]

        print("DEBUG predictions:", predictions)  # 🔍 debug

        top_idx = int(np.argmax(predictions))
        predicted_class = classes[str(top_idx)]
        confidence = float(predictions[top_idx])

        results.append({
            "filename": file.filename,
            "predicted_class": predicted_class,
            "confidence": confidence
        })

    return jsonify(results)

@app.route("/explain-disease", methods=["POST"])
def explain_disease():
    """
    Use Gemini API to explain a plant disease: recommended fertilizer,
    treatment procedure, and prevention tips.
    """
    data = request.get_json(silent=True) or {}
    disease = data.get("disease")

    if not disease:
        return jsonify({"error": "Missing 'disease' in body"}), 400

    # api_key = os.environ.get("GEMINI_API_KEY")
    api_key = ""
    if not api_key:
        return jsonify({"error": "GEMINI_API_KEY not configured on server"}), 500

    try:
        genai.configure(api_key=api_key)
        model_g = genai.GenerativeModel("gemini-2.5-flash")

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

        # Debug logging for prompt and disease
        print("=== Gemini explain_disease request ===")
        print("Disease:", disease)
        print("Prompt:\n", prompt)

        response = model_g.generate_content(prompt)
        print("Gemini raw response object:", response)
        text = response.text.strip() if hasattr(response, "text") else str(response)
        print("Gemini raw text:", text)

        # Try to locate JSON inside the response
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
    except Exception as e:
        import traceback

        print("=== Gemini explain_disease ERROR ===")
        traceback.print_exc()
        return jsonify({"error": "Failed to get explanation from Gemini", "details": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5001, debug=True)