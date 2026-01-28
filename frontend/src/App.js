import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import Upload from "./components/Upload";
import SoilInfo from "./components/SoilInfo";
import Feedback from "./components/Feedback";
import "./App.css";
import "./index.css";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="App">
          <Navbar />
          <main className="page-wrap">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/soil" element={<SoilInfo />} />
              <Route path="/feedback" element={<Feedback />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
