import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import ThemeToggle from "../components/ThemeToggle";

export default function Home() {
  return (
    <div className="page-container">
      <ThemeToggle />
      <div className="container">
        <div className="card">
          <Logo />
          <h1>L-T-P-S Attendance Calculator</h1>
          <p>Calculate your weighted attendance across different class types with precision and ease. Track your academic progress efficiently.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
            <Link to="/select" state={{ destination: "/calculator" }} className="nav-link-card">
              <button>LTPS Calculator</button>
            </Link>
            <Link to="/select" state={{ destination: "/classes-to-go" }} className="nav-link-card">
              <button style={{ background: 'linear-gradient(135deg, #475569 0%, #334155 100%)' }}>Classes to Go</button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
