const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { diseaseData } = require('./mockData')

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// Home route
app.get("/", (req, res) => {
  res.send("AgroScan Backend is Running 🌱");
});

// API: Dashboard info
app.get("/api/dashboard", (req, res) => {
  res.json({
    message: "Welcome to AgroScan Dashboard",
    user: "Farmer Rahul",
    farmLocation: "Maharashtra, India",
    cropsMonitored: 4,
  });
});

// API: Soil and crop info
app.get("/api/soil-info", (req, res) => {
  res.json({
    soilMoisture: "45%",
    soilType: "Loamy",
    recommendedFertilizer: "Urea",
    preventionTips: [
      "Avoid overwatering",
      "Rotate crops regularly",
      "Use organic manure",
    ],
  });
});

// API: Upload crop image (mock detection)
app.post("/api/upload", upload.single("image"), (req, res) => {
  const random = Math.floor(Math.random() * diseaseData.length);
  res.json(diseaseData[random]);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
