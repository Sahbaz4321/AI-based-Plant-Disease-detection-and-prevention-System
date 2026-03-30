# AI-Based Plant Disease Detection & Recommendation System

Detect plant diseases from leaf images, generate AI-powered care recommendations, and create shareable reports from a modern full-stack application.

## Overview

This project is built to solve a practical agricultural problem: helping users identify plant diseases quickly and respond with better treatment decisions.

The system combines deep learning for image-based disease detection, Generative AI for detailed recommendations, and Firebase for authentication and history tracking.

## Highlights

- AI-based leaf disease detection using a trained Keras model
- Confidence score for every prediction
- AI-generated recommendations for treatment and prevention
- Downloadable and shareable reports
- Firebase authentication and user-specific history
- Responsive UI for desktop and mobile

## Core Features

### Disease Detection

- Upload a plant leaf image
- Predict the disease from the trained model
- Display the predicted class with confidence
- Support a dataset trained on 87,000+ images and 38 disease classes

### AI Recommendations

The recommendation engine generates:

- Disease explanation
- Likely causes
- Prevention methods
- Fertilizer suggestions
- Pesticide suggestions
- Expected recovery time
- Extra care tips

### Report Management

- Generate structured reports after prediction
- Download reports as PDF
- Share results easily

### User Experience

- Secure login and signup with Firebase
- Protected dashboard
- Prediction history tracking
- Clean and responsive interface
- Dark and light theme support

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, Axios |
| Backend | Node.js, Express |
| ML API | Flask, TensorFlow, Keras |
| AI Integration | Google Gemini API |
| Auth & Database | Firebase Authentication, Firestore |
| Reporting | jsPDF, html2canvas |

## Architecture

```text
React Frontend
    |
    v
Node / Express Backend
    |
    +--> Flask Prediction API
    |        |
    |        v
    |    Keras Model
    |
    +--> Gemini AI Recommendations
    |
    v
Firebase Auth + Firestore
```

## Project Structure

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

## Workflow

1. User signs in to the application.
2. A plant leaf image is uploaded from the dashboard.
3. The backend forwards the image for model inference.
4. The ML pipeline predicts the disease and confidence score.
5. Gemini generates treatment and prevention guidance.
6. The result is shown in the UI and can be downloaded or shared.
7. Prediction history is saved for later access.

## Installation

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

### 3. Start the Node backend

```bash
cd backend
npm install
npm start
```

### 4. Start the Flask prediction API

Open a second terminal:

```bash
cd backend
pip install -r requirements.txt
python app.py
```

## Environment Variables

Create a `.env` file in `backend/` and add the required keys:

```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_API_KEY=your_firebase_api_key
```

Add any other Firebase configuration values used by your frontend setup as needed.

## Example Output

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
```

## Use Cases

- Farmers and field workers
- Agriculture students
- Plant disease researchers
- Agritech demo projects
- Smart farming solutions

## Future Scope

- Multi-language support
- Voice-based guidance
- Mobile application
- Weather-aware recommendations
- Offline prediction mode

## Why This Project Stands Out

- Combines computer vision, Generative AI, and full-stack development
- Solves a real-world agriculture use case
- Produces actionable recommendations, not just predictions
- Tracks user history for better plant health monitoring
- Ready to be extended into a larger agritech platform

## Author

Sahbaz Siddique

## Support

If you like this project, consider starring the repository and sharing it with others.
