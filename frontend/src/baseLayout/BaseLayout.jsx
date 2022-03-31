import React from "react";

import propTypes from "prop-types";
import { Outlet } from "react-router-dom";

import Navbar from "../navbar/Navbar";

export default function BaseLayout({ isAuthenticated, isAdmin, onLogOut }) {
  return (
    <>
      <Navbar
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        onLogOut={onLogOut}
      />
      <Outlet />
    </>
  );
}
BaseLayout.propTypes = {
  isAuthenticated: propTypes.bool.isRequired,
  isAdmin: propTypes.bool.isRequired,
  onLogOut: propTypes.func.isRequired,
};
