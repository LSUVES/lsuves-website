import React, { useContext, useState } from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";

import useUpdateEffect from "../hooks/useUpdateEffect";
import CsrfTokenContext from "../utils/CsrfTokenContext";
import {
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_DATE,
  MAX_DATE,
  VALID_USERNAME_REGEX,
  USERNAME_FEEDBACK,
  DELETION_DATE_FEEDBACK,
  PASSWORD_FEEDBACK,
  MAX_PASSWORD_LENGTH,
} from "./accountValidation";

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

  const [passwordInputType, setPasswordInputType] = useState("password");
  const showPassword = () => {
    if (passwordInputType === "password") {
      setPasswordInputType("text");
    } else {
      setPasswordInputType("password");
    }
  };

  function checkUsername() {
    // Checks whether username is a valid string but not whether it's free.
    let isValid = true;
    let feedback = "";
    if (username.length === 0) {
      isValid = false;
      feedback = USERNAME_FEEDBACK.minLength;
    } else if (username.length > MAX_USERNAME_LENGTH) {
      isValid = false;
      feedback = USERNAME_FEEDBACK.maxLength;
    } else if (!VALID_USERNAME_REGEX.test(username)) {
      isValid = false;
      feedback = USERNAME_FEEDBACK.characters;
    }
    setUsernameIsValid(isValid);
    setUsernameFeedback(feedback);
    return isValid;
  }
  useUpdateEffect(checkUsername, [username]);

  function checkEmail() {
    // Checks whether the email has been provided (but not if it's valid).
    let isValid = true;
    // TODO: Consider implementing a more thorough check:
    //       https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
    //       https://stackoverflow.com/questions/46155/whats-the-best-way-to-validate-an-email-address-in-javascript
    if (email.length === 0) {
      isValid = false;
    }
    setEmailIsValid(isValid);
    return isValid;
  }
  useUpdateEffect(checkEmail, [email]);

  function checkDeletionDate() {
    // Checks whether the date of deletion is within the valid range.
    let isValid = true;
    let feedback = "";
    const deletionDateDate = new Date(deletionDate);
    if (deletionDateDate < MIN_DATE) {
      feedback = DELETION_DATE_FEEDBACK.minDate;
      isValid = false;
    } else if (deletionDateDate > MAX_DATE) {
      feedback = DELETION_DATE_FEEDBACK.maxDate;
      isValid = false;
    }
    setDeletionDateIsValid(isValid);
    setDeletionDateFeedback(feedback);
    return isValid;
  }
  useUpdateEffect(checkDeletionDate, [deletionDate]);

  function checkPassword() {
    // Checks whether the password length is valid.
    let isValid = true;
    let feedback = "";
    if (password.length < MIN_PASSWORD_LENGTH) {
      isValid = false;
      feedback = PASSWORD_FEEDBACK.minLength;
    } else if (password.length > MAX_PASSWORD_LENGTH) {
      isValid = false;
      feedback = PASSWORD_FEEDBACK.maxLength;
    }
    setPasswordIsValid(isValid);
    setPasswordFeedback(feedback);
    return isValid;
  }
  useUpdateEffect(checkPassword, [password]);

  function checkRepeatPassword() {
    // Checks whether the passwords match.
    let isValid = true;
    if (password !== repeatPassword) {
      isValid = false;
    }
    setRepeatPasswordIsValid(isValid);
    return isValid;
  }
  useUpdateEffect(checkRepeatPassword, [password, repeatPassword]);

  function checkAll() {
    // Checks and returns whether all fields (except password confirmation) are valid.
    // Uses multiple lines to prevent short-circuit evaluation which would cause later
    // checks not to be run and so not update the state that's used for custom styling.
    let isValid = checkUsername();
    isValid = checkEmail() && isValid;
    isValid = checkDeletionDate() && isValid;
    isValid = checkPassword() && isValid;
    if (passwordIsValid) {
      isValid = isValid && checkRepeatPassword();
    }
    return isValid;
  }

  // Get CSRF token from context.
  const csrfTokenCookie = useContext(CsrfTokenContext);

  function register() {
    if (!checkAll()) {
      // TODO: Emphasise errors?
      return;
    }

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
    <main className="d-flex flex-column vh-100 text-center">
      <Container className="m-auto AccountCredentialsForm">
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
            {!usernameIsValid && (
              <FormFeedback>{usernameFeedback}</FormFeedback>
            )}
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
      </Container>
    </main>
  );
}
