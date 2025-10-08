import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SelectTypes from "./pages/SelectTypes";
import Calculator from "./pages/Calculator";
import Feedback from "./pages/Feedback";
import { useState } from "react";
import "./App.css";

export default function App() {
  const [selectedTypes, setSelectedTypes] = useState([]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/select"
          element={<SelectTypes selectedTypes={selectedTypes} setSelectedTypes={setSelectedTypes} />}
        />
        <Route path="/calculator" element={<Calculator selectedTypes={selectedTypes} />} />
        <Route path="/feedback" element={<Feedback />} />
      </Routes>
    </Router>
  );
}
