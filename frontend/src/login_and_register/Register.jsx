import React, { useEffect, useRef, useState } from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
} from "reactstrap";

import getCookie from "../utils/getCookie";

function useUpdateEffect(effect, dependencies = []) {
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return undefined;
    }
    return effect();
  }, dependencies);
}

// TODO: Refactor this to integrate with Bootstrap's validation better: https://getbootstrap.com/docs/5.0/forms/validation/
export default function Register() {
  const [username, setUsername] = useState("");
  const [usernameIsValid, setUsernameIsValid] = useState(null);
  const [email, setEmail] = useState("");
  const [emailIsValid, setEmailIsValid] = useState(null);
  const [deletionDate, setDeletionDate] = useState(
    `${new Date().getFullYear() + 3}-07-01`
  );
  const [deletionDateIsValid, setDeletionDateIsValid] = useState(null);
  const [deletionDateFeedback, setDeletionDateFeedback] = useState("");
  const [password, setPassword] = useState("");
  const [passwordIsValid, setPasswordIsValid] = useState(null);
  // const [passwordFeedback, setPasswordFeedback] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [repeatPasswordIsValid, setRepeatPasswordIsValid] = useState(null);
  // const [repeatPasswordFeedback, setRepeatPasswordFeedback] = useState([]);
  const [registerError, setRegisterError] = useState("");

  const navigate = useNavigate();

  const MAX_USERNAME_LENGTH = 150;
  const MIN_DATE = new Date();
  MIN_DATE.setMonth(MIN_DATE.getMonth() + 1);
  MIN_DATE.setDate(1);
  MIN_DATE.setHours(0, 0, 0, 0);
  const MAX_DATE = new Date();
  MAX_DATE.setFullYear(MAX_DATE.getFullYear() + 5, 7, 1);
  MAX_DATE.setHours(0, 0, 0, 0);
  const MIN_PASSWORD_LENGTH = 8;

  function checkUsername() {
    // Checks whether username is a valid string but not whether it's free
    // TODO: Check it only contains valid characters (letters, digits, and restricted symbols)
    let isValid = true;
    if (username.length === 0 || username.length > MAX_USERNAME_LENGTH) {
      isValid = false;
    }
    setUsernameIsValid(isValid);
    return isValid;
  }
  useUpdateEffect(checkUsername, [username]);

  function checkEmail() {
    let isValid = true;
    // TODO: Consider implementing a more thorough check: https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
    if (email.length === 0) {
      isValid = false;
    }
    setEmailIsValid(isValid);
    return isValid;
  }
  useUpdateEffect(checkEmail, [email]);

  function checkDeletionDate() {
    let isValid = true;
    let feedback = "";
    const deletionDateDate = new Date(deletionDate);
    if (deletionDateDate < MIN_DATE) {
      feedback =
        "Deletion date must be at least a month from the present. You can delete your account manually at any time.";
      isValid = false;
    } else if (deletionDateDate > MAX_DATE) {
      feedback =
        "Deletion date cannot be longer than five years from the present. You can change this later.";
      isValid = false;
    }
    setDeletionDateIsValid(isValid);
    setDeletionDateFeedback(feedback);
    return isValid;
  }
  useUpdateEffect(checkDeletionDate, [deletionDate]);

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
    let isValid =
      checkUsername() && checkEmail() && checkDeletionDate() && checkPassword();
    if (passwordIsValid) {
      isValid = isValid && checkRepeatPassword();
    }
    return isValid;
  }

  function register() {
    if (!checkAll()) {
      // TODO: Emphasise errors?
      return;
    }

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
        "/api/register/",
        {
          username,
          email,
          deletion_date: deletionDate,
          password,
        },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      .then(() => {
        // if (res.status >= 200 && res.status <= 299) {
        setRegisterError(""); // Doesn't update in time so probably redundant
        navigate("/");
      })
      .catch((err) => {
        // TODO: DRY this out with AxiosError.jsx
        console.log(err);
        if (err.response) {
          // FIXME: Get details from response
          setRegisterError("Couldn't create account.");
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
        <h2>Create an account</h2>
        {registerError && (
          <p className="bg-danger text-white">{registerError}</p>
        )}
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            register();
          }}
        >
          <FormGroup>
            <Label for="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={username}
              onInput={(e) => setUsername(e.target.value)}
              invalid={usernameIsValid === false}
            />
            {!usernameIsValid && (
              <FormFeedback>
                Username must be not be blank and contain no more than{" "}
                {MAX_USERNAME_LENGTH} characters
              </FormFeedback>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="email">Email</Label>
            {/* FIXME: Why does the type helptext lag? It's Chrome. */}
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onInput={(e) => setEmail(e.target.value)}
              invalid={emailIsValid === false}
            />
            {!emailIsValid && (
              <FormFeedback>Please enter a valid email.</FormFeedback>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="deletionDate">Date of account deletion</Label>
            {/* FIXME: Default value not working? */}
            <Input
              id="deletionDate"
              name="deletionDate"
              type="date"
              defaultValue={deletionDate}
              onInput={(e) => setDeletionDate(e.target.value)}
              invalid={deletionDateIsValid === false}
            />
            {deletionDateFeedback && (
              <FormFeedback>{deletionDateFeedback}</FormFeedback>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onInput={(e) => setPassword(e.target.value)}
              invalid={passwordIsValid === false}
            />
            {!passwordIsValid && (
              <FormFeedback>
                Password must be at least {MIN_PASSWORD_LENGTH} characters.
              </FormFeedback>
            )}
          </FormGroup>
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
              Create account
            </Button>
          </FormGroup>
        </Form>
        <small>
          Already have an account? <a href="/login">Log in here</a>.
        </small>
      </Container>
    </main>
  );
}
