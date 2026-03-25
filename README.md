# 🌿 AI-Based Plant Disease Detection & Recommendation System

An AI-powered full-stack web application that detects plant diseases from leaf images and provides intelligent recommendations using Generative AI.

This system helps farmers and agricultural users identify plant diseases quickly and receive suggestions for prevention, fertilizers, pesticides, and recovery.

---

# 🚀 Features

## 🧠 AI Disease Detection

* Upload plant leaf image
* Detect disease using trained `.keras` deep learning model
* Display predicted disease name
* Show confidence score

## 🤖 AI-Based Recommendations

Using Gemini API, the system provides:

* 🌿 Disease Explanation
* ⚠️ Causes
* 🛡 Prevention Methods
* 💊 Fertilizers Recommendation
* 🧪 Pesticides Suggestion
* ⏳ Recovery Time
* 💡 Extra Tips

## 🔐 Authentication

* Firebase Email/Password Login
* Signup functionality
* Protected dashboard
* Logout feature

## 📊 Prediction History

* Store predictions in Firebase Firestore
* View previous reports
* Track plant health

## 🎨 Modern UI

* Responsive design
* Drag & drop image upload
* Image preview
* Loading animation
* Confidence progress bar
* Dark / Light mode

---

# 🏗️ System Architecture

Frontend (React.js)
⬇
Node.js Backend
⬇
Python API (.keras Model)
⬇
Gemini API
⬇
Firebase (Auth + Firestore)

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Tailwind CSS
* Axios
* Framer Motion

## Backend

* Node.js
* Express.js

## AI / ML

* TensorFlow / Keras
* Python Flask API
* .keras trained model

## AI Integration

* Google Gemini API

## Database & Authentication

* Firebase Authentication
* Firebase Firestore

---

# 📁 Project Structure

```
project-root/
│
├── frontend/
│   └── React Application
│
├── backend/
│   └── Node.js Server
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
```

---

# 🔄 Application Workflow

1. User logs in
2. Upload plant image
3. Image sent to backend
4. Backend sends to Python API
5. Model predicts disease
6. Gemini API generates recommendations
7. Results displayed to user
8. Data stored in Firebase

---

# ⚙️ Installation

## 1️⃣ Clone Repository

```
git clone https://github.com/yourusername/plant-disease-detection.git
cd plant-disease-detection
```

---

## 2️⃣ Install Frontend

```
cd frontend
npm install
npm start
```

---

## 3️⃣ Install Backend

```
cd backend
npm install
node server.js
```

---

## 4️⃣ Python API Setup

```
cd python-api
pip install -r requirements.txt
python app.py
```

---

# 🔑 Environment Variables

Create `.env` file in backend:

```
GEMINI_API_KEY=your_api_key
FIREBASE_API_KEY=your_key
```

---

# 📊 Output Example

```
Disease: Tomato Leaf Blight
Confidence: 94%

Explanation:
Leaf Blight is a fungal disease...

Prevention:
Avoid overwatering...

Fertilizer:
Use nitrogen-based fertilizer...

Recovery Time:
7-14 days
```

---

# 💡 Future Enhancements

* Multi-language support
* Voice assistance
* Mobile app
* Weather-based prediction
* Offline mode

---

# 🎯 Use Cases

* Farmers
* Agriculture Students
* Researchers
* Agricultural Experts

---

# 🏆 Project Highlights

✔ AI + Full Stack Integration
✔ Real-world agriculture problem
✔ Smart recommendations system
✔ Clean UI/UX
✔ Scalable architecture

---

# 👨‍💻 Author

Sahbaz Siddique

---

# 📜 License

This project is open-source and available under the MIT License.

---

# ⭐ If you like this project

Give it a ⭐ on GitHub
