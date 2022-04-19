import React from "react";

import { Outlet, NavLink as RRNavLink } from "react-router-dom";
import { Col, Nav, NavItem, NavLink, Row } from "reactstrap";

export default function AdminLayout() {
  return (
    // FIXME: Remove scrollbars by encapsulating rows in MainContent,
    //        replace sidebar with something else
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
        </Nav>
      </Col>
      <Col sm="10">
        <Outlet />
      </Col>
    </Row>
  );
}
