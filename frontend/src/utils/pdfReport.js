import React from "react";

const formatDate = (date) =>
  date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const formatTime = (date) =>
  date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatFileSize = (size) => {
  if (!size && size !== 0) return "Not available";
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

export const parseDiseaseInfo = (rawStr) => {
  if (!rawStr) return { plant: "Unknown Crop", condition: "Unknown Condition" };
  const parts = rawStr.split("___");
  if (parts.length === 2) {
    return {
      plant: parts[0].replace(/_/g, " "),
      condition: parts[1].replace(/_/g, " "),
    };
  }
  return {
    plant: "Plant Scan",
    condition: rawStr.replace(/_/g, " "),
  };
};

export const getRecoveryEstimate = (diseaseName) => {
  const d = (diseaseName || "").toLowerCase();
  if (d.includes("healthy") || d.includes("none")) return "No treatment needed";
  if (d.includes("rust") || d.includes("blight")) return "7 - 14 days";
  if (d.includes("spot") || d.includes("mildew") || d.includes("scab")) return "7 - 14 days";
  if (d.includes("rot") || d.includes("virus") || d.includes("mosaic")) return "21 - 30+ days";
  return "10 - 15 days";
};

const getRiskLevel = (confidence = 0, diseaseName = "") => {
  const d = diseaseName.toLowerCase();
  if (d.includes("healthy") || d.includes("none")) return "Low";
  if (confidence >= 0.9) return "High";
  if (confidence >= 0.7) return "Medium";
  return "Low";
};

const getDiseaseExplanation = (diseaseName, cropName) => {
  const d = (diseaseName || "").toLowerCase();
  if (d.includes("healthy") || d.includes("none")) {
    return {
      what: `${cropName} currently appears healthy with no strong disease signal detected in the scanned image.`,
      why: "Healthy-looking crops generally result from balanced moisture, airflow, nutrition, and sanitation practices.",
      symptoms: "Leaf color and texture look stable, with no major lesions, rotting patterns, or widespread chlorosis.",
    };
  }
  if (d.includes("blight")) {
    return {
      what: `This disease is a fungal infection affecting ${cropName.toLowerCase()} foliage and reducing photosynthetic health.`,
      why: "It usually spreads in warm, humid conditions, especially when infected residue or splashing water is present.",
      symptoms: "Common symptoms include brown lesions, yellowing around spots, leaf drying, and progressive canopy decline.",
    };
  }
  if (d.includes("rust")) {
    return {
      what: `This disease is a fungal rust infection that damages ${cropName.toLowerCase()} leaves and weakens plant vigor.`,
      why: "It commonly develops under humidity, prolonged leaf wetness, and crowded crop spacing.",
      symptoms: "Common symptoms include rust-colored pustules, yellow patches, and premature leaf drop.",
    };
  }
  if (d.includes("spot") || d.includes("scab")) {
    return {
      what: `This disease causes visible spotting damage on ${cropName.toLowerCase()} tissues and can spread across the canopy.`,
      why: "It often appears due to moisture stress, pathogen presence, and poor field hygiene.",
      symptoms: "Common symptoms include circular spots, dark margins, discoloration, and affected leaf texture.",
    };
  }
  if (d.includes("mildew") || d.includes("mold")) {
    return {
      what: `This disease is associated with fungal surface growth on ${cropName.toLowerCase()} leaves and tender plant parts.`,
      why: "It spreads quickly in humid, low-airflow environments with repeated moisture exposure.",
      symptoms: "Common symptoms include powdery or fuzzy growth, curling leaves, and weakened new growth.",
    };
  }
  if (d.includes("rot")) {
    return {
      what: `This disease indicates tissue rot affecting ${cropName.toLowerCase()} health and increasing crop loss risk.`,
      why: "It is commonly triggered by persistent moisture, infected soil, and poor drainage conditions.",
      symptoms: "Common symptoms include soft tissue breakdown, dark decay, wilting, and foul-smelling infected areas.",
    };
  }
  return {
    what: `This scan suggests a likely ${diseaseName.toLowerCase()} condition affecting ${cropName.toLowerCase()} health.`,
    why: "It may develop due to pathogen pressure, unfavorable moisture conditions, or weak crop protection practices.",
    symptoms: "Common symptoms include discoloration, lesion development, reduced leaf quality, and stressed plant growth.",
  };
};

const getPossibleCauses = (diseaseName) => {
  const d = (diseaseName || "").toLowerCase();
  if (d.includes("healthy") || d.includes("none")) {
    return [
      "Current crop management appears stable",
      "Moisture and airflow balance may be adequate",
      "No major infection signature is visible",
      "Routine monitoring should continue",
    ];
  }
  const causes = ["Excess moisture", "Poor air circulation", "Infected soil or residue", "Lack of proper crop care"];
  if (d.includes("virus") || d.includes("mosaic")) causes[2] = "Vector spread from infected plants";
  if (d.includes("rot")) causes[0] = "Waterlogged soil and over-irrigation";
  return causes;
};

const splitAdvice = (text, fallback) => {
  if (!text) return fallback;
  const parts = text
    .split(/[\n.;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return parts.length ? parts.slice(0, 4) : fallback;
};

const getPesticides = (diseaseName) => {
  const d = (diseaseName || "").toLowerCase();
  if (d.includes("healthy") || d.includes("none")) {
    return ["No immediate pesticide use required", "Continue preventive field hygiene", "Use neem-based treatment only if symptoms emerge"];
  }
  if (d.includes("blight") || d.includes("spot") || d.includes("scab")) {
    return ["Mancozeb", "Copper-based fungicide", "Chlorothalonil or labelled contact fungicide"];
  }
  if (d.includes("mildew") || d.includes("mold")) {
    return ["Sulfur-based fungicide", "Copper-based fungicide", "Neem-based treatment"];
  }
  if (d.includes("rust")) {
    return ["Propiconazole", "Mancozeb", "Neem-based supportive treatment"];
  }
  return ["Copper-based fungicide", "Neem-based treatment", "Use a crop-labelled protective spray if symptoms persist"];
};

export const buildPdfReportData = ({
  scan,
  index = 0,
  reportName,
  userName,
  generatedAt = new Date(),
  scanSource = "Upload",
}) => {
  const info = parseDiseaseInfo(scan.disease || reportName);
  const confidence = typeof scan.confidence === "number" ? scan.confidence : 0;
  const explanation = getDiseaseExplanation(info.condition, info.plant);
  const prevention = splitAdvice(scan.prevention, [
    "Use disease-free seeds or clean planting material",
    "Avoid overwatering and reduce leaf wetness",
    "Maintain proper plant spacing for airflow",
    "Remove infected leaves early",
  ]);
  const fertilizer = splitAdvice(scan.fertilizer, [
    "Balanced NPK fertilizer",
    "Potassium-rich fertilizer",
    "Organic compost support",
  ]);
  const procedure = splitAdvice(scan.procedure, [
    "Apply the recommended treatment immediately",
    "Isolate infected leaves or plants when needed",
    "Repeat treatment as advised after 5-7 days",
  ]);
  const pesticides = getPesticides(info.condition);
  const causes = getPossibleCauses(info.condition);
  const recovery = getRecoveryEstimate(info.condition);
  const risk = getRiskLevel(confidence, info.condition);
  const reportId = `AGR-${generatedAt
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")}-${String(index + 1).padStart(3, "0")}`;

  return {
    title: "AgroScan - Plant Disease Detection Report",
    reportId,
    generatedDate: formatDate(generatedAt),
    generatedTime: formatTime(generatedAt),
    userName: userName || "Sahbaz",
    cropName: info.plant,
    diseaseName: info.condition,
    imageSrc: scan.thumbBase64 || scan.preview || null,
    fileName: scan.filename || reportName || "Scanned image",
    fileSize: formatFileSize(scan.fileSize),
    scanSource: scan.scanSource || scanSource,
    detectedDisease: info.condition,
    confidenceText: typeof scan.confidence === "number" ? `${(scan.confidence * 100).toFixed(1)}%` : "N/A",
    riskLevel: risk,
    affectedCrop: info.plant,
    diseaseExplanation: explanation,
    causes,
    prevention,
    fertilizer,
    pesticides,
    recoveryPlan: {
      estimate: recovery,
      immediateSteps: procedure[0] || "Start treatment immediately after detection.",
      monitoring: procedure[1] || "Monitor new leaf growth and symptom spread over the next few days.",
      extraStep: procedure[2] || "Repeat the intervention cycle if symptoms remain active.",
    },
    expertTips: [
      "Do not water leaves directly unless necessary",
      "Scan the crop again after 5 days",
      "Isolate heavily infected plants if symptoms intensify",
    ],
  };
};

const styles = {
  page: {
    width: "760px",
    padding: "28px",
    background: "#f8fafc",
    color: "#0f172a",
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
    boxSizing: "border-box",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 14px 0",
  },
  pill: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
};

export function PdfReportTemplate({ data }) {
  const riskColors =
    data.riskLevel === "High"
      ? { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" }
      : data.riskLevel === "Medium"
        ? { bg: "#fffbeb", text: "#b45309", border: "#fde68a" }
        : { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0" };

  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, padding: "24px", marginBottom: "18px", overflow: "hidden" }}>
        <div
          style={{
            height: "6px",
            borderRadius: "999px",
            background: "linear-gradient(90deg, #166534, #22c55e)",
            marginBottom: "20px",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "flex-start" }}>
          <div>
            <div style={{ ...styles.pill, background: "#ecfdf5", color: "#047857", marginBottom: "12px" }}>
              AgroScan AI
            </div>
            <h1 style={{ margin: "0 0 8px 0", fontSize: "28px", lineHeight: 1.2, color: "#0f172a", fontWeight: 800 }}>
              {data.title}
            </h1>
            <p style={{ margin: 0, color: "#475569", fontSize: "14px", lineHeight: 1.6 }}>
              Structured disease detection summary for preliminary crop-health guidance.
            </p>
          </div>
          <div
            style={{
              minWidth: "128px",
              padding: "14px 16px",
              borderRadius: "16px",
              background: "#0f172a",
              color: "#ffffff",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.72 }}>
              Risk Level
            </div>
            <div style={{ marginTop: "8px", fontSize: "24px", fontWeight: 800 }}>{data.riskLevel}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", marginTop: "22px" }}>
          {[
            ["Report ID", data.reportId],
            ["Generated Date", data.generatedDate],
            ["Generated Time", data.generatedTime],
            ["User Name", data.userName],
            ["Crop Name", data.cropName],
            ["Disease Name", data.diseaseName],
          ].map(([label, value]) => (
            <div key={label} style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                {label}
              </div>
              <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "18px", marginBottom: "18px" }}>
        <div style={{ ...styles.card, padding: "20px" }}>
          <h2 style={styles.sectionTitle}>Uploaded Crop Image</h2>
          <div style={{ borderRadius: "18px", overflow: "hidden", background: "#e2e8f0", height: "260px", marginBottom: "14px" }}>
            {data.imageSrc ? (
              <img
                src={data.imageSrc}
                alt="Uploaded crop"
                crossOrigin="anonymous"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                Image not available
              </div>
            )}
          </div>
          <div style={{ display: "grid", gap: "10px" }}>
            {[
              ["File name", data.fileName],
              ["File size", data.fileSize],
              ["Scan source", data.scanSource],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "10px 0", borderBottom: "1px solid #e2e8f0" }}>
                <span style={{ color: "#64748b", fontSize: "13px" }}>{label}</span>
                <span style={{ color: "#0f172a", fontWeight: 600, fontSize: "13px", textAlign: "right" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...styles.card, padding: "20px" }}>
          <h2 style={styles.sectionTitle}>Prediction Summary</h2>
          <div
            style={{
              padding: "18px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #166534, #22c55e)",
              color: "#ffffff",
              marginBottom: "16px",
            }}
          >
            <div style={{ fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.8, marginBottom: "8px" }}>
              Prediction Result
            </div>
            <div style={{ fontSize: "26px", fontWeight: 800, lineHeight: 1.2 }}>{data.detectedDisease}</div>
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ padding: "14px", borderRadius: "14px", border: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Confidence Score</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>{data.confidenceText}</div>
            </div>
            <div style={{ padding: "14px", borderRadius: "14px", border: `1px solid ${riskColors.border}`, background: riskColors.bg }}>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Risk Level</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: riskColors.text }}>{data.riskLevel}</div>
            </div>
            <div style={{ padding: "14px", borderRadius: "14px", border: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Affected Crop</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>{data.affectedCrop}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...styles.card, padding: "20px", marginBottom: "18px" }}>
        <h2 style={styles.sectionTitle}>Disease Explanation</h2>
        <div style={{ display: "grid", gap: "12px" }}>
          {[
            ["What this disease is", data.diseaseExplanation.what],
            ["Why it happens", data.diseaseExplanation.why],
            ["Common symptoms", data.diseaseExplanation.symptoms],
          ].map(([label, value]) => (
            <div key={label} style={{ padding: "16px", borderRadius: "16px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#166534", fontWeight: 700, marginBottom: "8px" }}>
                {label}
              </div>
              <div style={{ fontSize: "14px", lineHeight: 1.7, color: "#334155" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>
        {[
          ["Possible Causes", data.causes, "#fff7ed", "#f97316"],
          ["Prevention Tips", data.prevention, "#f0fdf4", "#16a34a"],
          ["Recommended Fertilizers", data.fertilizer, "#eff6ff", "#2563eb"],
          ["Suggested Pesticides", data.pesticides, "#faf5ff", "#7c3aed"],
        ].map(([title, items, bg, accent]) => (
          <div key={title} style={{ ...styles.card, padding: "20px" }}>
            <h2 style={styles.sectionTitle}>{title}</h2>
            <div style={{ display: "grid", gap: "10px" }}>
              {items.map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                    padding: "12px 14px",
                    borderRadius: "14px",
                    background: bg,
                    border: `1px solid ${accent}22`,
                  }}
                >
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "999px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: accent,
                      color: "#ffffff",
                      fontSize: "12px",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    ✓
                  </span>
                  <span style={{ fontSize: "14px", lineHeight: 1.6, color: "#334155" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>
        <div style={{ ...styles.card, padding: "20px" }}>
          <h2 style={styles.sectionTitle}>Recovery Plan</h2>
          <div style={{ display: "grid", gap: "12px" }}>
            {[
              ["Estimated Recovery Time", data.recoveryPlan.estimate],
              ["Immediate Steps to Take", data.recoveryPlan.immediateSteps],
              ["Monitoring Advice", data.recoveryPlan.monitoring],
              ["Follow-up Action", data.recoveryPlan.extraStep],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: "14px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>{label}</div>
                <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 600, lineHeight: 1.6 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...styles.card, padding: "20px" }}>
          <h2 style={styles.sectionTitle}>Expert Tips</h2>
          <div style={{ display: "grid", gap: "12px" }}>
            {data.expertTips.map((tip) => (
              <div key={tip} style={{ padding: "14px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "14px", color: "#334155", lineHeight: 1.7 }}>{tip}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...styles.card, padding: "18px 20px", background: "#0f172a", color: "#ffffff" }}>
        <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>Generated by AgroScan AI</div>
        <div style={{ fontSize: "12px", lineHeight: 1.7, color: "#cbd5e1" }}>
          This report is AI-generated and should be used for preliminary guidance only. Consult an agriculture expert for severe infection cases.
        </div>
      </div>
    </div>
  );
}
