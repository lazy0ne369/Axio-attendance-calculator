import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <p className="footer-text">
            Created by <span className="footer-author">Sohan Kumar Sahu</span>
          </p>
          <p className="footer-copyright">
            © 2025 Axio. Made for students.
          </p>
        </div>
        <div className="footer-right">
          <Link to="/feedback" className="footer-link">
            Give Feedback
          </Link>
        </div>
      </div>
    </footer>
  );
}