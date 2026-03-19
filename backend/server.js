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

// app.post('/api/upload', upload.array('images', 10), async (req, res) => {
//   const files = req.files;

//   if (!files || files.length === 0) {
//     return res.status(400).json({ error: 'No images uploaded' });
//   }

//   const formData = new FormData();

//   files.forEach(file => {
//     formData.append('images', fs.createReadStream(file.path)); // ✅ same name
//   });

//   try {
//     const response = await axios.post('http://localhost:5001/predict', formData, {
//       headers: formData.getHeaders(),
//     });

//     res.json(response.data);
//   } catch (err) {
//     console.error('Error:', err.message);
//     res.status(500).json({ error: 'API error' });
//   } finally {
//     files.forEach(file => fs.unlink(file.path, () => {}));
//   }
// });

// const PORT = 5000;
// app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
