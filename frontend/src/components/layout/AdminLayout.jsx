import React from "react";

import { Outlet, NavLink as RRNavLink } from "react-router-dom";
import { Col, Nav, NavItem, NavLink, Row } from "reactstrap";

/**
 * The page layout for the admin page.
 */
export default function AdminLayout() {
  return (
    // FIXME: Don't use row for sidebar without encapsulating container
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
            <NavLink tag={RRNavLink} to="/admin/events" className="text-center">
              Events
            </NavLink>
          </NavItem>
        </Nav>
      </Col>
      <Col sm="10" className="d-flex flex-column flex-fill">
        <Outlet />
      </Col>
    </Row>
  );
}
