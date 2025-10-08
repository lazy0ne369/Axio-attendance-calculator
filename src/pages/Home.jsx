import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="page-container">
      <div className="container">
        <div className="card">
          <Logo />
          <h1>L-T-P-S Attendance Calculator</h1>
          <p>Calculate your weighted attendance across different class types with precision and ease. Track your academic progress efficiently.</p>
          <Link to="/select">
            <button>Get Started</button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
