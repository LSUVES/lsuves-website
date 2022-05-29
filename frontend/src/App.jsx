import React, { useEffect, useState } from "react";

import axios from "axios";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import "./App.css";

import AdminLayout from "./components/layout/AdminLayout";
import BaseLayout from "./components/layout/BaseLayout";
import {
  RequireAdmin,
  RequireAuth,
  RequireLanTicket,
  RequireUnauth,
} from "./components/routing/pageRestrictions";
import CsrfTokenContext from "./contexts/CsrfTokenContext";
import AdminBlog from "./pages/admin/Blog";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminEvents from "./pages/admin/Events";
import AdminFoodOptions from "./pages/admin/FoodOptions";
import AdminFoodOrders from "./pages/admin/FoodOrders";
import AdminSeatBookings from "./pages/admin/SeatBookings";
import AdminTickets from "./pages/admin/Tickets";
import AdminUsers from "./pages/admin/Users";
import AdminVanBookings from "./pages/admin/VanBookings";
import ForgotPassword from "./pages/authentication/ForgotPassword";
import Login from "./pages/authentication/Login";
import Register from "./pages/authentication/Register";
import ResetPassword from "./pages/authentication/ResetPassword";
import Blog from "./pages/blog/Blog";
import Post from "./pages/blog/Post";
import Calendar from "./pages/calendar/Calendar";
import PageNotFound from "./pages/errors/PageNotFound";
import Event from "./pages/event/Event";
import Events from "./pages/event/Events";
import Home from "./pages/home/Home";
import Lan from "./pages/lan/Lan";
import LanFoodOrderForm from "./pages/lan/LanFoodOrderForm";
import LanMap from "./pages/lan/LanMap";
import LanRules from "./pages/lan/LanRules";
import LanSeatBookingForm from "./pages/lan/LanSeatBookingForm";
import LanTimetable from "./pages/lan/LanTimetable";
import LanVanBookingForm from "./pages/lan/LanVanBookingForm";
// import LanMap from "./pages/lan/Map";
import Profile from "./pages/profile/Profile";
import getCookie from "./utils/getCookie";

// TODO: Add more comments
//       Fix eslint exhaustive deps warnings:
//       https://typeofnan.dev/you-probably-shouldnt-ignore-react-hooks-exhaustive-deps-warnings/
//       Fix padding:
//       https://stackoverflow.com/a/20080963
//       Consider using context for auth
//       https://ui.dev/react-router-protected-routes-authentication
//       https://stackblitz.com/github/remix-run/react-router/tree/main/examples/auth?file=src/App.tsx

/**
 * The root element of the website. Provides the structure for the routes as
 * well as any context and restrictions they require.
 */
export default function App() {
  const [csrfTokenCookie, setCsrfTokenCookie] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [currentLanExists, setCurrentLanExists] = useState(false);
  const [hasTicket, setHasTicket] = useState(false);
  const [waitingForTicketResponse, setWaitingForTicketResponse] =
    useState(true);

  // TODO: Just pass setIsAuthenticatedState to components?
  const handleIsAuthenticatedChange = (newIsAuthenticated) => {
    setIsAuthenticated(newIsAuthenticated);
  };

  function getSession() {
    // Gets the user's session information from the backend, i.e., whether
    // they're authenticated and an admin user.
    // TODO: Display an alert if user times out (instead of redirecting them?)
    //       Compress the isAdmin lookup into the session lookup, at any rate don't request if unauthed.
    axios
      .get("/api/users/is_authenticated/", {
        withCredentials: true,
        timeout: 10000,
      })
      .then((res) => {
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
    axios
      .get(`/api/users/profile/`, { withCredentials: true })
      .then((res) => {
        console.log(`profile fetched, isAdmin=${res.data.isAdmin}`);
        setIsAdmin(res.data.isAdmin);
        setIsLoadingAdmin(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // When the value of the CSRF token cookie changes, either on page load or log in,
  // send a request to fetch the user's session.
  useEffect(() => {
    if (csrfTokenCookie) {
      getSession();
    }
  }, [csrfTokenCookie]);

  const handleCsrfTokenCookieChange = () => {
    // Updates the csrfTokenCookie state to the value of the "csrftoken" cookie.
    setCsrfTokenCookie(getCookie("csrftoken"));
  };

  function getCsrfTokenCookie() {
    // Sends a request to the backend that sets the value of the "csrftoken"
    // cookie and then calls the handler for the csrfTokenCookie state.
    axios
      .get("/api/csrf/", { withCredentials: true })
      .then(() => {
        handleCsrfTokenCookieChange();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // On initial page load, ensure the CSRF token cookie is set by sending a
  // request to the backend.
  useEffect(() => {
    getCsrfTokenCookie();
  }, []);

  const handleLogOut = () => {
    // Handle the user logging out.
    axios
      .post(
        "/api/users/logout/",
        {},
        { withCredentials: true, headers: { "X-CSRFToken": csrfTokenCookie } }
      )
      .then((res) => {
        if (res.status >= 200 && res.status <= 299) {
          handleIsAuthenticatedChange(false);
          // TODO: Shouldn't this be handleCsrfTokenCookieChange? Or is it even necessary with the useEffect?
          getCsrfTokenCookie();
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

  // Gets whether there is an upcoming/ongoing LAN.
  function getCurrentLanExists() {
    axios
      .get("/api/events/current_lan/")
      .then(() => {
        setCurrentLanExists(true);
      })
      .catch(() => setCurrentLanExists(false));
  }

  useEffect(() => {
    getCurrentLanExists();
  }, []);

  // FIXME: Trigger this when admin approves their own ticket.
  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      axios
        .get("/api/lan-tickets/my_lan_ticket/", { withCredentials: true })
        .then((res) => {
          setHasTicket(true);
          setWaitingForTicketResponse(false);
          console.log(res);
        })
        .catch((err) => {
          setHasTicket(false);
          setWaitingForTicketResponse(false);
          console.log(err);
        });
    }
  }, [isAuthenticated, isLoadingAuth]);

  return (
    <CsrfTokenContext.Provider value={csrfTokenCookie}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <BaseLayout
                isAuthenticated={isAuthenticated}
                isAdmin={isAdmin}
                onLogOut={handleLogOut}
                currentLanExists={currentLanExists}
              />
            }
          >
            <Route index element={<Home />} />
            <Route
              path="admin"
              element={
                <RequireAuth
                  isLoadingAuth={isLoadingAuth}
                  isAuthenticated={isAuthenticated}
                  AuthFailure={<AuthFailureRedirect />}
                >
                  <RequireAdmin
                    isLoadingAdmin={isLoadingAdmin}
                    isAdmin={isAdmin}
                  >
                    <AdminLayout currentLanExists={currentLanExists} />
                  </RequireAdmin>
                </RequireAuth>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="tickets" element={<AdminTickets />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route
                path="events"
                element={
                  <AdminEvents
                    handleLanCreationDeletion={() => getCurrentLanExists()}
                  />
                }
              />
              <Route path="food-options" element={<AdminFoodOptions />} />
              <Route path="food-orders" element={<AdminFoodOrders />} />
              <Route path="seat-bookings" element={<AdminSeatBookings />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="van-bookings" element={<AdminVanBookings />} />
            </Route>
            <Route path="blog">
              <Route index element={<Blog />} />
              <Route path=":postId" element={<Post />} />
            </Route>
            <Route path="events">
              <Route index element={<Events />} />
              <Route path=":eventId" element={<Event />} />
            </Route>
            <Route path="calendar" element={<Calendar />} />
            {/* TODO: Use an index route?
                      Add RequireLan page restriction */}
            <Route
              path="lan"
              element={<Lan isAuthenticated={isAuthenticated} />}
            />
            <Route path="lan/rules" element={<LanRules />} />
            <Route path="lan/map" element={<LanMap />} />
            <Route path="lan/timetable" element={<LanTimetable />} />
            <Route
              path="lan/van-booking"
              element={
                <RequireAuth
                  isLoadingAuth={isLoadingAuth}
                  isAuthenticated={isAuthenticated}
                  AuthFailure={<AuthFailureRedirect />}
                >
                  <RequireLanTicket
                    isLoadingHasLanTicket={waitingForTicketResponse}
                    hasLanTicket={hasTicket}
                  >
                    <LanVanBookingForm />
                  </RequireLanTicket>
                </RequireAuth>
              }
            />
            <Route
              path="lan/seat-booking"
              element={
                <RequireAuth
                  isLoadingAuth={isLoadingAuth}
                  isAuthenticated={isAuthenticated}
                  AuthFailure={<AuthFailureRedirect />}
                >
                  <RequireLanTicket
                    isLoadingHasLanTicket={waitingForTicketResponse}
                    hasLanTicket={hasTicket}
                  >
                    <LanSeatBookingForm />
                  </RequireLanTicket>
                </RequireAuth>
              }
            />
            <Route
              path="lan/food-order"
              element={
                <RequireAuth
                  isLoadingAuth={isLoadingAuth}
                  isAuthenticated={isAuthenticated}
                  AuthFailure={<AuthFailureRedirect />}
                >
                  <RequireLanTicket
                    isLoadingHasLanTicket={waitingForTicketResponse}
                    hasLanTicket={hasTicket}
                  >
                    <LanFoodOrderForm />
                  </RequireLanTicket>
                </RequireAuth>
              }
            />
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
                    onCsrfTokenCookieChange={handleCsrfTokenCookieChange}
                  />
                </RequireUnauth>
              }
            />
            <Route
              path="forgot-password"
              element={
                <RequireUnauth
                  isLoadingAuth={isLoadingAuth}
                  isAuthenticated={isAuthenticated}
                >
                  <ForgotPassword />
                </RequireUnauth>
              }
            />
            <Route
              path="reset-password"
              element={
                <RequireUnauth
                  isLoadingAuth={isLoadingAuth}
                  isAuthenticated={isAuthenticated}
                >
                  <ResetPassword />
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
                  <Profile />
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
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CsrfTokenContext.Provider>
  );
}
