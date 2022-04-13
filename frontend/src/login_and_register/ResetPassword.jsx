import React, { useEffect, useState } from "react";

import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
} from "reactstrap";

import "./LoginAndRegister.css";
import useUpdateEffect from "../hooks/useUpdateEffect";
import { MIN_PASSWORD_LENGTH } from "./accountValidation";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [tokenIsValid, setTokenIsValid] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordIsValid, setPasswordIsValid] = useState(null);
  const [repeatPassword, setRepeatPassword] = useState("");
  const [repeatPasswordIsValid, setRepeatPasswordIsValid] = useState(null);

  //   TODO: Import these functions as well.
  function checkPassword() {
    let isValid = true;
    if (password.length < MIN_PASSWORD_LENGTH) {
      isValid = false;
    }
    setPasswordIsValid(isValid);
    return isValid;
  }
  useUpdateEffect(checkPassword, [password]);

  function checkRepeatPassword() {
    let isValid = true;
    if (password !== repeatPassword) {
      isValid = false;
    }
    setRepeatPasswordIsValid(isValid);
    return isValid;
  }
  useUpdateEffect(checkRepeatPassword, [password, repeatPassword]);

  function checkAll() {
    let isValid = checkPassword();
    // TODO: Does using passwordIsValid lead to a race condition?
    if (passwordIsValid) {
      isValid = isValid && checkRepeatPassword();
    }
    return isValid;
  }

  useEffect(() => {
    axios
      .post(
        "/api/users/check_password_reset_token/",
        {
          uid,
          token,
        },
        {
          withCredentials: true,
        }
      )
      .then(() => {
        // if (res.status >= 200 && res.status <= 299) {
        setTokenIsValid(true);
      })
      .catch((err) => {
        // TODO: DRY this out with AxiosError.jsx
        console.log(err);
        if (err.response) {
          // if (err.response.status === 400) {
          // }
          console.log(err.response);
        } else if (err.request) {
          console.log(err.request);
        } else {
          console.log(err.message);
        }
      });
  }, []);

  function resetPassword() {
    if (!checkAll()) {
      return;
    }

    axios
      .post(
        "/api/users/reset_password/",
        {
          uid,
          token,
          password,
        },
        {
          withCredentials: true,
        }
      )
      .then(() => {
        // if (res.status >= 200 && res.status <= 299) {
        navigate("/login", { replace: true });
      })
      .catch((err) => {
        // TODO: DRY this out with AxiosError.jsx
        console.log(err);
        if (err.response) {
          // if (err.response.status === 400) {
          // }
          console.log(err.response);
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
        {tokenIsValid && (
          <>
            <h2>Reset password</h2>
            <p>Enter a new password for your account.</p>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                resetPassword();
              }}
            >
              <FormGroup>
                <Label for="password">New password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onInput={(e) => setPassword(e.target.value)}
                />
                {!passwordIsValid && (
                  <FormFeedback>
                    Password must be at least {MIN_PASSWORD_LENGTH} characters.
                  </FormFeedback>
                )}
              </FormGroup>
              {/* TODO: Put this side-by-side with password input */}
              <FormGroup>
                <Label for="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={repeatPassword}
                  onInput={(e) => setRepeatPassword(e.target.value)}
                  invalid={passwordIsValid && repeatPasswordIsValid === false}
                />
                {!repeatPasswordIsValid && (
                  <FormFeedback>Passwords do not match.</FormFeedback>
                )}
              </FormGroup>
              <FormGroup>
                <Button id="submit" name="submit">
                  Reset password
                </Button>
              </FormGroup>
            </Form>
          </>
        )}
        {!tokenIsValid && <h2>Invalid token</h2>}
      </Container>
    </main>
  );
}
