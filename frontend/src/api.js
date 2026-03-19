import axios from "axios";

// Existing Node backend (dashboard, soil, etc.)
export const API = axios.create({ baseURL: "http://localhost:5000/api" });

// Python model API (trained EfficientNet model)
export const ModelAPI = axios.create({ baseURL: "http://localhost:5001" });

export default API;
