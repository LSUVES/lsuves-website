import React, { useContext, useState } from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";

import CsrfTokenContext from "../../contexts/CsrfTokenContext";
import useUpdateEffect from "../../utils/useUpdateEffect/useUpdateEffect";
import {
  checkDeletionDate,
  checkEmail,
  checkPassword,
  checkRepeatPassword,
  checkUsername,
  MIN_DATE,
  MAX_DATE,
} from "../../utils/validation/user";

// TODO: Refactor this to integrate with HTML5's native validation better (e.g. use required?):
//       https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Constraint_validation
//       https://getbootstrap.com/docs/5.0/forms/validation/

export default function Register() {
  /**
   * The account registration page. Provides a form with validation.
   */

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [usernameIsValid, setUsernameIsValid] = useState(null);
  const [usernameFeedback, setUsernameFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [emailIsValid, setEmailIsValid] = useState(null);
  const [deletionDate, setDeletionDate] = useState(
    `${new Date().getFullYear() + 3}-07-01`
  );
  const [deletionDateIsValid, setDeletionDateIsValid] = useState(null);
  const [deletionDateFeedback, setDeletionDateFeedback] = useState("");
  const [password, setPassword] = useState("");
  const [passwordIsValid, setPasswordIsValid] = useState(null);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [repeatPasswordIsValid, setRepeatPasswordIsValid] = useState(null);
  // const [repeatPasswordFeedback, setRepeatPasswordFeedback] = useState([]);
  const [registerError, setRegisterError] = useState("");

  // Store the state of the password input type and toggle it with a function
  const [passwordInputType, setPasswordInputType] = useState("password");
  const showPassword = () => {
    if (passwordInputType === "password") {
      setPasswordInputType("text");
    } else {
      setPasswordInputType("password");
    }
  };

  // Ensure fields are validated when values are changed.
  useUpdateEffect(
    checkUsername,
    [username],
    [username, setUsernameIsValid, setUsernameFeedback]
  );
  useUpdateEffect(checkEmail, [email], [email, setEmailIsValid]);
  useUpdateEffect(
    checkDeletionDate,
    [deletionDate],
    [deletionDate, setDeletionDateIsValid, setDeletionDateFeedback]
  );
  useUpdateEffect(
    checkPassword,
    [password],
    [password, setPasswordIsValid, setPasswordFeedback]
  );
  useUpdateEffect(
    checkRepeatPassword,
    [password, repeatPassword],
    [password, repeatPassword, setRepeatPasswordIsValid]
  );

  function checkAll() {
    // Checks and returns whether all fields (except password confirmation) are valid.
    // Uses multiple lines to prevent short-circuit evaluation which would cause later
    // checks not to be run and so not update the state that's used for custom styling.
    let isValid = checkUsername(
      username,
      setUsernameIsValid,
      setUsernameFeedback
    );
    isValid = checkEmail(email, setEmailIsValid) && isValid;
    isValid =
      checkDeletionDate(
        deletionDate,
        setDeletionDateIsValid,
        setDeletionDateFeedback
      ) && isValid;
    isValid =
      checkPassword(password, setPasswordIsValid, setPasswordFeedback) &&
      isValid;
    if (passwordIsValid) {
      isValid =
        isValid &&
        checkRepeatPassword(password, repeatPassword, setRepeatPasswordIsValid);
    }
    return isValid;
  }

  // Get CSRF token from context.
  const csrfTokenCookie = useContext(CsrfTokenContext);

  function register() {
    // Handles sending the information to the account registration API.
    // If any fields are invalid, don't send the request.
    if (!checkAll()) {
      // TODO: Emphasise errors?
      return;
    }
    // Submit the information to the backend and redirect the user if account
    // is created successfully or provide feedback if not.
    axios
      .post(
        "/api/users/register/",
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
        navigate("/login", { replace: true });
      })
      .catch((err) => {
        // TODO: DRY this out with AxiosError.jsx
        console.log(err);
        if (err.response) {
          // Get details from response
          if (err.response.data.username) {
            setUsernameIsValid(false);
            if (
              err.response.data.username.includes(
                "A user with that username already exists."
              )
            ) {
              setUsernameFeedback(
                "An account with that username already exists."
              );
            }
          }
          if (err.response.data.email) {
            setEmailIsValid(false);
          }
          if (err.response.data.deletion_date) {
            setDeletionDateIsValid(false);
          }
          if (err.response.data.password) {
            setPasswordIsValid(false);
          }
        } else if (err.request) {
          console.log(err.request);
          setRegisterError("Couldn't create account. Try again later.");
        } else {
          console.log(err.message);
          setRegisterError("Couldn't create account. Try again later.");
        }
      });
  }
  return (
    <main className="text-center m-auto form--thin">
      <h2 className="mb-3">Create an account</h2>
      {registerError && <Alert color="danger">{registerError}</Alert>}
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          register();
        }}
      >
        <FormGroup floating>
          <Input
            id="username"
            name="username"
            value={username}
            placeholder="Username"
            onInput={(e) => setUsername(e.target.value)}
            invalid={usernameIsValid === false}
            // required
          />
          <Label for="username">Username</Label>
          {!usernameIsValid && <FormFeedback>{usernameFeedback}</FormFeedback>}
        </FormGroup>
        <FormGroup floating>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            placeholder="Email"
            onInput={(e) => setEmail(e.target.value)}
            invalid={emailIsValid === false}
            // required
          />
          <Label for="email">Email</Label>
          {!emailIsValid && (
            <FormFeedback>Please enter a valid email.</FormFeedback>
          )}
        </FormGroup>
        <FormGroup floating>
          {/* TODO: Consider adding support for older browsers:
                      https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date#examples */}
          <Input
            id="deletionDate"
            name="deletionDate"
            type="date"
            defaultValue={deletionDate}
            min={MIN_DATE.toISOString().split("T")[0]}
            max={MAX_DATE.toISOString().split("T")[0]}
            onInput={(e) => setDeletionDate(e.target.value)}
            invalid={deletionDateIsValid === false}
            // required
          />
          <Label for="deletionDate">Date of account deletion</Label>
          {deletionDateFeedback && (
            <FormFeedback>{deletionDateFeedback}</FormFeedback>
          )}
        </FormGroup>
        {/* TODO: Show password requirements up-front and strength indicator */}
        <Row>
          <Col>
            <FormGroup floating>
              <Input
                id="password"
                name="password"
                type={passwordInputType}
                value={password}
                placeholder="Password"
                onInput={(e) => setPassword(e.target.value)}
                invalid={passwordIsValid === false}
                // required
              />
              <Label for="password">Password</Label>
              {!passwordIsValid && (
                <FormFeedback>{passwordFeedback}</FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col>
            <FormGroup floating>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={passwordInputType}
                value={repeatPassword}
                placeholder="Confirm password"
                onInput={(e) => setRepeatPassword(e.target.value)}
                invalid={passwordIsValid && repeatPasswordIsValid === false}
                // required
              />
              <Label for="confirmPassword">Confirm pass</Label>
              {!repeatPasswordIsValid && (
                <FormFeedback>Passwords do not match.</FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Label className="mb-3">
            <Input
              id="show-password"
              name="show-password"
              type="checkbox"
              onClick={showPassword}
            />{" "}
            Show password
          </Label>
        </Row>
        <FormGroup>
          <Button id="submit" name="submit" color="primary" size="lg" block>
            Create account
          </Button>
        </FormGroup>
      </Form>
      <small>
        Already have an account? <a href="/login">Log in here</a>.
      </small>
    </main>
  );
}
