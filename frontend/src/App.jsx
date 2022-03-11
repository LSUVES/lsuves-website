import React, { useEffect, useState } from "react";

import axios from "axios";
import PropTypes from "prop-types";
import { NavLink as RRNavLink, Outlet } from "react-router-dom";
import {
  Button,
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
export default function App({ isAuthenticated, updateIsAuthenticated }) {
  const [navIsOpen, setNavIsOpen] = useState(false);
  const [profileIsOpen, setProfileIsOpen] = useState(false);

  function getSession() {
    axios
      .get("/api/csrf/", { withCredentials: true })
      .then(() => {
        console.log(document.cookie);
      })
      .catch((err) => {
        console.log(err);
      });
    axios
      .get("/api/session/", { withCredentials: true })
      .then((res) => {
        console.log(res.data);
        if (res.data.isAuthenticated) {
          updateIsAuthenticated(true);
        } else {
          updateIsAuthenticated(false);
        }
      })
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    getSession();
  }, []);

  // FIXME: redirect if on a page which requires authentication, e.g., profile
  function logOut() {
    axios
      .get("/api/logout/", { withCredentials: true })
      .then((res) => {
        console.log(res.data);
        if (res.status >= 200 && res.status <= 299) {
          updateIsAuthenticated(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <>
      <Navbar expand="md" color="light" light sticky="top">
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
                <DropdownItem tag={RRNavLink} to="/lan">
                  LAN
                </DropdownItem>
                <DropdownItem tag={RRNavLink} to="/lan/rules">
                  Rules
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <NavItem>
              <NavLink tag={RRNavLink} to="/aaa">
                AAA
              </NavLink>
            </NavItem>
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
                <NavItem>
                  <NavLink tag={RRNavLink} to="/profile">
                    Profile
                  </NavLink>
                </NavItem>
                <Button
                  onClick={() => {
                    logOut();
                  }}
                >
                  Log out
                </Button>
              </>
            )}
          </Nav>
        </Collapse>
      </Navbar>
      <Outlet />
    </>
  );
}
App.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  updateIsAuthenticated: PropTypes.func.isRequired,
};
