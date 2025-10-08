import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import Footer from "../components/Footer";

export default function Feedback() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "suggestion",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Read Web3Forms key from Vite environment variable
  const accessKey = import.meta.env.VITE_WEB3FORMS_KEY;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!accessKey) {
      setError("Feedback temporarily unavailable (missing API key). Please try again later.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: formData.name || "Anonymous",
            email: formData.email || "No email provided",
          subject: `Axio Feedback - ${formData.type}`,
          message: `
Feedback Type: ${formData.type}
Name: ${formData.name || "Anonymous"}
Email: ${formData.email || "Not provided"}

Message:
${formData.message}
          `,
          from_name: "Axio Feedback Form",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            name: "",
            email: "",
            type: "suggestion",
            message: ""
          });
        }, 3000);
      } else {
        setError("Failed to send feedback. Please try again.");
      }
    } catch (err) {
      // Optional: log to console for debugging (won't appear in production logs)
      console.error('Feedback submission failed:', err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container">
        <div className="card">
          <Logo />
          <h2>Share Your Feedback</h2>
          <p>Help us make Axio better! Your suggestions and feedback are valuable to us.</p>

          {submitted ? (
            <div className="feedback-success">
              <div className="success-icon">✓</div>
              <h3>Thank You!</h3>
              <p>Your feedback has been received. We appreciate you taking the time to help us improve Axio.</p>
              <Link to="/">
                <button>Back to Home</button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="feedback-form">
              {error && (
                <div className="feedback-error">
                  <p>{error}</p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="name">Name (Optional)</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email (Optional)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Feedback Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="feedback-select"
                  disabled={isSubmitting}
                >
                  <option value="suggestion">Suggestion</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="general">General Feedback</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what you think, what we can improve, or report any issues..."
                  required
                  rows="5"
                  className="feedback-textarea"
                  disabled={isSubmitting}
                />
              </div>

              <button type="submit" disabled={!formData.message.trim() || isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Feedback"}
              </button>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <Link to="/" className="back-link">
                  ← Back to Calculator
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}