import React from "react";

import axios from "axios";
import ReactDOM from "react-dom";
import "./custom.scss";
import "./index.css";

import App from "./App";
import reportWebVitals from "./reportWebVitals";

// FIXME: In production, set this to the hostname/address of the API server
axios.defaults.baseURL = `http://lsuves.org.uk/api`;
// axios.defaults.withCredentials = true;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
