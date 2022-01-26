import React, { useState } from "react";

import { NavLink as RRNavLink, Outlet } from "react-router-dom";
import {
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
  UncontrolledDropdown,
} from "reactstrap";

import "./App.css";
// https://stackoverflow.com/questions/18777235/center-content-in-responsive-bootstrap-navbar
// Fix padding:
// https://stackoverflow.com/a/20080963
export default function App() {
  const [navIsOpen, setNavIsOpen] = useState(false);
  return (
    <>
      <Navbar expand="md" color="light" light>
        <NavbarBrand href="/">
          A<span className="text-primary">VGS</span>
        </NavbarBrand>
        <NavbarToggler
          onClick={() => {
            setNavIsOpen(!navIsOpen);
          }}
        />
        <Collapse isOpen={navIsOpen} navbar>
          <Nav navbar>
            {/* className="m-auto"> */}
            <NavItem>
              <NavLink tag={RRNavLink} to="/blog">
                Blog
              </NavLink>
            </NavItem>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Events
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem tag={RRNavLink} to="/events">
                  List
                </DropdownItem>
                <DropdownItem tag={RRNavLink} to="/calendar">
                  Calendar
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Collapse>
      </Navbar>
      <Outlet />
    </>
  );
}
