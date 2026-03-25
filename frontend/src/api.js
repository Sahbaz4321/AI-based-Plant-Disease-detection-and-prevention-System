// import axios from "axios";

// // Existing Node backend (dashboard, soil, etc.)
// // export const API = axios.create({ baseURL: "http://localhost:5000/api" });

// // Python model API (trained EfficientNet model)
// // export const ModelAPI = axios.create({ baseURL: "http://localhost:5001" });

// export const ModelAPI = axios.create({ baseURL: "https://plant-disease-backend-1hoq.onrender.com/" });

// export default API;

import axios from "axios";

// Node backend (dashboard, soil, etc.)
export const API = axios.create({
  baseURL: process.env.REACT_APP_NODE_API || "http://localhost:5000/api",
});

// Python model API
export const ModelAPI = axios.create({
  baseURL:
    process.env.REACT_APP_MODEL_API ||
    "https://plant-disease-backend-1hoq.onrender.com",
});

export default API;