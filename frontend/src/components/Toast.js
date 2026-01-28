import React, { useEffect } from "react";

export default function Toast({ message, type = "info", onClose, duration = 4000 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const icon = type === "error" ? "bi-exclamation-circle" : "bi-check-circle";
  return (
    <div
      className="toast-agro animate-fade-in-up"
      role="alert"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 20px",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        boxShadow: "var(--shadow-lg)",
        maxWidth: "360px",
      }}
    >
      <i className={`bi ${icon} text-accent`} style={{ fontSize: "1.25rem" }} />
      <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{message}</span>
    </div>
  );
}
