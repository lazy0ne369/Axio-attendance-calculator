import customLogo from '../assets/images/axio.png';

export default function Logo() {
  return (
    <div className="logo">
      <div className="logo-icon">
        <img src={customLogo} alt="Axio Logo" className="custom-logo" />
      </div>
      <div className="logo-text">
        <span className="logo-title">Axio</span>
        <span className="logo-subtitle">L-T-P-S Attendance Calculator</span>
      </div>
    </div>
  );
}