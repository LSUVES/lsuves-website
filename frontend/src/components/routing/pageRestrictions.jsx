import React, { useState } from "react";

import propTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { Container } from "reactstrap";

/** Wrapper for pages that require user authentication
 * @param {bool} isLoadingAuth - Whether the backend server has replied with the
 *                               user's auth status.
 * @param {bool} isAuthenticated - Whether the user is authenticated or not.
 * @param {ReactNode} AuthFailure - What to return on authentication failure.
 */
export function RequireAuth({
  isLoadingAuth,
  isAuthenticated,
  AuthFailure,
  children,
}) {
  // Show a loading display while waiting for a response from the backend
  // TODO: Swap the text for a spinny, don't use a container
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
export function RequireUnauth({ isLoadingAuth, isAuthenticated, children }) {
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

export function RequireAdmin({ isAdmin, isLoadingAdmin, children }) {
  const [loadingDisplay, setLoadingDisplay] = useState();

  if (isLoadingAdmin) {
    if (!loadingDisplay) {
      setTimeout(() => {
        setLoadingDisplay(<Container>Loading...</Container>);
      }, 1000);
    }
    return <main className="d-flex flex-column">{loadingDisplay}</main>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
RequireAdmin.propTypes = {
  isLoadingAdmin: propTypes.bool.isRequired,
  isAdmin: propTypes.bool.isRequired,
  children: propTypes.node.isRequired,
};
