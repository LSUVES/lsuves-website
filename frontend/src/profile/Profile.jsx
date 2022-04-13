import React, { useContext, useEffect, useState } from "react";

import axios from "axios";
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

import AxiosError from "../axiosError/AxiosError";
import useUpdateEffect from "../hooks/useUpdateEffect";
import {
  MIN_DATE,
  MAX_DATE,
  USERNAME_FEEDBACK,
  MAX_USERNAME_LENGTH,
  VALID_USERNAME_REGEX,
  DELETION_DATE_FEEDBACK,
} from "../login_and_register/accountValidation";
import CsrfTokenContext from "../utils/CsrfTokenContext";

export default function Profile() {
  const [profile, setProfile] = useState();
  const [originalUsername, setOriginalUsername] = useState("");
  const [username, setUsername] = useState("");
  const [usernameIsValid, setUsernameIsValid] = useState(true);
  const [usernameFeedback, setUsernameFeedback] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [email, setEmail] = useState("");
  const [emailIsValid, setEmailIsValid] = useState(true);
  const [originalDeletionDate, setOriginalDeletionDate] = useState();
  const [deletionDate, setDeletionDate] = useState(new Date());
  const [deletionDateIsValid, setDeletionDateIsValid] = useState(null);
  const [deletionDateFeedback, setDeletionDateFeedback] = useState("");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [saveDisabled, setSaveDisabled] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    // Get the user's profile.
    axios
      .get("/api/users/profile/", { withCredentials: true })
      .then((res) => {
        setProfile(res.data); // TODO: Remove this
        setOriginalUsername(res.data.username);
        setUsername(res.data.username);
        setOriginalEmail(res.data.email);
        setEmail(res.data.email);
        setOriginalDeletionDate(res.data.deletion_date);
        setDeletionDate(res.data.deletion_date);
      })
      .catch((err) => {
        setError(AxiosError(err));
      });
  }, []);

  // TODO: DRY this out
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
    if (!profile.is_staff && email.length === 0) {
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

  // Detect when the user has changed their information.
  useEffect(() => {
    console.log(deletionDate, originalDeletionDate);
    if (
      username !== originalUsername ||
      email !== originalEmail ||
      deletionDate !== originalDeletionDate
    ) {
      setUnsavedChanges(true);
    } else {
      setUnsavedChanges(false);
    }
  }, [
    originalUsername,
    username,
    originalEmail,
    email,
    deletionDate,
    originalDeletionDate,
  ]);

  // Disable saving if any of the values are invalid.
  useEffect(() => {
    if (!(usernameIsValid && emailIsValid && deletionDateIsValid)) {
      setSaveDisabled(true);
    } else {
      setSaveDisabled(false);
    }
  }, [usernameIsValid, emailIsValid, deletionDateIsValid]);

  function discardChanges() {
    // Discard the user's changes and reset values to original.
    setUsername(originalUsername);
    setEmail(originalEmail);
    setDeletionDate(originalDeletionDate);
  }

  const csrfTokenCookie = useContext(CsrfTokenContext);

  function saveChanges() {
    // Save changes to the user's information.
    axios
      .patch(
        "/api/users/profile/",
        {
          username,
          email,
          deletion_date: deletionDate,
        },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      .then((res) => {
        console.log(res.data);
        setOriginalUsername(res.data.username);
        setOriginalEmail(res.data.email);
        setOriginalDeletionDate(res.data.deletion_date);
      })
      .catch((err) => {
        // TODO: DRY this out
        if (err.response) {
          console.log(err.response);
          if (err.response.data.email) {
            setEmailIsValid(false);
          }
        } else if (err.request) {
          console.log(err.request);
        } else {
          console.log(err.message);
        }
      });
  }

  return (
    <main className="d-flex flex-column">
      <Container>
        {!profile && <>{error}</>}
        {profile && (
          // FIXME: Does the Form need to be the direct parent of FormGroups to capture enter key-press?
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              saveChanges();
            }}
          >
            <h2>Your account</h2>
            <h4>Information</h4>
            <p>Manage the information you&apos;ve shared with us.</p>
            <FormGroup>
              <Row>
                <Col>
                  <Label for="username">Username</Label>
                </Col>
                <Col>
                  <Input
                    id="username"
                    name="username"
                    value={username}
                    placeholder="Username"
                    onInput={(e) => setUsername(e.target.value)}
                    invalid={usernameIsValid === false}
                  />
                  {!usernameIsValid && (
                    <FormFeedback>{usernameFeedback}</FormFeedback>
                  )}
                </Col>
              </Row>
            </FormGroup>
            <Row>
              <Col>
                <Label for="email">Email</Label>
              </Col>
              <Col>
                <FormGroup>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onInput={(e) => setEmail(e.target.value)}
                    placeholder="None stored"
                    invalid={emailIsValid === false}
                    // required
                  />
                  {!emailIsValid && (
                    <FormFeedback>Please enter a valid email.</FormFeedback>
                  )}
                </FormGroup>
              </Col>
            </Row>
            {profile.isAdmin && (
              <p>
                <small>Admin account</small>
              </p>
            )}
            {!profile.is_superuser && (
              <>
                <h4>Account deletion</h4>
                <p>
                  Change when your account is scheduled to be deleted or delete
                  it now.
                </p>
                <Row>
                  <Col>
                    <Label for="deletionDate">Date of account deletion</Label>
                  </Col>
                  <Col>
                    <Input
                      id="deletionDate"
                      name="deletionDate"
                      type="date"
                      value={deletionDate}
                      min={MIN_DATE.toISOString().split("T")[0]}
                      max={MAX_DATE.toISOString().split("T")[0]}
                      onInput={(e) => setDeletionDate(e.target.value)}
                      invalid={deletionDateIsValid === false}
                      // required
                    />
                    {deletionDateFeedback && (
                      <FormFeedback>{deletionDateFeedback}</FormFeedback>
                    )}
                  </Col>
                </Row>
              </>
            )}
            {/* FIXME: Is this screen-reader friendly?
                       Ensure always visible floating at bottom of screen. */}
            {unsavedChanges && (
              <Alert color="danger" className="mt-3">
                {/* className="top-position-sticky"> */}
                <div className="d-flex">
                  <div className="me-auto my-auto">
                    You have unsaved changes.
                  </div>
                  <div>
                    <Button
                      id="discard"
                      name="discard"
                      className="me-2"
                      onClick={() => discardChanges()}
                    >
                      Discard
                    </Button>
                  </div>
                  <div>
                    <Button
                      id="save"
                      name="save"
                      color="primary"
                      onClick={() => saveChanges()}
                      disabled={saveDisabled}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </Alert>
            )}
          </Form>
        )}
      </Container>
    </main>
  );
}

// Profile.propTypes = {
//   isAuthenticated: propTypes.bool.isRequired,
// };
