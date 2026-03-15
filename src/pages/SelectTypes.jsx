import { Link, useLocation } from "react-router-dom";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import ThemeToggle from "../components/ThemeToggle";

export default function SelectTypes({ selectedTypes, setSelectedTypes }) {
  const location = useLocation();
  const destination = location.state?.destination || "/calculator";

  const options = [
    { name: "Lecture", description: "Regular theory classes" },
    { name: "Tutorial", description: "Problem-solving sessions" },
    { name: "Practical", description: "Lab and hands-on work" },
    { name: "Skill", description: "Skill development sessions" }
  ];

  const toggleType = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  return (
    <div className="page-container">
      <ThemeToggle />
      <div className="container">
        <div className="card">
          <Logo />
          <h2>Choose Class Types</h2>
          <p>Select the types of classes you want to include in your attendance calculation:</p>

          <div className="form-group">
            {options.map((option) => (
              <label key={option.name}>
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(option.name)}
                  onChange={() => toggleType(option.name)}
                />
                <div>
                  <div style={{ fontWeight: '600' }}>{option.name}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>{option.description}</div>
                </div>
              </label>
            ))}
          </div>

          <Link to={destination}>
            <button disabled={selectedTypes.length === 0}>
              Continue ({selectedTypes.length} selected)
            </button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
