// import React, { useEffect, useState } from "react";
import React, { useState } from "react";

import axios from "axios";
import propTypes from "prop-types";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Container, Form, FormGroup, Input, Label } from "reactstrap";

import "./LoginAndRegister.css";
import getCookie from "../utils/getCookie";

// export default function Login({ isAuthenticated, onIsAuthenticatedChange }) {
export default function Login({ onIsAuthenticatedChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate("/");
  //   }
  // }, [isAuthenticated]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [passwordInputType, setPasswordInputType] = useState("password");
  const showPassword = () => {
    if (passwordInputType === "password") {
      setPasswordInputType("text");
    } else {
      setPasswordInputType("password");
    }
  };

  function login() {
    let csrfTokenCookie = getCookie("csrftoken");
    if (!csrfTokenCookie) {
      axios
        .get("/api/csrf/")
        .then(() => {
          csrfTokenCookie = getCookie("csrftoken");
        })
        .catch((err) => {
          console.log(err);
        });
    }
    // TODO: Perform basic validation before posting
    axios
      .post(
        "/api/login/",
        {
          username,
          password,
        },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      .then(() => {
        // if (res.status >= 200 && res.status <= 299) {
        onIsAuthenticatedChange(true);
        // navigate(location.state?.from?.pathname || "/");
        navigate(location.state?.from?.pathname || "/");
      })
      .catch((err) => {
        // TODO: DRY this out with AxiosError.jsx
        console.log(err);
        if (err.response) {
          if (err.response.status === 400) {
            setLoginError("Invalid username and/or password.");
          }
        } else if (err.request) {
          console.log(err.request);
        } else {
          console.log(err.message);
        }
      });
  }
  return (
    <main className="d-flex flex-column vh-100">
      <Container className="m-auto AccountCredentialsForm">
        <h2>Log in</h2>
        {loginError && <p className="bg-danger text-white">{loginError}</p>}
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            login();
          }}
        >
          <FormGroup>
            <Label for="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={username}
              onInput={(e) => setUsername(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="password">Password</Label>
            <Input
              id="password"
              name="password"
              type={passwordInputType}
              value={password}
              onInput={(e) => setPassword(e.target.value)}
            />
            {/* TODO: Show password by default on mobile devices */}
            <Input
              id="show-password"
              name="show-password"
              type="checkbox"
              onClick={showPassword}
            />{" "}
            <Label for="show-password">Show Password</Label>
          </FormGroup>

          {/* TODO: Make cookies expire quickly by default and add stay signed in option
                    for longer timer
                    https://docs.djangoproject.com/en/4.0/topics/http/sessions/#browser-length-sessions-vs-persistent-sessions
                    https://docs.djangoproject.com/en/4.0/ref/settings/#session-cookie-age
          <FormGroup>
            <Input id="stay-signed-in" type="checkbox" />
            <Label for="stay-signed-in">Stay signed in</Label>
          </FormGroup> */}
          <FormGroup>
            <Button id="submit" name="submit">
              Log in
            </Button>
          </FormGroup>
        </Form>
        {/* TODO: Add forgot password button */}
        <small>
          Or <a href="/register">create an account</a>.
        </small>
      </Container>
    </main>
  );
}
Login.propTypes = {
  // isAuthenticated: propTypes.bool.isRequired,
  onIsAuthenticatedChange: propTypes.func.isRequired,
};
