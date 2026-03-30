# AI-Based Plant Disease Detection & Recommendation System

<p align="center">
  <img src="https://img.shields.io/badge/AI-Powered-green?style=for-the-badge&logo=leaflet"/>
  <img src="https://img.shields.io/badge/React-Frontend-blue?style=for-the-badge&logo=react"/>
  <img src="https://img.shields.io/badge/Python-Flask-yellow?style=for-the-badge&logo=python"/>
  <img src="https://img.shields.io/badge/Firebase-Database-orange?style=for-the-badge&logo=firebase"/>
  <img src="https://img.shields.io/badge/Model-EfficientNet-black?style=for-the-badge"/>
</p>

<p align="center">
  :seedling: Detect plant diseases • :robot: Get AI recommendations • :page_facing_up: Download & Share Reports
</p>

<p align="center">
  An AI-powered full-stack agriculture project for smart plant disease detection, recommendation generation, and PDF-based reporting.
</p>

## :rocket: Overview

This project is built to solve a practical agricultural problem by helping users identify plant diseases quickly and take better treatment decisions.

The core backend is built with Python Flask for plant disease prediction, while the overall system also uses Node.js where needed for orchestration and request handling. The platform combines deep learning, Generative AI, and Firebase services into one modern workflow.

## :sparkles: Highlights

- :herb: AI-based leaf disease detection using a trained Keras model
- :bar_chart: Confidence score for every prediction
- :robot: AI-generated recommendations for treatment and prevention
- :page_facing_up: Downloadable report in `.pdf` format
- :lock: Firebase authentication and prediction history
- :iphone: Responsive UI for desktop and mobile

## :jigsaw: Core Features

### :brain: AI Disease Detection

- :camera_flash: Upload a plant leaf image
- :mag: Detect disease using the trained EfficientNet-based model
- :label: Show predicted class with confidence score
- :seedling: Support a dataset trained on 87,000+ images across 38 disease classes

### :robot: Smart Recommendations

After prediction, the system generates:

- :herb: Disease explanation
- :warning: Causes
- :shield: Prevention methods
- :pill: Fertilizer suggestions
- :test_tube: Pesticide suggestions
- :hourglass_flowing_sand: Recovery time
- :bulb: Extra care tips

### :page_facing_up: Report Management

- Generate a structured result summary
- Download the final report in `.pdf` format
- Share prediction results easily

### :art: User Experience

- :lock: Secure login and signup with Firebase
- :compass: Protected dashboard
- :clock3: Prediction history tracking
- :sparkles: Clean and responsive interface
- :crescent_moon: Dark and light theme support

## :camera: Application Preview

### Dashboard

 

<img width="1909" height="909" alt="Screenshot 2026-03-30 231251" src="https://github.com/user-attachments/assets/5ad09786-8825-46c2-9218-cacd1b907909" />




### Scan Upload

 
<img width="1907" height="909" alt="Screenshot 2026-03-30 232942" src="https://github.com/user-attachments/assets/96e9aad9-7e71-4e7a-b2ef-6f54a5137240" />

### Analysis Result and PDF Report

Detailed AI analysis with treatment suggestions, prevention strategy, and one-click PDF report download.

<img width="1910" height="915" alt="Screenshot 2026-03-30 233144" src="https://github.com/user-attachments/assets/97c4614c-35a8-4241-8a07-2783793e4af8" />

### Soil Information

<img width="1904" height="895" alt="Screenshot 2026-03-30 233239" src="https://github.com/user-attachments/assets/e270c8cb-85b7-48bb-8b0e-7106232badec" />

### Reports Library

<img width="1914" height="938" alt="Screenshot 2026-03-30 233403" src="https://github.com/user-attachments/assets/9fce0793-cf3d-40ba-9cdf-5c112ae83e9e" />

### Additional Screens

Profile

![Profile](./screenshots/profile.png)
<img width="1909" height="903" alt="profile" src="https://github.com/user-attachments/assets/36d1a424-ce34-4fd1-a107-26193e991c23" />

Feedback

<img width="1912" height="907" alt="Screenshot 2026-03-30 233334" src="https://github.com/user-attachments/assets/5a57a679-1cea-4abc-9a33-ea593073e2d1" />

Login

<img width="1915" height="911" alt="Screenshot 2026-03-30 230758" src="https://github.com/user-attachments/assets/c010591c-acdd-4740-96ff-95ee4ab49a20" />

Sign Up

<img width="1905" height="911" alt="Screenshot 2026-03-30 230828" src="https://github.com/user-attachments/assets/aea9cf87-7222-4f5f-b8df-511612e3adb2" />

## :hammer_and_wrench: Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, Axios |
| Backend | Python Flask, Node.js, Express |
| AI / ML | TensorFlow, Keras, EfficientNet |
| AI Integration | Google Gemini API |
| Auth & Database | Firebase Authentication, Firestore |
| Reporting | jsPDF, html2canvas |

## :classical_building: System Architecture

```text
React Frontend
    |
    v
Python Flask Backend
    |
    +--> EfficientNet / Keras Model
    |
    +--> Gemini AI Recommendation Layer
    |
    +--> PDF Report Generation
    |
    v
Firebase Auth + Firestore

Supporting Service:
Node / Express is used in the project for request handling and integration support.
```

## :file_folder: Project Structure

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

## :arrows_clockwise: Workflow

1. User logs in to the application.
2. A plant leaf image is uploaded from the dashboard.
3. The Python backend processes the image and runs model inference.
4. The system predicts the disease and confidence score.
5. Gemini generates smart recommendations for treatment and prevention.
6. The result is displayed in the UI and can be exported as a `.pdf` report.
7. Prediction history is stored for future tracking.

## :gear: Installation

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

## :key: Environment Variables

Create a `.env` file in `backend/` and add the required keys:

```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_API_KEY=your_firebase_api_key
```

Add any other Firebase configuration values used by your frontend setup as needed.

## :bar_chart: Example Output

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

## :dart: Use Cases

- Farmers and field workers
- Agriculture students
- Plant disease researchers
- Agritech demo projects
- Smart farming solutions

## :bulb: Future Scope

- Multi-language support
- Voice-based guidance
- Mobile application
- Weather-aware recommendations
- Offline prediction mode

## :trophy: Why This Project Stands Out

- Combines computer vision, Generative AI, and full-stack development
- Uses a Python-based backend for real plant disease prediction
- Produces actionable recommendations, not just disease names
- Generates downloadable PDF reports for practical sharing
- Ready to scale into a larger agritech platform

## :man_technologist: Author

Sahbaz Siddique

## :star: Support

If you like this project, consider starring the repository and sharing it with others.
