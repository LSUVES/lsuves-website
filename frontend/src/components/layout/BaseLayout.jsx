import React from "react";

import propTypes from "prop-types";
import { Outlet } from "react-router-dom";
import { Container, Row } from "reactstrap";

import Navbar from "../navbar/Navbar";
// import "../../styles/navbar.css";

/**
 * The layout used by every page of the website. Provides the navigation bar at
 * the top of the screen and a React Router outlet in which all the site's
 * content will render all wrapped within a Bootstrap container.
 * @param {bool} isAuthenticated - Whether the user is authenticated or not.
 * @param {bool} isAdmin - Whether the user is an admin or not.
 * @param {func} onLogOut - A handler for the log out action.
 */
export default function BaseLayout({
  isAuthenticated,
  isAdmin,
  onLogOut,
  currentLanExists,
}) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Container fluid>
        <Row>
          <Navbar
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            onLogOut={onLogOut}
            currentLanExists={currentLanExists}
          />
        </Row>
      </Container>
      {/* <Container className="d-flex flex-row flex-fill bg-danger"> */}
      {/* <Row className="d-flex flex-row flex-fill"> */}
      <Outlet />
      {/* </Row> */}
      {/* </Container> */}
    </div>
  );
}
BaseLayout.propTypes = {
  isAuthenticated: propTypes.bool.isRequired,
  isAdmin: propTypes.bool.isRequired,
  onLogOut: propTypes.func.isRequired,
  currentLanExists: propTypes.bool.isRequired,
};
