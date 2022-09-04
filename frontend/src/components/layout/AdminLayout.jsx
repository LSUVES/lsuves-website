// import React, { useEffect, useState } from "react";
import React from "react";

import propTypes from "prop-types";
// import axios from "axios";
import { Outlet, NavLink as RRNavLink } from "react-router-dom";
import { Col, Container, Nav, NavItem, NavLink, Row } from "reactstrap";

/**
 * The page layout for the admin page.
 */
export default function AdminLayout({ currentLanExists }) {
  return (
    // TODO: This leads to a nested Container layout, consider creating a new
    //       AdminMainContent.jsx layout like MainContent.jsx without an additional Container
    //       Group everything LAN-related
    <Container fluid className="d-flex flex-row flex-fill">
      <Row className="d-flex flex-row flex-fill">
        <Col sm="2" className="bg-dark p-3">
          <Nav pills navbar vertical justified className="admin-nav">
            <NavItem className="ms-0 mb-2">
              <NavLink tag={RRNavLink} end to="/admin">
                Dashboard
              </NavLink>
            </NavItem>
            <NavItem className="ms-0 mb-2">
              <NavLink tag={RRNavLink} to="/admin/blog">
                Blog
              </NavLink>
            </NavItem>
            <NavItem className="ms-0 mb-2">
              <NavLink tag={RRNavLink} to="/admin/events">
                Events
              </NavLink>
            </NavItem>
            <NavItem className="ms-0 mb-2">
              <NavLink tag={RRNavLink} to="/admin/users">
                Users
              </NavLink>
            </NavItem>
            <NavItem className="ms-0 mb-2">
              <NavLink
                tag={RRNavLink}
                to="/admin/tickets"
                disabled={!currentLanExists}
              >
                Tickets
              </NavLink>
            </NavItem>
            <NavItem className="ms-0 mb-2">
              <NavLink
                tag={RRNavLink}
                to="/admin/seat-bookings"
                disabled={!currentLanExists}
              >
                Seat bookings
              </NavLink>
            </NavItem>
            <NavItem className="ms-0 mb-2">
              <NavLink
                tag={RRNavLink}
                to="/admin/van-bookings"
                disabled={!currentLanExists}
              >
                Van bookings
              </NavLink>
            </NavItem>
            <NavItem className="ms-0 mb-2">
              <NavLink tag={RRNavLink} to="/admin/food-options">
                Food options
              </NavLink>
            </NavItem>
            <NavItem className="ms-0 mb-2">
              <NavLink
                tag={RRNavLink}
                to="/admin/food-orders"
                disabled={!currentLanExists}
              >
                Food orders
              </NavLink>
            </NavItem>
          </Nav>
        </Col>
        <Col sm="10" className="d-flex flex-column flex-fill">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
}
AdminLayout.propTypes = {
  currentLanExists: propTypes.bool.isRequired,
};
