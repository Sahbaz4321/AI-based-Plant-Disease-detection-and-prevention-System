const express = require("express");
const multer = require("multer");
const cors = require("cors");
const dotenv = require("dotenv");
const tf = require("@tensorflow/tfjs");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/tfjs_model", express.static(path.join(__dirname, "tfjs_model")));

const upload = multer({ storage: multer.memoryStorage() });

const PORT = process.env.PORT || 5001;
const IMG_SIZE = 224;

let model = null;
let classes = [];

// -------------------------
// Load classes
// -------------------------
function loadClasses() {
  const classesPath = path.join(__dirname, "classes.json");
  const data = JSON.parse(fs.readFileSync(classesPath, "utf-8"));

  if (Array.isArray(data)) {
    classes = data;
  } else {
    classes = Object.keys(data)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => data[k]);
  }

  console.log("Classes loaded:", classes.length);
}

// -------------------------
// Load model via local HTTP
// -------------------------
async function loadModel() {
  const modelUrl = `http://127.0.0.1:${PORT}/tfjs_model/model.json`;
  model = await tf.loadLayersModel(modelUrl);
  console.log("Model loaded");
}

// -------------------------
// Preprocess
// -------------------------
async function preprocessImage(buffer) {
  const { data, info } = await sharp(buffer)
    .resize(IMG_SIZE, IMG_SIZE)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return tf.tidy(() => {
    let tensor = tf.tensor3d(new Uint8Array(data), [info.height, info.width, info.channels]);
    tensor = tensor.toFloat();
    tensor = tensor.div(127.5).sub(1); // EfficientNet preprocess
    return tensor.expandDims(0);
  });
}

// -------------------------
// Routes
// -------------------------
app.get("/", (req, res) => {
  res.json({
    message: "Node API running",
    modelLoaded: !!model
  });
});

app.post("/predict", upload.array("images"), async (req, res) => {
  try {
    if (!model) {
      return res.status(503).json({ error: "Model not loaded yet" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    const results = [];

    for (const file of req.files) {
      const input = await preprocessImage(file.buffer);
      const pred = model.predict(input);
      const data = await pred.data();

      const scores = Array.from(data);
      const idx = scores.indexOf(Math.max(...scores));

      results.push({
        filename: file.originalname,
        predicted_class: classes[idx] || `Class_${idx}`,
        confidence: Number(scores[idx].toFixed(6))
      });

      input.dispose();
      pred.dispose();
    }

    return res.json(results);
  } catch (err) {
    console.error("Prediction error:", err);
    return res.status(500).json({
      error: "Prediction failed",
      details: err.message
    });
  }
});

app.post("/explain-disease", async (req, res) => {
  try {
    const { disease } = req.body || {};

    if (!disease) {
      return res.status(400).json({ error: "Missing disease" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY not found in .env" });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const prompt = `
You are an expert agronomist. Briefly explain how to handle the following plant disease for a farmer.

Disease name: ${disease}

Return ONLY valid JSON in this exact shape:
{
  "recommended_fertilizer": "short fertilizer recommendation in 1-2 sentences",
  "procedure": "step-by-step treatment procedure in 2-4 short sentences",
  "prevention": "preventive measures in 2-4 short sentences"
}
Do not include any extra text outside JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    let text = response.text || "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      return res.status(500).json({
        error: "Gemini returned invalid format",
        raw: text
      });
    }

    text = text.slice(start, end + 1);
    const data = JSON.parse(text);

    return res.json({
      disease,
      recommended_fertilizer: data.recommended_fertilizer || "",
      procedure: data.procedure || "",
      prevention: data.prevention || ""
    });
  } catch (err) {
    console.error("Gemini error:", err);
    return res.status(500).json({
      error: "Gemini failed",
      details: err.message
    });
  }
});

// -------------------------
// Start
// -------------------------
async function start() {
  try {
    loadClasses();

    app.listen(PORT, async () => {
      console.log(`Server running on ${PORT}`);

      try {
        await loadModel();
      } catch (err) {
        console.error("Model load error:", err);
      }
    });
  } catch (err) {
    console.error("Startup error:", err);
  }
}

start();



// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const { diseaseData } = require('./mockData')

// const app = express();
// app.use(cors());
// app.use(express.json());

// const upload = multer({ dest: "uploads/" });

// // Home route
// app.get("/", (req, res) => {
//   res.send("AgroScan Backend is Running 🌱");
// });

// // API: Dashboard info
// app.get("/api/dashboard", (req, res) => {
//   res.json({
//     message: "Welcome to AgroScan Dashboard",
//     user: "Farmer Rahul",
//     farmLocation: "Maharashtra, India",
//     cropsMonitored: 4,
//   });
// });

// // API: Soil and crop info
// app.get("/api/soil-info", (req, res) => {
//   res.json({
//     soilMoisture: "45%",
//     soilType: "Loamy",
//     recommendedFertilizer: "Urea",
//     preventionTips: [
//       "Avoid overwatering",
//       "Rotate crops regularly",
//       "Use organic manure",
//     ],
//   });
// });

// // API: Upload crop image (mock detection)
// app.post("/api/upload", upload.single("image"), (req, res) => {
//   const random = Math.floor(Math.random() * diseaseData.length);
//   res.json(diseaseData[random]);
// });

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
