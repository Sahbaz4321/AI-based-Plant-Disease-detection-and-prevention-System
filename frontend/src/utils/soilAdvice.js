// Fallback logic for generating smart soil advice based on crop and disease.
export const generateYieldAdvice = (disease) => {
  const d = disease ? disease.toLowerCase() : "";
  
  if (d.includes("blight") || d.includes("rot") || d.includes("mold")) {
    return {
      type: "Well-drained Loam Soil",
      fertility: "Risk of Pathogen Build-up",
      fertilizer: "High Phosphorus & Potassium Mix (e.g. 5-10-10)",
      action: "Avoid over-watering. Rotate crops immediately and increase soil drainage. Apply fungicides strictly.",
      healthScore: 45
    };
  } else if (d.includes("healthy")) {
    return {
      type: "Rich Organic Loam",
      fertility: "Highly Fertile",
      fertilizer: "Balanced NPK (e.g. 10-10-10) or Organic Compost",
      action: "Maintain current irrigation and fertilizing schedules. Excellent crop and soil condition.",
      healthScore: 90
    };
  } else if (d.includes("rust") || d.includes("spot")) {
    return {
      type: "Sandy Loam",
      fertility: "Moderate - Nitrogen Deficiency likely",
      fertilizer: "Nitrogen-Rich Fertilizer (e.g. 20-5-5)",
      action: "Increase spacing for airflow. Provide rich compost and ensure leaves stay dry during watering.",
      healthScore: 65
    };
  }
  
  // Default generic
  return {
    type: "Standard Loam / Clay Loam",
    fertility: "Unknown / Variable",
    fertilizer: "Balanced All-Purpose Crop Fertilizer",
    action: "Run an AI scan on your crops to receive customized soil yield improvements and fertilizer types.",
    healthScore: 50
  };
};
