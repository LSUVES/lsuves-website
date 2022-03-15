import React from "react";

import propTypes from "prop-types";
import { Outlet } from "react-router-dom";

import Navbar from "../navbar/Navbar";

export default function BaseLayout({ isAuthenticated, onLogOut }) {
  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} onLogOut={onLogOut} />
      <Outlet />
    </>
  );
}
BaseLayout.propTypes = {
  isAuthenticated: propTypes.bool.isRequired,
  onLogOut: propTypes.func.isRequired,
};
