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
          <Nav pills navbar vertical>
            <NavItem className="ms-0 mb-2">
              <NavLink tag={RRNavLink} end to="/admin" className="text-center">
                Dashboard
              </NavLink>
            </NavItem>
            <NavItem className="ms-0 mb-2">
              <NavLink
                tag={RRNavLink}
                to="/admin/ticket-requests"
                className="text-center"
              >
                Ticket requests
              </NavLink>
            </NavItem>
            <NavItem className="ms-0 mb-2">
              <NavLink tag={RRNavLink} to="/admin/blog" className="text-center">
                Blog
              </NavLink>
            </NavItem>
            <NavItem className="ms-0 mb-2">
              <NavLink
                tag={RRNavLink}
                to="/admin/events"
                className="text-center"
              >
                Events
              </NavLink>
            </NavItem>
            <NavItem className="ms-0 mb-2">
              <NavLink
                tag={RRNavLink}
                to="/admin/users"
                className="text-center"
              >
                Users
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
