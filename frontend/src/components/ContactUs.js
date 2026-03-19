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
    <div className="container py-5">
      <div className="mx-auto stagger" style={{ maxWidth: "600px" }}>
        <div className="text-center mb-4">
          <h1 className="h3 fw-bold mb-1" style={{ color: "var(--text-primary)" }}>Contact Us</h1>
          <p className="text-muted">We'd love to hear from you</p>
        </div>

        <div className="glass-lg rounded-4 p-4 p-md-5">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>Name</label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>Email Address</label>
              <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>Subject</label>
              <input type="text" name="subject" className="form-control" value={formData.subject} onChange={handleChange} required />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>Message</label>
              <textarea name="message" className="form-control" rows="4" value={formData.message} onChange={handleChange} required></textarea>
            </div>

            <button type="submit" className="btn btn-agro w-100 py-2" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
