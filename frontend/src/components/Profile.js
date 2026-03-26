import React, { useEffect, useState } from "react";
import { getAuth, updatePassword } from "firebase/auth";
import { child, get, ref, update } from "firebase/database";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { database } from "../firebase";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", number: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    if (!user) return;

    setFormData({
      name: user.name || "",
      email: user.email || "",
      number: user.number || "",
      password: user.password || "",
    });

    const fetchFeedbacks = async () => {
      try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `users/${user.id}/feedbacks`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const arr = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
          arr.sort((a, b) => new Date(b.date) - new Date(a.date));
          setFeedbacks(arr);
        }
      } catch (error) {
        console.error("Error fetching feedbacks", error);
      }
    };

    fetchFeedbacks();
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
        password: formData.password,
      };

      await update(ref(database, `users/${user.id}`), updates);
      updateUser({ ...user, ...updates });
      showToast("Profile updated successfully!", "success");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4 py-lg-5">
      <section className="page-hero-card mb-4">
        <div className="position-relative">
          <span className="info-chip mb-3">
            <i className="bi bi-person-badge" />
            Profile center
          </span>
          <div className="row g-4 align-items-center">
            <div className="col-lg-8">
              <h1 className="display-6 fw-bold mb-2">Manage your grower profile.</h1>
              <p className="mb-0" style={{ maxWidth: "38rem", opacity: 0.9 }}>
                Update your account details, keep your contact information current, and review feedback you have submitted from one clean screen.
              </p>
            </div>
            <div className="col-lg-4">
              <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3 justify-content-lg-end">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold shadow-lg"
                  style={{ width: 88, height: 88, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.18)", fontSize: "2rem" }}
                >
                  {user?.avatar || "U"}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="fw-bold fs-4">{user?.name || "User"}</div>
                  <div className="text-break" style={{ opacity: 0.82 }}>{user?.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="row g-4">
        <div className="col-xl-7">
          <div className="glass-lg p-4 p-md-5">
            <div className="mb-4">
              <span className="section-kicker mb-3">
                <i className="bi bi-sliders" />
                Account settings
              </span>
              <h2 className="h3 fw-bold mb-1" style={{ color: "var(--text-primary)" }}>Edit your details</h2>
              <p className="mb-0" style={{ color: "var(--text-muted)" }}>Everything here stays functional. Only the interface has been cleaned up.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>Full name</label>
                <div className="position-relative">
                  <span className="field-icon"><i className="bi bi-person" /></span>
                  <input type="text" name="name" className="form-control ps-5" value={formData.name} onChange={handleChange} required />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>Email address</label>
                <div className="position-relative">
                  <span className="field-icon"><i className="bi bi-envelope" /></span>
                  <input type="email" name="email" className="form-control ps-5" value={formData.email} disabled />
                </div>
                <div className="form-text small" style={{ color: "var(--text-muted)" }}>Email address cannot be changed.</div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>Phone number</label>
                <div className="position-relative">
                  <span className="field-icon"><i className="bi bi-telephone" /></span>
                  <input type="tel" name="number" className="form-control ps-5" value={formData.number} onChange={handleChange} />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>Password</label>
                <div className="position-relative">
                  <span className="field-icon"><i className="bi bi-shield-lock" /></span>
                  <input type={showPwd ? "text" : "password"} name="password" className="form-control ps-5 pe-5" value={formData.password} onChange={handleChange} minLength={6} />
                  <button type="button" className="btn btn-link field-action p-0 border-0" onClick={() => setShowPwd(!showPwd)}>
                    <i className={`bi ${showPwd ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-agro w-100 py-3" disabled={loading}>
                {loading ? "Updating..." : "Save changes"}
              </button>
            </form>
          </div>
        </div>

        <div className="col-xl-5">
          <div className="surface-panel h-100 p-4 p-md-5">
            <span className="section-kicker mb-3">
              <i className="bi bi-activity" />
              Snapshot
            </span>
            <div className="d-flex flex-column gap-3 mb-4">
              <div className="upload-stat-tile">
                <div className="small text-uppercase fw-bold mb-1" style={{ color: "var(--text-muted)", letterSpacing: "0.06em" }}>Account name</div>
                <div className="fw-bold" style={{ color: "var(--text-primary)" }}>{user?.name || "Not set"}</div>
              </div>
              <div className="upload-stat-tile">
                <div className="small text-uppercase fw-bold mb-1" style={{ color: "var(--text-muted)", letterSpacing: "0.06em" }}>Phone</div>
                <div className="fw-bold" style={{ color: "var(--text-primary)" }}>{user?.number || "Not added"}</div>
              </div>
              <div className="upload-stat-tile">
                <div className="small text-uppercase fw-bold mb-1" style={{ color: "var(--text-muted)", letterSpacing: "0.06em" }}>Feedback count</div>
                <div className="fw-bold" style={{ color: "var(--text-primary)" }}>{feedbacks.length}</div>
              </div>
            </div>

            <h3 className="h5 fw-bold mb-3" style={{ color: "var(--text-primary)" }}>Feedback history</h3>
            {feedbacks.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {feedbacks.map((feedback) => (
                  <div key={feedback.id} className="glass compact-card position-relative overflow-hidden" style={{ borderLeft: "4px solid var(--accent)" }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex gap-1" style={{ color: "#fbbf24" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i key={star} className={`bi ${feedback.rating >= star ? "bi-star-fill" : "bi-star"}`} />
                        ))}
                      </div>
                      <div className="small text-muted">{new Date(feedback.date).toLocaleDateString()}</div>
                    </div>
                    <p className="mb-0" style={{ color: "var(--text-secondary)" }}>{feedback.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass compact-card text-center">
                <i className="bi bi-chat-left-text fs-3 d-block mb-2 text-accent" />
                <div className="fw-semibold" style={{ color: "var(--text-primary)" }}>No feedback submitted yet</div>
                <div className="small" style={{ color: "var(--text-muted)" }}>Your sent feedback will appear here.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
