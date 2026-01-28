import React, { useState, useCallback, useEffect } from "react";
import API from "../api";
import { useToast } from "../context/ToastContext";

const HISTORY_KEY = "agroscan-scan-history";
const MAX_HISTORY = 5;

function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addToHistory(entry) {
  const list = getHistory();
  const next = [{ ...entry, id: Date.now() }, ...list].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export default function Upload() {
  const { showToast } = useToast();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [drag, setDrag] = useState(false);
  const [history, setHistory] = useState(getHistory);

  const clearPreview = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    setResult(null);
  }, [preview]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = useCallback(
    (f) => {
      clearPreview();
      if (!f || !f.type.startsWith("image/")) return;
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
    },
    [clearPreview]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDrag(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDrag(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDrag(false);
  }, []);

  const handleUpload = async () => {
    if (!file) {
      showToast("Please select or drop an image first", "error");
      return;
    }

    setLoading(true);
    setProgress(0);
    setResult(null);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + Math.random() * 12 + 4;
      });
    }, 200);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await API.post("/upload", formData);
      clearInterval(interval);
      setProgress(100);
      setResult(res.data);
      addToHistory({
        disease: res.data.disease,
        fertilizer: res.data.fertilizer,
        date: new Date().toISOString(),
      });
      setHistory(getHistory());
      showToast("Scan complete! View results below.", "info");
    } catch (err) {
      clearInterval(interval);
      setProgress(0);
      showToast("Scan failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <section className="stagger text-center mb-5">
        <h1 className="h3 fw-bold mb-2" style={{ color: "var(--text-primary)" }}>
          <i className="bi bi-camera me-2 text-accent" />
          Crop Image Scan
        </h1>
        <p style={{ color: "var(--text-muted)", maxWidth: "520px", margin: "0 auto" }}>
          Upload a crop or leaf image for AI-based disease detection, fertilizer suggestions, and prevention tips.
        </p>
      </section>

      {/* Drop zone */}
      <div
        className="stagger glass rounded-4 p-4 p-md-5 mb-4"
        style={{ maxWidth: "620px", margin: "0 auto" }}
      >
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById("file-input")?.click()}
          className="rounded-4 text-center py-5 px-4"
          style={{
            border: "2px dashed " + (drag ? "var(--accent)" : "var(--border)"),
            background: drag ? "var(--accent-muted)" : "transparent",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <input
            id="file-input"
            type="file"
            accept="image/*"
            className="d-none"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {preview ? (
            <div className="d-flex flex-column align-items-center gap-3">
              <img
                src={preview}
                alt="Preview"
                className="rounded-3"
                style={{ maxHeight: 220, maxWidth: "100%", objectFit: "contain" }}
              />
              <div className="d-flex gap-2 flex-wrap justify-content-center">
                <button
                  type="button"
                  className="btn btn-agro"
                  onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Scanning…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cpu me-2" />
                      Scan image
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={(e) => { e.stopPropagation(); clearPreview(); }}
                  disabled={loading}
                >
                  <i className="bi bi-x-lg me-1" />
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <>
              <i className="bi bi-cloud-arrow-up display-4 mb-3" style={{ color: "var(--accent)" }} />
              <p className="mb-1 fw-semibold" style={{ color: "var(--text-primary)" }}>
                Drop an image here or click to browse
              </p>
              <p className="small mb-0" style={{ color: "var(--text-muted)" }}>
                PNG, JPG, WebP up to 10MB
              </p>
            </>
          )}
        </div>

        {loading && (
          <div className="mt-4">
            <div className="d-flex justify-content-between small mb-2">
              <span style={{ color: "var(--text-muted)" }}>Analyzing image…</span>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>{Math.round(progress)}%</span>
            </div>
            <div
              className="rounded-3 overflow-hidden"
              style={{ height: 8, background: "var(--border)" }}
            >
              <div
                className="h-100 rounded-3"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, var(--gradient-start), var(--gradient-end))",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div
          className="stagger glass-lg rounded-4 p-4 p-md-5 mb-5"
          style={{ maxWidth: "680px", margin: "0 auto" }}
        >
          <h2 className="h5 fw-bold mb-4" style={{ color: "var(--text-primary)" }}>
            <i className="bi bi-check-circle me-2 text-accent" />
            Scan results
          </h2>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="rounded-3 p-3 h-100" style={{ background: "var(--accent-muted)", border: "1px solid var(--border)" }}>
                <div className="small text-muted mb-1">Detected disease</div>
                <div className="fw-semibold" style={{ color: "var(--text-primary)" }}>{result.disease}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="rounded-3 p-3 h-100" style={{ background: "var(--accent-muted)", border: "1px solid var(--border)" }}>
                <div className="small text-muted mb-1">Recommended fertilizer</div>
                <div className="fw-semibold" style={{ color: "var(--text-primary)" }}>{result.fertilizer}</div>
              </div>
            </div>
            <div className="col-12">
              <div className="rounded-3 p-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <div className="small text-muted mb-1">Procedure</div>
                <div style={{ color: "var(--text-secondary)" }}>{result.procedure}</div>
              </div>
            </div>
            <div className="col-12">
              <div className="rounded-3 p-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <div className="small text-muted mb-1">Prevention</div>
                <div style={{ color: "var(--text-secondary)" }}>{result.prevention}</div>
              </div>
            </div>
          </div>
          <div className="alert alert-success rounded-3 mt-4 mb-0" style={{ background: "var(--accent-muted)", border: "1px solid var(--border)" }}>
            <i className="bi bi-check-circle me-2" />
            Analysis completed successfully.
          </div>
        </div>
      )}

      {/* Scan history */}
      {history.length > 0 && (
        <section className="stagger">
          <h2 className="h5 fw-bold mb-3" style={{ color: "var(--text-primary)" }}>
            <i className="bi bi-clock-history me-2 text-accent" />
            Recent scans
          </h2>
          <div className="d-flex flex-wrap gap-3">
            {history.map((h) => (
              <div
                key={h.id}
                className="glass rounded-4 p-3 d-flex align-items-center gap-3"
                style={{ maxWidth: "360px" }}
              >
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 56, height: 56, background: "var(--accent-muted)", color: "var(--accent)" }}
                >
                  <i className="bi bi-flower2" style={{ fontSize: "1.5rem" }} />
                </div>
                <div className="flex-grow-1 min-w-0">
                  <div className="fw-semibold text-truncate" style={{ color: "var(--text-primary)" }}>{h.disease}</div>
                  <div className="small text-truncate" style={{ color: "var(--text-muted)" }}>{h.fertilizer}</div>
                  <div className="small" style={{ color: "var(--text-muted)" }}>
                    {new Date(h.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
