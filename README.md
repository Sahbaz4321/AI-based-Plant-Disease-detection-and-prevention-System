# AI-Based Plant Disease Detection & Recommendation System

<p align="center">
  <img src="https://img.shields.io/badge/AI-Powered-green?style=for-the-badge&logo=leaflet"/>
  <img src="https://img.shields.io/badge/React-Frontend-blue?style=for-the-badge&logo=react"/>
  <img src="https://img.shields.io/badge/Python-Flask-yellow?style=for-the-badge&logo=python"/>
  <img src="https://img.shields.io/badge/Firebase-Database-orange?style=for-the-badge&logo=firebase"/>
  <img src="https://img.shields.io/badge/Model-EfficientNet-black?style=for-the-badge"/>
</p>

<p align="center">
  🌱 Detect plant diseases • 🤖 Get AI recommendations • 📄 Download & Share Reports
</p>

<p align="center">
  An AI-powered full-stack agriculture project for smart plant disease detection, recommendation generation, and PDF-based reporting.
</p>

## 🚀 Overview

This project is built to solve a practical agricultural problem: helping users identify plant diseases quickly and respond with better treatment decisions.

The system combines a Python Flask prediction backend, deep learning for image-based disease detection, Generative AI for detailed recommendations, and Firebase for authentication and history tracking.

## ✨ Highlights

- 🌿 AI-based leaf disease detection using a trained Keras model
- 📊 Confidence score for every prediction
- 🤖 AI-generated recommendations for treatment and prevention
- 📄 Downloadable report in `.pdf` format
- 🔐 Firebase authentication and user-specific history
- 📱 Responsive UI for desktop and mobile

## 🧩 Core Features

### 🧠 Disease Detection

- 📸 Upload a plant leaf image
- 🔍 Predict the disease from the trained model
- 🏷 Display the predicted class with confidence
- 🌱 Support a dataset trained on 87,000+ images and 38 disease classes

### 🤖 AI Recommendations

The recommendation engine generates:

- 🌿 Disease explanation
- ⚠ Likely causes
- 🛡 Prevention methods
- 💊 Fertilizer suggestions
- 🧪 Pesticide suggestions
- ⏳ Expected recovery time
- 💡 Extra care tips

### 📄 Report Management

- Generate structured reports after prediction
- Download reports in `.pdf` format
- Share results easily with a clean summary layout

### 🎨 User Experience

- 🔐 Secure login and signup with Firebase
- 🧭 Protected dashboard
- 🕘 Prediction history tracking
- ✨ Clean and responsive interface
- 🌙 Dark and light theme support

## 🛠 Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, Axios |
| Backend | Python Flask, Node.js, Express |
| ML API | Flask, TensorFlow, Keras |
| AI Integration | Google Gemini API |
| Auth & Database | Firebase Authentication, Firestore |
| Reporting | jsPDF, html2canvas |

## 🏗 Architecture

```text
React Frontend
    |
    v
Python Flask Prediction Backend
    |
    +--> EfficientNet / Keras Model
    |
    +--> Gemini AI Recommendations
    |
    +--> PDF Report Generation
    |
    v
Firebase Auth + Firestore

Supporting Layer:
Node / Express is used in the project for request handling and orchestration where needed.
```

## 📁 Project Structure

```text
PlantDisease/
|-- frontend/
|   |-- src/
|   `-- package.json
|
|-- backend/
|   |-- app.py
|   |-- node-app.js
|   |-- predict_worker.py
|   |-- requirements.txt
|   |-- package.json
|   |-- classes.json
|   `-- final_model_fixed.keras
|
`-- README.md
```

## 🔄 Workflow

1. User signs in to the application.
2. A plant leaf image is uploaded from the dashboard.
3. The Python backend processes the image for model inference.
4. The ML pipeline predicts the disease and confidence score.
5. Gemini generates treatment and prevention guidance.
6. The result is shown in the UI and exported as a `.pdf` report when needed.
7. Prediction history is saved for later access.

## ⚙ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/plant-disease-detection.git
cd plant-disease-detection
```

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Start the supporting backend service

```bash
cd backend
npm install
npm start
```

### 4. Start the main Python backend

Open a second terminal:

```bash
cd backend
pip install -r requirements.txt
python app.py
```

## 🔑 Environment Variables

Create a `.env` file in `backend/` and add the required keys:

```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_API_KEY=your_firebase_api_key
```

Add any other Firebase configuration values used by your frontend setup as needed.

## 📊 Example Output

```text
Disease: Tomato Leaf Blight
Confidence: 94%

Cause:
Fungal infection encouraged by excess moisture and humidity.

Prevention:
Avoid overwatering, improve airflow, and remove infected leaves.

Suggested Fertilizer:
Balanced nitrogen support in controlled quantity.

Recovery Time:
7 to 14 days depending on severity and care.

Report:
Download available in PDF format
```

## 🎯 Use Cases

- 👨‍🌾 Farmers and field workers
- 🎓 Agriculture students
- 🔬 Plant disease researchers
- 💻 Agritech demo projects
- 🌍 Smart farming solutions

## 💡 Future Scope

- 🌐 Multi-language support
- 🎙 Voice-based guidance
- 📱 Mobile application
- ☁ Weather-aware recommendations
- 📡 Offline prediction mode

## 🏆 Why This Project Stands Out

- Combines computer vision, Generative AI, and full-stack development
- Uses a Python-based prediction backend for real ML inference
- Produces actionable recommendations, not just predictions
- Generates downloadable PDF reports for practical sharing
- Ready to be extended into a larger agritech platform

## 👨‍💻 Author

Sahbaz Siddique

## ⭐ Support

If you like this project, consider starring the repository and sharing it with others.
