import React from "react";

import { Outlet, NavLink as RRNavLink } from "react-router-dom";
import { Col, Container, Nav, NavItem, NavLink, Row } from "reactstrap";

/**
 * The page layout for the admin page.
 */
export default function AdminLayout() {
  return (
    // TODO: This leads to a nested Container layout, consider creating a new
    //       AdminMainContent.jsx layout like MainContent.jsx without an additional Container
    <Container fluid className="d-flex flex-row flex-fill">
      <Row className="d-flex flex-row flex-fill bg-info">
        <Col sm="2" className="bg-dark p-3">
          <Nav pills navbar vertical justified>
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
              <NavLink tag={RRNavLink} to="/admin/ticket-requests">
                Ticket requests
              </NavLink>
            </NavItem>
            <NavItem className="ms-0 mb-2">
              <NavLink tag={RRNavLink} to="/admin/seat-bookings">
                Seat bookings
              </NavLink>
            </NavItem>
            <NavItem className="ms-0 mb-2">
              <NavLink tag={RRNavLink} to="/admin/van-bookings">
                Van bookings
              </NavLink>
            </NavItem>
            <NavItem className="ms-0 mb-2">
              <NavLink tag={RRNavLink} to="/admin/food-options">
                Food options
              </NavLink>
            </NavItem>
            <NavItem className="ms-0 mb-2">
              <NavLink tag={RRNavLink} to="/admin/food-orders">
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
