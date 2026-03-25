import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { database } from "../firebase";
import { ref, push, set } from "firebase/database";

export default function Feedback() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      showToast("Please provide a rating.", "error");
      return;
    }
    setLoading(true);
    
    try {
      const feedbackEntry = {
        rating,
        comment,
        date: new Date().toISOString()
      };

      if (user) {
        const feedbackRef = ref(database, `users/${user.id}/feedbacks`);
        const newFeedbackRef = push(feedbackRef);
        await set(newFeedbackRef, feedbackEntry);
        showToast("Feedback submitted successfully. Thank you!", "success");
      } else {
        showToast("Please log in to submit feedback.", "error");
      }
      
      setRating(0);
      setComment("");
    } catch (err) {
      showToast("Failed to submit feedback. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <section className="stagger text-center mb-5">
        <h1 className="h3 fw-bold mb-2" style={{ color: "var(--text-primary)" }}>
          <i className="bi bi-chat-heart me-2 text-accent" />
          We Value Your Feedback
        </h1>
        <p style={{ color: "var(--text-muted)", maxWidth: "520px", margin: "0 auto" }}>
          Let us know how AgroScan is helping your farm, or suggest features you'd love to see next!
        </p>
      </section>

      <div className="stagger mx-auto" style={{ maxWidth: "600px" }}>
        <div className="glass-lg rounded-4 p-4 p-md-5 mb-4 position-relative overflow-hidden">
          {/* Decorative element */}
          <div className="position-absolute top-0 start-0 w-100" style={{ height: "4px", background: "linear-gradient(90deg, var(--gradient-start), var(--gradient-end))" }} />
          
          <form onSubmit={handleSubmit}>
            {/* Rating Stars */}
            <div className="mb-4 text-center">
              <label className="form-label fw-semibold d-block mb-3" style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                Rate your experience
              </label>
              <div className="d-flex justify-content-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="btn btn-link p-0 border-0 text-decoration-none"
                    style={{ 
                      color: (hoverRating || rating) >= star ? "#fbbf24" : "var(--border)",
                      fontSize: "2.5rem",
                      transform: (hoverRating || rating) >= star ? "scale(1.1)" : "scale(1)",
                      filter: (hoverRating || rating) >= star ? "drop-shadow(0 0 8px rgba(251,191,36,0.6))" : "none",
                      transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <i className={`bi ${(hoverRating || rating) >= star ? "bi-star-fill" : "bi-star"}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Area */}
            <div className="mb-4">
              <label className="form-label small fw-semibold" style={{ color: "var(--text-secondary)" }}>
                Your Review / Suggestions
              </label>
              <textarea
                className="form-control p-3 rounded-3"
                rows="5"
                placeholder="Tell us what you love or what could be improved..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                style={{ resize: "none" }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-agro w-100 py-3 rounded-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" />
                  Submitting…
                </>
              ) : (
                <>
                  <i className="bi bi-send-fill" />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Helper Note */}
        <div className="text-center small">
          <p style={{ color: "var(--text-muted)" }}>
            <i className="bi bi-shield-check me-1 text-accent" />
            Your feedback will be securely saved into your profile dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
