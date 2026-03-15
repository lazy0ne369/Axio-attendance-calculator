import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import ThemeToggle from "../components/ThemeToggle";

export default function Calculator({ selectedTypes }) {
  const [mode, setMode] = useState("numeric"); // 'numeric' or 'percentage'
  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem("attendance_calculator_data");
    return saved ? JSON.parse(saved) : {};
  });
  const [result, setResult] = useState(null);

  useEffect(() => {
    localStorage.setItem("attendance_calculator_data", JSON.stringify(attendance));
  }, [attendance]);

  const handleChange = (e, field) => {
    setAttendance({ ...attendance, [field]: e.target.value });
  };
// ... rest of the component

  const weights = {
    Lecture: 1.0,
    Tutorial: 1.0,
    Practical: 0.5,
    Skill: 0.25,
  };

  const calculateAttendance = () => {
    let weightedAttended = 0;
    let weightedTotal = 0;

    selectedTypes.forEach((type) => {
      if (mode === "numeric") {
        const att = parseInt(attendance[`${type}_att`]) || 0;
        const total = parseInt(attendance[`${type}_total`]) || 0;
        weightedAttended += att * weights[type];
        weightedTotal += total * weights[type];
      } else {
        const perc = parseFloat(attendance[`${type}_perc`]) || 0;
        // In percentage mode, we calculate weighted average of the percentages
        weightedAttended += (perc / 100) * weights[type];
        weightedTotal += weights[type];
      }
    });

    const percentage = weightedTotal > 0
      ? (mode === "numeric" ? (weightedAttended / weightedTotal) * 100 : (weightedAttended / weightedTotal) * 100)
      : 0;
    setResult(percentage.toFixed(2));
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)';
    if (percentage >= 65) return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    return 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
  };

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 75) return 'Meeting requirement';
    if (percentage >= 65) return 'Close to requirement';
    return 'Below requirement';
  };

  return (
    <div className="page-container">
      <ThemeToggle />
      <div className="container">
        <div className="card">
          <Logo />
          <h2>Calculate Attendance</h2>
          <p>Enter your attendance data for each selected class type below:</p>

          {selectedTypes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ color: '#64748b', marginBottom: '32px' }}>
                No class types selected. Please go back and select at least one type.
              </p>
              <Link to="/select" state={{ destination: "/calculator" }}>
                <button>Select Class Types</button>
              </Link>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', gap: '8px' }}>
                <button
                  onClick={() => { setMode("numeric"); setResult(null); }}
                  style={{
                    flex: 1,
                    background: mode === "numeric" ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : '#e2e8f0',
                    color: mode === "numeric" ? 'white' : '#475569'
                  }}
                >
                  Numeric Mode
                </button>
                <button
                  onClick={() => { setMode("percentage"); setResult(null); }}
                  style={{
                    flex: 1,
                    background: mode === "percentage" ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : '#e2e8f0',
                    color: mode === "percentage" ? 'white' : '#475569'
                  }}
                >
                  Percentage Mode
                </button>
              </div>

              {selectedTypes.map((type) => (
                <div key={type} className="form-group">
                  <label style={{ marginBottom: '12px', display: 'block', fontSize: '15px', fontWeight: '600' }}>
                    {type} Classes (Weight: {weights[type]}×)
                  </label>
                  {mode === "numeric" ? (
                    <>
                      <div className="input-group">
                        <input
                          type="number"
                          placeholder="Classes Attended"
                          value={attendance[`${type}_att`] || ""}
                          onChange={(e) => handleChange(e, `${type}_att`)}
                          min="0"
                        />
                        <input
                          type="number"
                          placeholder="Total Classes"
                          value={attendance[`${type}_total`] || ""}
                          onChange={(e) => handleChange(e, `${type}_total`)}
                          min="0"
                        />
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px', fontWeight: '500' }}>
                        Individual: {attendance[`${type}_total`] > 0 ?
                          ((parseInt(attendance[`${type}_att`]) || 0) / parseInt(attendance[`${type}_total`]) * 100).toFixed(1)
                          : '0'}%
                      </div>
                    </>
                  ) : (
                    <div className="input-group">
                      <input
                        type="number"
                        placeholder="Attendance Percentage (%)"
                        value={attendance[`${type}_perc`] || ""}
                        onChange={(e) => handleChange(e, `${type}_perc`)}
                        min="0"
                        max="100"
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}
                </div>
              ))}

              <button onClick={calculateAttendance}>
                Calculate Weighted Attendance
              </button>

              {result !== null && (
                <div
                  className="result"
                  style={{
                    background: getAttendanceColor(parseFloat(result)),
                    color: 'white',
                    animation: 'resultSlideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '12px', opacity: '0.9' }}>
                    Weighted Attendance
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>
                    {result}%
                  </div>
                  <div style={{ fontSize: '14px', opacity: '0.9', fontWeight: '500' }}>
                    {getAttendanceStatus(parseFloat(result))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <Link to="/select" state={{ destination: "/calculator" }} style={{ color: '#64748b', textDecoration: 'none', fontSize: '15px', fontWeight: '500' }}>
                  ← Change Selected Types
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
