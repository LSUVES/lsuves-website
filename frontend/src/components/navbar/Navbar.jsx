import React, { useState } from "react";

import propTypes from "prop-types";
import { NavLink as RRNavLink } from "react-router-dom";
import {
  Button,
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  Navbar as RSNavbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
  UncontrolledDropdown,
} from "reactstrap";

//       TODO: Consider centring navbar links
//       https://stackoverflow.com/questions/18777235/center-content-in-responsive-bootstrap-navbar
export default function Navbar({ isAuthenticated, isAdmin, onLogOut }) {
  const [navIsOpen, setNavIsOpen] = useState(false);
  const [profileIsOpen, setProfileIsOpen] = useState(false);

  return (
    <RSNavbar expand="md" color="light" light sticky="top">
      <NavbarBrand href="/">
        A<span className="text-primary">VGS</span>
      </NavbarBrand>
      <NavbarToggler
        onClick={() => {
          setNavIsOpen(!navIsOpen);
        }}
        className="me-auto"
      />
      <NavbarToggler
        onClick={() => {
          setProfileIsOpen(!profileIsOpen);
        }}
        className="profile-toggler"
      />
      <Collapse isOpen={navIsOpen} navbar>
        <Nav navbar className="me-auto">
          <NavItem>
            <NavLink tag={RRNavLink} to="/blog">
              Blog
            </NavLink>
          </NavItem>
          <UncontrolledDropdown nav inNavbar>
            <DropdownToggle nav caret>
              Events
            </DropdownToggle>
            <DropdownMenu end>
              <DropdownItem tag={RRNavLink} to="/events">
                List
              </DropdownItem>
              <DropdownItem tag={RRNavLink} to="/calendar">
                Calendar
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
          <UncontrolledDropdown nav inNavbar>
            <DropdownToggle nav caret>
              LAN
            </DropdownToggle>
            <DropdownMenu end>
              <DropdownItem tag={RRNavLink} end to="/lan">
                LAN
              </DropdownItem>
              <DropdownItem tag={RRNavLink} to="/lan/rules">
                Rules
              </DropdownItem>
              <DropdownItem tag={RRNavLink} to="/lan/timetable">
                Timetable
              </DropdownItem>
              {/* FIXME: Only show these links if user has a LAN ticket */}
              <DropdownItem tag={RRNavLink} to="/lan/van-booking">
                Van booking
              </DropdownItem>
              <DropdownItem tag={RRNavLink} to="/lan/seat-booking">
                Seat booking
              </DropdownItem>
              {/* FIXME: Only show this link when LAN has started */}
              <DropdownItem tag={RRNavLink} to="/lan/food-order">
                Food order
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
      </Collapse>
      <Collapse isOpen={profileIsOpen} navbar>
        <Nav navbar className="ms-auto">
          {!isAuthenticated && (
            <>
              <NavItem>
                <NavLink tag={RRNavLink} to="/register">
                  Register
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  tag={RRNavLink}
                  to="/login"
                  className="border border-primary rounded"
                >
                  Log in
                </NavLink>
              </NavItem>
            </>
          )}
          {isAuthenticated && (
            <>
              {isAdmin && (
                <NavItem>
                  <NavLink tag={RRNavLink} to="/admin">
                    Admin
                  </NavLink>
                </NavItem>
              )}
              <NavItem>
                <NavLink tag={RRNavLink} to="/profile">
                  Profile
                </NavLink>
              </NavItem>
              <Button
                className="ms-3"
                onClick={() => {
                  onLogOut();
                }}
              >
                Log out
              </Button>
            </>
          )}
        </Nav>
      </Collapse>
    </RSNavbar>
  );
}
Navbar.propTypes = {
  isAuthenticated: propTypes.bool.isRequired,
  isAdmin: propTypes.bool.isRequired,
  onLogOut: propTypes.func.isRequired,
};
