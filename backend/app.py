# from flask import Flask, request, jsonify
# from tensorflow.keras.applications.efficientnet import preprocess_input

# import tensorflow as tf
# import numpy as np
# from PIL import Image
# import io
# import json
# from flask_cors import CORS
# import os
# import google.generativeai as genai

# app = Flask(__name__)
# CORS(app)

# # -------------------------
# # Load model & classes
# # -------------------------
# MODEL_PATH = "final_model.keras"   # ✅ updated
# model = tf.keras.models.load_model(MODEL_PATH)

# with open("classes.json", "r") as f:
#     classes = json.load(f)

# IMG_SIZE = 224

# # -------------------------
# # Preprocess
# # -------------------------

# def preprocess_image(image_bytes):
#     img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
#     img = img.resize((IMG_SIZE, IMG_SIZE))
#     img_array = np.array(img, dtype=np.float32)
#     img_array = np.expand_dims(img_array, axis=0)
#     img_array = preprocess_input(img_array)  # ✅ EfficientNet preprocessing
#     return img_array
# # -------------------------
# # Predict API
# # -------------------------
# @app.route('/predict', methods=['POST'])
# def predict():
#     files = request.files.getlist('images')   # ✅ fixed

#     if len(files) == 0:
#         return jsonify({'error': 'No images uploaded'}), 400

#     results = []

#     for file in files:
#         img_array = preprocess_image(file.read())
#         predictions = model.predict(img_array)[0]

#         print("DEBUG predictions:", predictions)  # 🔍 debug

#         top_idx = int(np.argmax(predictions))
#         predicted_class = classes[str(top_idx)]
#         confidence = float(predictions[top_idx])

#         results.append({
#             "filename": file.filename,
#             "predicted_class": predicted_class,
#             "confidence": confidence
#         })

#     return jsonify(results)

# @app.route("/explain-disease", methods=["POST"])
# def explain_disease():
#     """
#     Use Gemini API to explain a plant disease: recommended fertilizer,
#     treatment procedure, and prevention tips.
#     """
#     data = request.get_json(silent=True) or {}
#     disease = data.get("disease")

#     if not disease:
#         return jsonify({"error": "Missing 'disease' in body"}), 400

#     api_key = os.environ.get("GEMINI_API_KEY")

# #    api_key = os.environ.get("GEMINI_API_KEY")
#     api_key="AIzaSyDiqLFT8R8oI5qexFdFuNHXo74ure4sRwQ"

#     if not api_key:
#         return jsonify({"error": "GEMINI_API_KEY not configured on server"}), 500

#     try:
#         genai.configure(api_key=api_key)
#         model_g = genai.GenerativeModel("gemini-2.5-flash")

#         prompt = f"""
# You are an expert agronomist. Briefly explain how to handle the following plant disease for a farmer.

# Disease name: {disease}

# Return ONLY valid JSON with this shape:
# {{
#   "recommended_fertilizer": "short fertilizer recommendation in 1-2 sentences",
#   "procedure": "step-by-step treatment procedure in 2-4 short sentences",
#   "prevention": "preventive measures in 2-4 short sentences"
# }}
# Do not include any additional text outside the JSON.
# """

#         # Debug logging for prompt and disease
#         print("=== Gemini explain_disease request ===")
#         print("Disease:", disease)
#         print("Prompt:\n", prompt)

#         response = model_g.generate_content(prompt)
#         print("Gemini raw response object:", response)
#         text = response.text.strip() if hasattr(response, "text") else str(response)
#         print("Gemini raw text:", text)

#         # Try to locate JSON inside the response
#         start = text.find("{")
#         end = text.rfind("}")
#         if start != -1 and end != -1:
#             text = text[start : end + 1]

#         payload = json.loads(text)

#         return jsonify(
#             {
#                 "disease": disease,
#                 "recommended_fertilizer": payload.get("recommended_fertilizer", ""),
#                 "procedure": payload.get("procedure", ""),
#                 "prevention": payload.get("prevention", ""),
#             }
#         )
#     except Exception as e:
#         import traceback

#         print("=== Gemini explain_disease ERROR ===")
#         traceback.print_exc()
#         return jsonify({"error": "Failed to get explanation from Gemini", "details": str(e)}), 500


# if __name__ == "__main__":
#     import os
#     port = int(os.environ.get("PORT", 10000))
#     app.run(host="0.0.0.0", port=port)
# if __name__ == "__main__":
#     port = int(os.environ.get("PORT", 10000))
#     app.run(host="0.0.0.0", port=port)
# if __name__ == "__main__":
#     app.run(port=5001, debug=True)














# from flask import Flask, request, jsonify
# from tensorflow.keras.applications.efficientnet import preprocess_input

# import tensorflow as tf
# import numpy as np
# from PIL import Image
# import io
# import json
# from flask_cors import CORS
# import os
# import google.generativeai as genai

# app = Flask(__name__)
# CORS(app)

# # -------------------------
# # Load model & classes
# # -------------------------

# MODEL_PATH = "final_model.keras"

# # Lazy loading model
# model = None

# def load_model_once():
#     global model
#     if model is None:
#         print("Loading AI model...")
#         model = tf.keras.models.load_model(MODEL_PATH)
#         print("Model loaded successfully")


# with open("classes.json", "r") as f:
#     classes = json.load(f)

# IMG_SIZE = 224


# # -------------------------
# # Preprocess
# # -------------------------

# def preprocess_image(image_bytes):
#     img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
#     img = img.resize((IMG_SIZE, IMG_SIZE))
#     img_array = np.array(img, dtype=np.float32)
#     img_array = np.expand_dims(img_array, axis=0)
#     img_array = preprocess_input(img_array)
#     return img_array


# # -------------------------
# # Predict API
# # -------------------------

# @app.route('/predict', methods=['POST'])
# def predict():

#     load_model_once()

#     files = request.files.getlist('images')

#     if len(files) == 0:
#         return jsonify({'error': 'No images uploaded'}), 400

#     results = []

#     for file in files:
#         img_array = preprocess_image(file.read())
#         predictions = model.predict(img_array)[0]

#         print("DEBUG predictions:", predictions)

#         top_idx = int(np.argmax(predictions))
#         predicted_class = classes[str(top_idx)]
#         confidence = float(predictions[top_idx])

#         results.append({
#             "filename": file.filename,
#             "predicted_class": predicted_class,
#             "confidence": confidence
#         })

#     return jsonify(results)


# # -------------------------
# # Gemini Explain API
# # -------------------------

# @app.route("/explain-disease", methods=["POST"])
# def explain_disease():

#     data = request.get_json(silent=True) or {}
#     disease = data.get("disease")

#     if not disease:
#         return jsonify({"error": "Missing 'disease' in body"}), 400

#     # api_key = os.environ.get("GEMINI_API_KEY")
#     api_key="AIzaSyDiqLFT8R8oI5qexFdFuNHXo74ure4sRwQ"

#     if not api_key:
#         return jsonify({"error": "GEMINI_API_KEY not configured on server"}), 500

#     try:
#         genai.configure(api_key=api_key)
#         model_g = genai.GenerativeModel("gemini-2.5-flash")

#         prompt = f"""
# You are an expert agronomist. Briefly explain how to handle the following plant disease for a farmer.

# Disease name: {disease}

# Return ONLY valid JSON with this shape:
# {{
#   "recommended_fertilizer": "short fertilizer recommendation in 1-2 sentences",
#   "procedure": "step-by-step treatment procedure in 2-4 short sentences",
#   "prevention": "preventive measures in 2-4 short sentences"
# }}
# Do not include any additional text outside the JSON.
# """

#         print("=== Gemini request ===")
#         print("Disease:", disease)

#         response = model_g.generate_content(prompt)

#         text = response.text.strip()

#         start = text.find("{")
#         end = text.rfind("}")

#         if start != -1 and end != -1:
#             text = text[start:end+1]

#         payload = json.loads(text)

#         return jsonify({
#             "disease": disease,
#             "recommended_fertilizer": payload.get("recommended_fertilizer", ""),
#             "procedure": payload.get("procedure", ""),
#             "prevention": payload.get("prevention", "")
#         })

#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         return jsonify({
#             "error": "Gemini failed",
#             "details": str(e)
#         }), 500


# # -------------------------
# # Health Check Route
# # -------------------------

# @app.route("/")
# def home():
#     return "AI Plant Disease API Running 🚀"


# # -------------------------
# # Render Port
# # -------------------------

# if __name__ == "__main__":
#     port = int(os.environ.get("PORT", 10000))
#     app.run(host="0.0.0.0", port=port)
from flask import Flask, request, jsonify
from tensorflow.keras.applications.efficientnet import preprocess_input
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import json
from flask_cors import CORS
import os
import traceback
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

MODEL_PATH = "final_model.keras"
CLASSES_PATH = "classes.json"
IMG_SIZE = 224

model = None
classes = {}

startup_status = {
    "cwd": "",
    "files_in_cwd": [],
    "model_path": MODEL_PATH,
    "classes_path": CLASSES_PATH,
    "model_file_found": False,
    "classes_file_found": False,
    "model_loaded": False,
    "classes_loaded": False,
    "classes_count": 0,
    "model_load_error": None,
    "classes_load_error": None,
    "gemini_key_found": False,
    "gemini_key_length": 0,
    "gemini_key_prefix": None,
}


def log_startup_status():
    print("\n========== STARTUP DEBUG ==========")

    startup_status["cwd"] = os.getcwd()
    print("Current Working Directory:", startup_status["cwd"])

    try:
        startup_status["files_in_cwd"] = os.listdir(".")
        print("Files in Current Directory:", startup_status["files_in_cwd"])
    except Exception as e:
        print("Could not list current directory files:", str(e))

    startup_status["model_file_found"] = os.path.exists(MODEL_PATH)
    startup_status["classes_file_found"] = os.path.exists(CLASSES_PATH)

    print(f"Model path: {MODEL_PATH}")
    print(f"Model found: {startup_status['model_file_found']}")

    print(f"Classes path: {CLASSES_PATH}")
    print(f"Classes file found: {startup_status['classes_file_found']}")

    gemini_key = os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        startup_status["gemini_key_found"] = True
        startup_status["gemini_key_length"] = len(gemini_key)
        startup_status["gemini_key_prefix"] = gemini_key[:5]
        print("GEMINI_API_KEY FOUND ✅")
        print("GEMINI_API_KEY length:", len(gemini_key))
        print("GEMINI_API_KEY prefix:", gemini_key[:5])
    else:
        startup_status["gemini_key_found"] = False
        startup_status["gemini_key_length"] = 0
        startup_status["gemini_key_prefix"] = None
        print("GEMINI_API_KEY NOT FOUND ❌")

    print("===================================\n")


def load_classes_once():
    global classes

    if not classes:
        try:
            print("Loading classes.json...")
            with open(CLASSES_PATH, "r") as f:
                classes = json.load(f)

            startup_status["classes_loaded"] = True
            startup_status["classes_count"] = len(classes)
            startup_status["classes_load_error"] = None

            print(f"classes.json loaded successfully. Total classes: {len(classes)}")
        except Exception as e:
            startup_status["classes_loaded"] = False
            startup_status["classes_load_error"] = str(e)
            print("Failed to load classes.json:", str(e))
            raise


def load_model_once():
    global model

    if model is None:
        try:
            print("Loading model now...")
            model = tf.keras.models.load_model(MODEL_PATH, compile=False)
            startup_status["model_loaded"] = True
            startup_status["model_load_error"] = None

            print("Model loaded successfully ✅")
            print("Model type:", type(model))
            print("Model input shape:", getattr(model, "input_shape", "Not available"))
            print("Model output shape:", getattr(model, "output_shape", "Not available"))
        except Exception as e:
            startup_status["model_loaded"] = False
            startup_status["model_load_error"] = str(e)
            print("Failed to load model ❌:", str(e))
            raise


def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE))
    img_array = np.array(img, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array


# Startup diagnostics
log_startup_status()

# Load classes at startup
try:
    load_classes_once()
except Exception:
    traceback.print_exc()

# Load model at startup for debugging
try:
    load_model_once()
except Exception:
    traceback.print_exc()


@app.route("/")
def home():
    return jsonify({
        "message": "AI Plant Disease API Running 🚀",
        "debug": {
            "cwd": startup_status["cwd"],
            "files_in_cwd": startup_status["files_in_cwd"],
            "model_path": startup_status["model_path"],
            "model_file_found": startup_status["model_file_found"],
            "model_loaded": startup_status["model_loaded"],
            "model_load_error": startup_status["model_load_error"],
            "classes_path": startup_status["classes_path"],
            "classes_file_found": startup_status["classes_file_found"],
            "classes_loaded": startup_status["classes_loaded"],
            "classes_count": startup_status["classes_count"],
            "classes_load_error": startup_status["classes_load_error"],
            "gemini_key_found": startup_status["gemini_key_found"],
            "gemini_key_length": startup_status["gemini_key_length"],
            "gemini_key_prefix": startup_status["gemini_key_prefix"],
        }
    })


@app.route("/health")
def health():
    gemini_key = os.environ.get("GEMINI_API_KEY")

    return jsonify({
        "status": "ok",
        "model_found": os.path.exists(MODEL_PATH),
        "classes_found": os.path.exists(CLASSES_PATH),
        "model_loaded": model is not None,
        "classes_loaded": bool(classes),
        "classes_count": len(classes) if isinstance(classes, dict) else 0,
        "gemini_key_found": bool(gemini_key),
        "gemini_key_length": len(gemini_key) if gemini_key else 0,
        "gemini_key_prefix": gemini_key[:5] if gemini_key else None,
    })


@app.route("/predict", methods=["POST"])
def predict():
    try:
        print("\n========== /predict called ==========")

        load_classes_once()
        load_model_once()

        files = request.files.getlist("images")
        print("Number of uploaded files:", len(files))

        if len(files) == 0:
            return jsonify({"error": "No images uploaded"}), 400

        results = []

        for file in files:
            print("Processing file:", file.filename)

            image_bytes = file.read()
            print("Image bytes size:", len(image_bytes))

            img_array = preprocess_image(image_bytes)
            print("Preprocessing done. Shape:", img_array.shape)

            predictions = model.predict(img_array)[0]
            print("Prediction completed.")

            top_idx = int(np.argmax(predictions))
            predicted_class = classes.get(str(top_idx), f"class_{top_idx}")
            confidence = float(predictions[top_idx])

            print("Top index:", top_idx)
            print("Predicted class:", predicted_class)
            print("Confidence:", confidence)

            results.append({
                "filename": file.filename,
                "predicted_class": predicted_class,
                "confidence": confidence
            })

        print("========== /predict success ==========\n")
        return jsonify(results)

    except Exception as e:
        print("========== /predict error ==========")
        traceback.print_exc()
        return jsonify({
            "error": "Prediction failed",
            "details": str(e),
            "debug": {
                "model_found": os.path.exists(MODEL_PATH),
                "classes_found": os.path.exists(CLASSES_PATH),
                "model_loaded": model is not None,
                "classes_loaded": bool(classes),
                "classes_count": len(classes) if isinstance(classes, dict) else 0
            }
        }), 500


@app.route("/explain-disease", methods=["POST"])
def explain_disease():
    data = request.get_json(silent=True) or {}
    disease = data.get("disease")

    if not disease:
        return jsonify({"error": "Missing 'disease' in body"}), 400

    api_key = os.environ.get("GEMINI_API_KEY")

    print("\n========== GEMINI KEY DEBUG ==========")
    if api_key:
        print("GEMINI_API_KEY FOUND ✅")
        print("Key length:", len(api_key))
        print("First 5 chars:", api_key[:5])
    else:
        print("GEMINI_API_KEY NOT FOUND ❌")
    print("=====================================\n")

    if not api_key:
        return jsonify({
            "error": "GEMINI_API_KEY not configured on server",
            "debug": {
                "gemini_key_found": False,
                "gemini_key_length": 0,
                "gemini_key_prefix": None,
                "available_env_keys": list(os.environ.keys())
            }
        }), 500

    try:
        print("\n========== /explain-disease called ==========")
        print("Disease:", disease)

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

        response = model_g.generate_content(prompt)
        text = response.text.strip() if hasattr(response, "text") else str(response)

        print("Raw Gemini response:", text)

        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1:
            text = text[start:end + 1]

        payload = json.loads(text)

        print("========== /explain-disease success ==========\n")

        return jsonify({
            "disease": disease,
            "recommended_fertilizer": payload.get("recommended_fertilizer", ""),
            "procedure": payload.get("procedure", ""),
            "prevention": payload.get("prevention", "")
        })

    except Exception as e:
        print("========== /explain-disease error ==========")
        traceback.print_exc()
        return jsonify({
            "error": "Gemini failed",
            "details": str(e),
            "debug": {
                "gemini_key_found": True,
                "gemini_key_length": len(api_key),
                "gemini_key_prefix": api_key[:5]
            }
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    print(f"Starting Flask app on port {port}...")
    app.run(host="0.0.0.0", port=port)





# from flask import Flask, request, jsonify
# from tensorflow.keras.applications.efficientnet import preprocess_input
# import tensorflow as tf
# import numpy as np
# from PIL import Image
# import io
# import json
# from flask_cors import CORS
# import os
# import traceback
# import google.generativeai as genai

# app = Flask(__name__)
# CORS(app)
# import tensorflow as tf
# model = tf.keras.models.load_model("final_model.keras", compile=False)
# print("loaded")
# MODEL_PATH = "final_model.keras"
# model = None

# with open("classes.json", "r") as f:
#     classes = json.load(f)

# IMG_SIZE = 224

# def load_model_once():
#     global model
#     if model is None:
#         print("Loading model now...")
#         model = tf.keras.models.load_model(MODEL_PATH, compile=False)
#         print("Model loaded successfully")

# def preprocess_image(image_bytes):
#     img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
#     img = img.resize((IMG_SIZE, IMG_SIZE))
#     img_array = np.array(img, dtype=np.float32)
#     img_array = np.expand_dims(img_array, axis=0)
#     img_array = preprocess_input(img_array)
#     return img_array

# @app.route("/")
# def home():
#     return "AI Plant Disease API Running 🚀"

# @app.route("/predict", methods=["POST"])
# def predict():
#     try:
#         load_model_once()

#         files = request.files.getlist("images")
#         if len(files) == 0:
#             return jsonify({"error": "No images uploaded"}), 400

#         results = []

#         for file in files:
#             img_array = preprocess_image(file.read())
#             predictions = model.predict(img_array)[0]

#             top_idx = int(np.argmax(predictions))
#             predicted_class = classes.get(str(top_idx), f"class_{top_idx}")
#             confidence = float(predictions[top_idx])

#             results.append({
#                 "filename": file.filename,
#                 "predicted_class": predicted_class,
#                 "confidence": confidence
#             })

#         return jsonify(results)

#     except Exception as e:
#         traceback.print_exc()
#         return jsonify({
#             "error": "Prediction failed",
#             "details": str(e)
#         }), 500

# @app.route("/explain-disease", methods=["POST"])
# def explain_disease():
#     data = request.get_json(silent=True) or {}
#     disease = data.get("disease")

#     if not disease:
#         return jsonify({"error": "Missing 'disease' in body"}), 400

#     # api_key = os.environ.get("GEMINI_API_KEY")
#     api_key="AIzaSyBmzOXAMoa4_bP85glL4unIszAt3q5DNkA"
#     if not api_key:
#         return jsonify({"error": "GEMINI_API_KEY not configured on server"}), 500

#     try:
#         genai.configure(api_key=api_key)
#         model_g = genai.GenerativeModel("gemini-2.5-flash")

#         prompt = f"""
# You are an expert agronomist. Briefly explain how to handle the following plant disease for a farmer.

# Disease name: {disease}

# Return ONLY valid JSON with this shape:
# {{
#   "recommended_fertilizer": "short fertilizer recommendation in 1-2 sentences",
#   "procedure": "step-by-step treatment procedure in 2-4 short sentences",
#   "prevention": "preventive measures in 2-4 short sentences"
# }}
# Do not include any additional text outside the JSON.
# """

#         response = model_g.generate_content(prompt)
#         text = response.text.strip() if hasattr(response, "text") else str(response)

#         start = text.find("{")
#         end = text.rfind("}")
#         if start != -1 and end != -1:
#             text = text[start:end+1]

#         payload = json.loads(text)

#         return jsonify({
#             "disease": disease,
#             "recommended_fertilizer": payload.get("recommended_fertilizer", ""),
#             "procedure": payload.get("procedure", ""),
#             "prevention": payload.get("prevention", "")
#         })

#     except Exception as e:
#         traceback.print_exc()
#         return jsonify({
#             "error": "Gemini failed",
#             "details": str(e)
#         }), 500

# if __name__ == "__main__":
#     port = int(os.environ.get("PORT", 10000))
#     app.run(host="0.0.0.0", port=port)

# if __name__ == "__main__":
#     app.run(port=5001, debug=True)