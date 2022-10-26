import React from "react";

import axios from "axios";
import ReactDOM from "react-dom";
import "./custom.scss";
import "./index.css";

import App from "./App";
import reportWebVitals from "./reportWebVitals";

// TODO: Use this and remove the /api prefix from all axios calls
// axios.defaults.baseURL = `https://lsuves.org.uk/api`;
axios.defaults.baseURL = `https://lsuves.org.uk`;
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
