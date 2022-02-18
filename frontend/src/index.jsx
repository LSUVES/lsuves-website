import React, { useState } from "react";

import axios from "axios";
import ReactDOM from "react-dom";
import "bootstrap/dist/css/bootstrap.css";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Aaa from "./Aaa";
import App from "./App";
import Blog from "./blog/Blog";
import Calendar from "./calendar/Calendar";
import Event from "./event/Event";
import Events from "./event/Events";
import Home from "./home/Home";
import Lan from "./lan/Lan";
import LanRules from "./lan/LanRules";
import Login from "./login_and_register/Login";
import Register from "./login_and_register/Register";
import Profile from "./profile/Profile";
import reportWebVitals from "./reportWebVitals";

// Set this to the hostname/address of the API
axios.defaults.baseURL = `http://localhost:8000`;
// axios.defaults.withCredentials = true;

// TODO: Pull this into App.jsx?
function Root() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [test, setTest] = useState("poggers");

  console.log(`reset: ${test}`);

  // TODO: Check you can't just pass setState
  //       Refactor to handleIsAuthenticatedChange = {onIsAuthenticatedChange}
  const updateIsAuthenticated = (e) => {
    setIsAuthenticated(e);
  };

  const updateTest = (e) => {
    console.log(test);
    setTest(e);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <App
              isAuthenticated={isAuthenticated}
              updateIsAuthenticated={updateIsAuthenticated}
            />
          }
        >
          <Route index element={<Home />} />
          <Route path="blog" element={<Blog />} />
          <Route path="events">
            <Route index element={<Events />} />
            <Route path=":eventId" element={<Event />} />
          </Route>
          <Route path="calendar" element={<Calendar />} />
          <Route path="lan" element={<Lan />} />
          <Route path="lan/rules" element={<LanRules />} />
          <Route
            path="login"
            element={
              <Login
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={updateIsAuthenticated}
              />
            }
          />
          <Route path="profile" element={<Profile />} />
          <Route path="register" element={<Register />} />
          <Route
            path="aaa"
            element={<Aaa test={test} setTest={updateTest} />}
          />
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
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
