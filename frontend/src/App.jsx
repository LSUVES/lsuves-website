import React, { useEffect, useState } from "react";

import axios from "axios";
import propTypes from "prop-types";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Container } from "reactstrap";

import BaseLayout from "./baseLayout/BaseLayout";
import Blog from "./blog/Blog";
import Calendar from "./calendar/Calendar";
import Event from "./event/Event";
import Events from "./event/Events";
import Home from "./home/Home";
import Lan from "./lan/Lan";
import LanRules from "./lan/LanRules";
import Login from "./login_and_register/Login";
import Register from "./login_and_register/Register";
import Profile from "./profile/Profile";

import "./App.css";

/** Wrapper for pages that require user authentication
 * @param {bool} isLoadingAuth - Whether the backend server has replied with the
 *                               user's auth status.
 * @param {bool} isAuthenticated - Whether the user is authenticated or not.
 * @param {ReactNode} AuthFailure - What to return on authentication failure.
 */
function RequireAuth({
  isLoadingAuth,
  isAuthenticated,
  AuthFailure,
  children,
}) {
  // Show a loading display while waiting for a response from the backend
  // TODO: Swap the text for a spinny
  const [loadingDisplay, setLoadingDisplay] = useState();
  if (isLoadingAuth) {
    // If loading display hasn't been set yet (to prevent infinite updates),
    // schedule it to be set after a second to allow for standard latency
    // FIXME: use useEffect cleanup function to ensure this subscription
    //        (and the one in RequireUnAuth) is cancelled
    if (!loadingDisplay) {
      setTimeout(() => {
        setLoadingDisplay(<Container>Loading...</Container>);
      }, 1000);
    }
    return <main className="d-flex flex-column">{loadingDisplay}</main>;
  }
  // If user isn't authenticated, return AuthFailure
  if (!isAuthenticated) {
    return AuthFailure;
  }

  // If the user's authenticated, return the children
  return children;
}
RequireAuth.propTypes = {
  isLoadingAuth: propTypes.bool.isRequired,
  isAuthenticated: propTypes.bool.isRequired,
  AuthFailure: propTypes.node.isRequired,
  children: propTypes.node.isRequired,
};

// The opposite of RequireAuth, for the register and login page
function RequireUnauth({ isLoadingAuth, isAuthenticated, children }) {
  const [loadingDisplay, setLoadingDisplay] = useState();
  if (isLoadingAuth) {
    if (!loadingDisplay) {
      setTimeout(() => {
        setLoadingDisplay(<Container>Loading...</Container>);
      }, 1000);
    }
    return <main className="d-flex flex-column">{loadingDisplay}</main>;
  }
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
RequireUnauth.propTypes = {
  isLoadingAuth: propTypes.bool.isRequired,
  isAuthenticated: propTypes.bool.isRequired,
  children: propTypes.node.isRequired,
};

// TODO: Add more comments
//       Fix eslint exhaustive deps warnings:
//       https://typeofnan.dev/you-probably-shouldnt-ignore-react-hooks-exhaustive-deps-warnings/
//       Fix padding:
//       https://stackoverflow.com/a/20080963
//       Consider using context for auth
//       https://ui.dev/react-router-protected-routes-authentication
//       https://stackblitz.com/github/remix-run/react-router/tree/main/examples/auth?file=src/App.tsx
export default function App() {
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // TODO: Check you can't just pass setState
  const handleIsAuthenticatedChange = (newIsAuthenticated) => {
    setIsAuthenticated(newIsAuthenticated);
  };

  function getSession() {
    axios
      .get("/api/csrf/", { withCredentials: true })
      .then(() => {
        console.log(document.cookie);
      })
      .catch((err) => {
        console.log(err);
      });
    // TODO: display an alert if user times out (instead of redirecting them?)
    axios
      .get("/api/session/", { withCredentials: true, timeout: 10000 })
      .then((res) => {
        console.log(res.data);
        if (res.data.isAuthenticated) {
          handleIsAuthenticatedChange(true);
        } else {
          handleIsAuthenticatedChange(false);
        }
      })
      .catch((err) => console.log(err))
      .then(() => {
        setIsLoadingAuth(false);
      });
  }

  useEffect(() => {
    getSession();
  }, []);

  const handleLogOut = () => {
    axios
      .get("/api/logout/", { withCredentials: true })
      .then((res) => {
        console.log(res.data);
        if (res.status >= 200 && res.status <= 299) {
          handleIsAuthenticatedChange(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // A simple react element to be used on pages that require authentication that
  // redirects unauthenticated users to the login page, taking note of the page
  // they were trying to access so they can be redirected afterwards.
  function AuthFailureRedirect() {
    const location = useLocation();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <BaseLayout
              isAuthenticated={isAuthenticated}
              onLogOut={handleLogOut}
            />
          }
        >
          <Route index element={<Home />} />
          <Route path="blog" element={<Blog />} />
          <Route path="events">
            <Route index element={<Events />} />
            <Route path=":eventId" element={<Event />} />
          </Route>
          <Route path="calendar" element={<Calendar />} />
          <Route path="lan" element={<Lan />} />
          <Route path="lan/rules" element={<LanRules />} />
          <Route
            path="login"
            element={
              <RequireUnauth
                isLoadingAuth={isLoadingAuth}
                isAuthenticated={isAuthenticated}
              >
                <Login
                  isAuthenticated={isAuthenticated}
                  onIsAuthenticatedChange={handleIsAuthenticatedChange}
                />
              </RequireUnauth>
            }
          />
          <Route
            path="profile"
            element={
              <RequireAuth
                isLoadingAuth={isLoadingAuth}
                isAuthenticated={isAuthenticated}
                AuthFailure={<AuthFailureRedirect />}
              >
                <Profile isAuthenticated={isAuthenticated} />
              </RequireAuth>
            }
          />
          <Route
            path="register"
            element={
              <RequireUnauth
                isLoadingAuth={isLoadingAuth}
                isAuthenticated={isAuthenticated}
              >
                <Register isAuthenticated={isAuthenticated} />
              </RequireUnauth>
            }
          />
          {/* TODO: Create a component for rendering error messages */}
          <Route
            path="*"
            element={
              <main>
                <Container>
                  <p>Page not found</p>
                </Container>
              </main>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
