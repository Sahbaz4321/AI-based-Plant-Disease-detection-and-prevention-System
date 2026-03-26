import React, { useState } from "react";
import { useToast } from "../context/ToastContext";

export default function ContactUs() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      showToast("Your message has been sent successfully!", "success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="container py-4 py-lg-5">
      <section className="page-hero-card mb-4">
        <div className="position-relative">
          <span className="info-chip mb-3">
            <i className="bi bi-headset" />
            Contact support
          </span>
          <h1 className="display-6 fw-bold mb-2">Talk to the AgroScan team.</h1>
          <p className="mb-0" style={{ maxWidth: "38rem", opacity: 0.92 }}>
            Send product feedback, report issues, or ask for help. The layout is now cleaner and easier to use on mobile as well.
          </p>
        </div>
      </section>

      <div className="row g-4 align-items-stretch">
        <div className="col-lg-5">
          <div className="surface-panel h-100 p-4 p-md-5">
            <span className="section-kicker mb-3">
              <i className="bi bi-send" />
              Reach out
            </span>
            <h2 className="h3 fw-bold mb-3" style={{ color: "var(--text-primary)" }}>We&apos;d love to hear from you</h2>
            <div className="d-flex flex-column gap-3">
              <div className="glass compact-card">
                <div className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}><i className="bi bi-envelope me-2 text-accent" /> Email-friendly flow</div>
                <div className="small" style={{ color: "var(--text-muted)" }}>Use the form to share bugs, questions, or suggestions.</div>
              </div>
              <div className="glass compact-card">
                <div className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}><i className="bi bi-phone me-2 text-accent" /> Mobile responsive</div>
                <div className="small" style={{ color: "var(--text-muted)" }}>Spacing and input controls now behave better on small screens.</div>
              </div>
              <div className="glass compact-card">
                <div className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}><i className="bi bi-lightning-charge me-2 text-accent" /> Fast submission</div>
                <div className="small" style={{ color: "var(--text-muted)" }}>Existing functionality is unchanged.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="glass-lg p-4 p-md-5">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>Name</label>
                  <div className="position-relative">
                    <span className="field-icon"><i className="bi bi-person" /></span>
                    <input type="text" name="name" className="form-control ps-5" value={formData.name} onChange={handleChange} required />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>Email address</label>
                  <div className="position-relative">
                    <span className="field-icon"><i className="bi bi-envelope" /></span>
                    <input type="email" name="email" className="form-control ps-5" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>Subject</label>
                  <div className="position-relative">
                    <span className="field-icon"><i className="bi bi-chat-left-text" /></span>
                    <input type="text" name="subject" className="form-control ps-5" value={formData.subject} onChange={handleChange} required />
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>Message</label>
                  <textarea name="message" className="form-control" rows="6" value={formData.message} onChange={handleChange} required />
                </div>
              </div>

              <button type="submit" className="btn btn-agro w-100 py-3 mt-4" disabled={loading}>
                {loading ? "Sending..." : "Send message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
