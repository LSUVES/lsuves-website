import React, { useState } from "react";

import axios from "axios";
import propTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Button, Container, Form, FormGroup, Input, Label } from "reactstrap";

// import { Redirect } from "react-router-dom";
import "./LoginAndRegister.css";
import getCookie from "../utils/getCookie";

export default function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  // Need state for remember me?
  const navigate = useNavigate();

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
        setIsAuthenticated(true);
        setLoginError(""); // Doesn't update in time so probably redundant
        // FIXME: Use <Redirect> instead to prevent logged-in users from accessing the page
        navigate("/");
        // setUsername("");
        // setPassword("");
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
              type="password"
              value={password}
              onInput={(e) => setPassword(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Input id="remember-me" type="checkbox" />
            <Label for="remember-me">Remember me</Label>
          </FormGroup>
          <FormGroup>
            {/* TODO: should this be type="submit"? */}
            <Button id="submit" name="submit">
              Log in
            </Button>
          </FormGroup>
        </Form>
        <small>
          Or <a href="/register">create an account</a>.
        </small>
      </Container>
    </main>
  );
}
Login.propTypes = {
  setIsAuthenticated: propTypes.func.isRequired,
};
