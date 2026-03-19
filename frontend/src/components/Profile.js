import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { database } from "../firebase";
import { ref, update, get, child } from "firebase/database";
import { getAuth, updatePassword } from "firebase/auth";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", number: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        number: user.number || "",
        password: user.password || ""
      });

      // Fetch feedbacks
      const fetchFeedbacks = async () => {
        try {
          const dbRef = ref(database);
          const snapshot = await get(child(dbRef, `users/${user.id}/feedbacks`));
          if (snapshot.exists()) {
            const data = snapshot.val();
            const arr = Object.keys(data).map(k => ({ id: k, ...data[k] }));
            arr.sort((a,b) => new Date(b.date) - new Date(a.date));
            setFeedbacks(arr);
          }
        } catch(e) { console.error("Error fetching feedbacks", e); }
      };
      fetchFeedbacks();
    }
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = getAuth();
      if (formData.password && formData.password !== user.password) {
        await updatePassword(auth.currentUser, formData.password);
      }

      const updates = {
        name: formData.name,
        number: formData.number,
        password: formData.password
      };

      await update(ref(database, `users/${user.id}`), updates);
      updateUser({ ...user, ...updates });
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="mx-auto stagger" style={{ maxWidth: "600px" }}>
        <div className="text-center mb-4">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 80, height: 80, background: "var(--accent-muted)", color: "var(--accent)", fontSize: "2rem", fontWeight: "bold" }}
          >
            {user?.avatar || "U"}
          </div>
          <h1 className="h3 fw-bold mb-1" style={{ color: "var(--text-primary)" }}>Your Profile</h1>
          <p className="text-muted">Manage your personal information</p>
        </div>

        <div className="glass-lg rounded-4 p-4 p-md-5">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>Full Name</label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>Email Address</label>
              <input type="email" name="email" className="form-control" value={formData.email} disabled />
              <div className="form-text small" style={{ color: "var(--text-muted)" }}>Email address cannot be changed.</div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>Phone Number</label>
              <input type="tel" name="number" className="form-control" value={formData.number} onChange={handleChange} />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>Password</label>
              <div className="position-relative">
                <input type={showPwd ? "text" : "password"} name="password" className="form-control pe-5" value={formData.password} onChange={handleChange} minLength={6} />
                <button type="button" className="btn btn-link position-absolute top-50 translate-middle-y p-0 border-0" style={{ right: 14, color: "var(--text-muted)" }} onClick={() => setShowPwd(!showPwd)}>
                  <i className={`bi ${showPwd ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-agro w-100 py-2" disabled={loading}>
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Feedback History Section */}
        {feedbacks.length > 0 && (
          <div className="mt-5">
            <h2 className="h5 fw-bold mb-4" style={{ color: "var(--text-primary)" }}>
              <i className="bi bi-chat-heart text-accent me-2" />
              Your Feedback History
            </h2>
            <div className="row g-3">
              {feedbacks.map(fb => (
                <div key={fb.id} className="col-12">
                  <div className="glass rounded-4 p-4 position-relative overflow-hidden" style={{ borderLeft: "4px solid var(--accent)" }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex gap-1" style={{ color: "#fbbf24" }}>
                        {[1, 2, 3, 4, 5].map(star => (
                           <i key={star} className={`bi ${fb.rating >= star ? "bi-star-fill" : "bi-star"}`} style={{ fontSize: "1.1rem" }} />
                        ))}
                      </div>
                      <div className="small text-muted">{new Date(fb.date).toLocaleDateString()}</div>
                    </div>
                    <p className="mb-0 fw-semibold" style={{ color: "var(--text-secondary)" }}>{fb.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
