import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";
import Calendar from "./calendar/Calendar";
import Blog from "./blog/Blog";

export default function App() {
  return (
    <main className="d-flex flex-column vh-100">
      <h1 className="display-1 text-center">
        A<span className="text-primary">VGS</span>
      </h1>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <div className="navbar-nav">
            <a className="nav-item nav-link active" href="/">
              Blog <span className="sr-only">(current)</span>
            </a>
            <a className="nav-item nav-link" href="/calendar">
              Calendar
            </a>
          </div>
        </div>
      </nav>
      <div className="flex-container flex-fill h-100">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Blog />} />
            <Route path="calendar" element={<Calendar />} />
          </Routes>
        </BrowserRouter>
      </div>
    </main>
  );
}
