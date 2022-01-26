import React from "react";

import axios from "axios";
import ReactDOM from "react-dom";
import "bootstrap/dist/css/bootstrap.css";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import App from "./App";
import Blog from "./blog/Blog";
import Calendar from "./calendar/Calendar";
import Event from "./event/Event";
import Events from "./event/Events";
import reportWebVitals from "./reportWebVitals";

// Set this to the hostname/address of the API
axios.defaults.baseURL = `http://localhost:8000`;

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          {/* <Route index element={<Home />} /> */}
          <Route path="blog" element={<Blog />} />
          <Route path="events">
            <Route index element={<Events />} />
            <Route path=":eventId" element={<Event />} />
          </Route>
          <Route path="calendar" element={<Calendar />} />
          <Route
            path="*"
            element={
              <main>
                <p>Page not found</p>
              </main>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
