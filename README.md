🌿 AI-Based Plant Disease Detection & Recommendation System

An AI-powered full-stack web application that detects plant diseases from leaf images and provides intelligent recommendations using Generative AI.

This system helps farmers and agricultural users identify plant diseases quickly and receive suggestions for prevention, fertilizers, pesticides, and recovery.

🚀 Features
🧠 AI Disease Detection
Upload plant leaf image
Detect disease using trained .keras deep learning model
Display predicted disease name
Show confidence score
🤖 AI-Based Recommendations

Using Gemini API, the system provides:

🌿 Disease Explanation
⚠️ Causes
🛡 Prevention Methods
💊 Fertilizers Recommendation
🧪 Pesticides Suggestion
⏳ Recovery Time
💡 Extra Tips
📄 Report Management
📥 Download report as PDF
📤 Share report with others
Structured report including disease details, confidence, and recommendations
🔐 Authentication
Firebase Email/Password Login
Signup functionality
Protected dashboard
Logout feature
📊 Prediction History
Store predictions in Firebase Firestore
View previous reports
Track plant health
🎨 Modern UI
Responsive design
Drag & drop image upload
Image preview
Loading animation
Confidence progress bar
Dark / Light mode
🧠 Dataset & Model
Trained on 87,000+ leaf images
Covers 38 different plant disease classes
Model built using TensorFlow & Keras (EfficientNet-based architecture)
Provides high accuracy and reliable predictions
🏗️ System Architecture

Frontend (React.js)
⬇
Python Flask API (Model Prediction)
⬇
Gemini API (AI Recommendations)
⬇
Firebase (Authentication + Firestore)

🛠️ Tech Stack
Frontend
React.js
Tailwind CSS
Axios
Framer Motion
Backend / API
Python Flask API
AI / ML
TensorFlow / Keras
EfficientNet Model
.keras trained model
AI Integration
Google Gemini API
Database & Authentication
Firebase Authentication
Firebase Firestore
📁 Project Structure
project-root/
│
├── frontend/
│   └── React Application
│
├── python-api/
│   └── Flask API
│
├── models/
│   ├── model.keras
│   └── classes.json
│
└── firebase/
    └── Firebase Config
🔄 Application Workflow
User logs in
Upload plant image
Image sent to Flask API
Model predicts disease
Gemini API generates recommendations
Results displayed to user
User can download report as PDF or share it
Data stored in Firebase
⚙️ Installation
1️⃣ Clone Repository
git clone https://github.com/yourusername/plant-disease-detection.git
cd plant-disease-detection
2️⃣ Install Frontend
cd frontend
npm install
npm start
3️⃣ Python API Setup
cd python-api
pip install -r requirements.txt
python app.py
🔑 Environment Variables

Create .env file:

GEMINI_API_KEY=your_api_key
FIREBASE_API_KEY=your_key
📊 Output Example
Disease: Tomato Leaf Blight
Confidence: 94%

Explanation:
Leaf Blight is a fungal disease affecting plant leaves...

Causes:
High humidity and fungal infection...

Prevention:
Avoid overwatering and maintain airflow...

Fertilizer:
Use nitrogen-based fertilizer...

Recovery Time:
7–14 days

[Download PDF]   [Share Report]
💡 Future Enhancements
Multi-language support
Voice assistance
Mobile application
Weather-based disease prediction
Offline mode
🎯 Use Cases
Farmers
Agriculture Students
Researchers
Agricultural Experts
🏆 Project Highlights

✔ AI + Full Stack Integration
✔ Real-world agriculture problem
✔ Smart recommendations system
✔ PDF Report Generation & Sharing
✔ Clean UI/UX
✔ Scalable architecture

👨‍💻 Author

Sahbaz Siddique

📜 License

This project is open-source and available under the MIT License.

⭐ If you like this project

Give it a ⭐ on GitHub 🚀

Bhai agar tu next level jaana chahta hai 🔥
👉 main tujhe README me badges + screenshots + demo GIF + live demo section bhi add karke de sakta hoon (ye recruiters ko impress karta hai 💯)

Bol de 👍

lekin badiya bana color ful bana 

Samajh gaya bhai 🔥 tu ekdum GitHub pe dekhte hi impress ho jaaye wali README chahta hai — color, badges, style sab 🔥

Ye le ULTRA-PRO COLORFUL README 🚀👇

🌿 AI-Based Plant Disease Detection & Recommendation System
<p align="center"> <img src="https://img.shields.io/badge/AI-Powered-green?style=for-the-badge&logo=leaflet"/> <img src="https://img.shields.io/badge/React-Frontend-blue?style=for-the-badge&logo=react"/> <img src="https://img.shields.io/badge/Python-Flask-yellow?style=for-the-badge&logo=python"/> <img src="https://img.shields.io/badge/Firebase-Database-orange?style=for-the-badge&logo=firebase"/> <img src="https://img.shields.io/badge/Model-EfficientNet-red?style=for-the-badge"/> </p> <p align="center"> 🌱 Detect plant diseases • 🤖 Get AI recommendations • 📄 Download & Share Reports </p>
🚀 About the Project

An AI-powered full-stack web application that detects plant diseases from leaf images and provides intelligent recommendations using Generative AI.

👉 Built to solve real-world agricultural problems and help farmers make better decisions.

✨ Features
🧠 AI Disease Detection
📸 Upload plant leaf image
🔍 Detect disease using trained .keras model
📊 Confidence score display
🤖 AI Smart Recommendations
🌿 Disease Explanation
⚠️ Causes
🛡 Prevention
💊 Fertilizers
🧪 Pesticides
⏳ Recovery Time
💡 Extra Tips
📄 Report Management
📥 Download PDF Report
📤 Share report easily
📊 Structured & clean report
🔐 Authentication
🔑 Firebase Login / Signup
🔒 Secure dashboard
📊 History Tracking
🧾 Save previous predictions
📈 Track plant health
🎨 Modern UI
🌙 Dark / Light Mode
📱 Fully Responsive
⚡ Smooth Animations
🧠 Dataset & Model

🚀 Trained on:

87,000+ Leaf Images 🌿
38 Disease Classes 🦠

⚙️ Model:

EfficientNet-based deep learning model
Built using TensorFlow & Keras
🏗️ Architecture
React Frontend
      ↓
Flask API (Model)
      ↓
Gemini AI
      ↓
Firebase (Auth + DB)
🛠️ Tech Stack
Category	Technologies
🎨 Frontend	React, Tailwind CSS, Axios, Framer Motion
⚙️ Backend/API	Python Flask
🤖 AI/ML	TensorFlow, Keras, EfficientNet
🧠 AI Integration	Gemini API
🔐 Database	Firebase Auth & Firestore
📁 Project Structure
project-root/
│
├── frontend/
├── python-api/
├── models/
└── firebase/
🔄 Workflow
Login → Upload Image → AI Prediction → Gemini Recommendation → Result → PDF/Share → Save to Firebase
⚙️ Installation
# Clone
git clone https://github.com/yourusername/plant-disease-detection.git

# Frontend
cd frontend
npm install
npm start

# Python API
cd python-api
pip install -r requirements.txt
python app.py
🔑 Environment Variables
GEMINI_API_KEY=your_api_key
FIREBASE_API_KEY=your_key
📊 Example Output
🌿 Disease: Tomato Leaf Blight
📊 Confidence: 94%

⚠️ Causes:
Fungal infection due to humidity

🛡 Prevention:
Avoid overwatering

💊 Fertilizer:
Nitrogen-based fertilizer

⏳ Recovery:
7–14 days

📄 [Download PDF]   📤 [Share]
💡 Future Scope
🌐 Multi-language support
🎙 Voice assistant
📱 Mobile App
🌦 Weather-based prediction
📶 Offline mode
🎯 Use Cases

👨‍🌾 Farmers
🎓 Students
🔬 Researchers
🌱 Agriculture Experts

🏆 Highlights

✔ AI + Full Stack
✔ Real-world impactful project
✔ PDF Reports + Sharing
✔ Clean UI/UX
✔ Scalable

👨‍💻 Author

Sahbaz Siddique

⭐ Support

If you like this project:

👉 Give it a ⭐ on GitHub
👉 Share with others
