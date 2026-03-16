/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Supervisor from "./pages/Supervisor";
import AgentCommander from "./pages/AgentCommander";
import CityOnboarding from "./components/CityOnboarding";
import { Language } from "./types";

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const city = localStorage.getItem("iraq_compass_city");
    if (city) {
      setShowOnboarding(false);
    } else {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = (city: string, lang: Language) => {
    localStorage.setItem("iraq_compass_city", city);
    localStorage.setItem("iraq_compass_lang", lang);
    setShowOnboarding(false);
  };

  if (showOnboarding === null) return null;

  return (
    <>
      {showOnboarding && <CityOnboarding onComplete={handleOnboardingComplete} />}
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/supervisor" element={<Supervisor />} />
          <Route path="/commander" element={<AgentCommander />} />
        </Routes>
      </Router>
    </>
  );
}
