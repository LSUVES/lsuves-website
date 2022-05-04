import React, { useContext, useState } from "react";

import axios from "axios";
import propTypes from "prop-types";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Form, FormGroup, Input, Label } from "reactstrap";

import CsrfTokenContext from "../../contexts/CsrfTokenContext";
import "../../styles/authentication.css";

export default function Login({
  onIsAuthenticatedChange,
  onCsrfTokenCookieChange,
}) {
  const navigate = useNavigate();
  const location = useLocation();

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

  const csrfTokenCookie = useContext(CsrfTokenContext);

  const [canLogin, setCanLogin] = useState(true);
  function login() {
    // Prevent multiple login requests being sent before a response is received.
    if (canLogin === false) {
      return;
    }
    setCanLogin(false);

    // TODO: Perform basic validation before posting

    axios
      .post(
        "/api/users/login/",
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
        // TODO: might be necessary: if (res.status >= 200 && res.status <= 299) {
        // Django changes the value of the CSRF token cookie every time a user
        // logs in, so it's necessary to call the handler for csrfTokenCookie
        // state value updates.
        onCsrfTokenCookieChange();
        onIsAuthenticatedChange(true);
        navigate(location.state?.from?.pathname || "/");
      })
      .catch((err) => {
        // TODO: DRY this out with AxiosError.jsx
        //       Handle username conflicts
        console.log(err);
        setCanLogin(true);
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
    <main className="text-center m-auto form--thin">
      <h2 className="mb-3">Log in</h2>
      {loginError && <Alert color="danger">{loginError}</Alert>}
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          login();
        }}
      >
        <FormGroup floating>
          <Input
            id="username"
            name="username"
            value={username}
            placeholder="Username"
            onInput={(e) => setUsername(e.target.value)}
          />
          <Label for="username">Username</Label>
        </FormGroup>
        <FormGroup floating>
          <Input
            id="password"
            name="password"
            type={passwordInputType}
            value={password}
            placeholder="Password"
            onInput={(e) => setPassword(e.target.value)}
          />
          <Label for="password">Password</Label>
          {/* TODO: Show password by default on mobile devices */}
        </FormGroup>
        <Label className="mb-3">
          <Input
            id="show-password"
            name="show-password"
            type="checkbox"
            onClick={showPassword}
          />{" "}
          Show password
        </Label>
        {/* TODO: Make cookies expire quickly by default and add stay signed in option
                    for longer timer
                    https://docs.djangoproject.com/en/4.0/topics/http/sessions/#browser-length-sessions-vs-persistent-sessions
                    https://docs.djangoproject.com/en/4.0/ref/settings/#session-cookie-age
          <FormGroup>
            <Input id="stay-signed-in" type="checkbox" />
            <Label for="stay-signed-in">Stay signed in</Label>
          </FormGroup> */}
        <FormGroup>
          <Button id="submit" name="submit" color="primary" size="lg" block>
            Log in
          </Button>
        </FormGroup>
      </Form>
      <small>
        Forgot password? <a href="/forgot-password">Reset it here</a>.
      </small>
      <br />
      <small>
        Or <a href="/register">create an account</a>.
      </small>
    </main>
  );
}
Login.propTypes = {
  onIsAuthenticatedChange: propTypes.func.isRequired,
  onCsrfTokenCookieChange: propTypes.func.isRequired,
};
