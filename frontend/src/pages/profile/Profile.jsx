import React, { useContext, useEffect, useState } from "react";

import axios from "axios";
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

import AxiosError from "../../components/axiosError/AxiosError";
import MainContent from "../../components/layout/MainContent";
import CsrfTokenContext from "../../contexts/CsrfTokenContext";
import useUpdateEffect from "../../utils/useUpdateEffect/useUpdateEffect";
import {
  checkDeletionDate,
  checkEmail,
  checkUsername,
  MIN_DATE,
  MAX_DATE,
} from "../../utils/validation/user";

export default function Profile() {
  // TODO: Is there a better way to handle this, e.g. an object/Map?
  const [profile, setProfile] = useState();
  const [originalUsername, setOriginalUsername] = useState("");
  const [username, setUsername] = useState("");
  const [usernameIsValid, setUsernameIsValid] = useState(true);
  const [usernameFeedback, setUsernameFeedback] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [email, setEmail] = useState("");
  const [emailIsValid, setEmailIsValid] = useState(true);
  const [originalFirstName, setOriginalFirstName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [originalLastName, setOriginalLastName] = useState("");
  const [lastName, setLastName] = useState("");
  const [originalStudentId, setOriginalStudentId] = useState("");
  const [studentId, setStudentId] = useState("");
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
        setOriginalFirstName(res.data.first_name);
        setFirstName(res.data.first_name);
        setOriginalLastName(res.data.last_name);
        setLastName(res.data.last_name);
        setOriginalStudentId(res.data.student_id);
        setStudentId(res.data.student_id);
        setOriginalDeletionDate(res.data.deletion_date);
        setDeletionDate(res.data.deletion_date);
      })
      .catch((err) => {
        setError(AxiosError(err));
      });
  }, []);

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

  // Detect when the user has changed their information.
  useEffect(() => {
    console.log(
      `${firstName}, ${originalFirstName}, ${firstName === originalFirstName}`
    );
    if (
      username !== originalUsername ||
      email !== originalEmail ||
      firstName !== originalFirstName ||
      lastName !== originalLastName ||
      studentId !== originalStudentId ||
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
    firstName,
    originalFirstName,
    lastName,
    originalLastName,
    studentId,
    originalStudentId,
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
    setFirstName(originalFirstName);
    setLastName(originalLastName);
    setOriginalStudentId(originalStudentId);
    setDeletionDate(originalDeletionDate);
  }

  const csrfTokenCookie = useContext(CsrfTokenContext);

  function saveChanges() {
    // Save changes to the user's information.
    // TODO: Should probs prevent excess submits like with the login.
    axios
      .patch(
        "/api/users/profile/",
        {
          username,
          email,
          first_name: firstName,
          last_name: lastName,
          student_id: studentId,
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
        setOriginalFirstName(res.data.first_name);
        setOriginalLastName(res.data.last_name);
        setOriginalStudentId(res.data.student_id);
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
    <MainContent>
      {!profile && <>{error}</>}
      {profile && (
        // FIXME: Does the Form need to be the direct parent of FormGroups to capture enter key-press?
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            console.log("form submitted");
            saveChanges();
          }}
        >
          <h2>Your account</h2>
          <h4>Information</h4>
          <p>Manage the information you&apos;ve shared with us.</p>
          <FormGroup row>
            <Label for="username" sm={3}>
              Username
            </Label>
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
          </FormGroup>
          <FormGroup row>
            <Label for="email" sm={3}>
              Email
            </Label>
            <Col>
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
            </Col>
          </FormGroup>
          {/* TODO: Don't display these fields for superusers */}
          <FormGroup row>
            <Label for="firstName" sm={3}>
              First name
            </Label>
            <Col>
              <Input
                id="firstName"
                name="firstName"
                value={firstName}
                placeholder="None stored"
                onInput={(e) => setFirstName(e.target.value)}
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="lastName" sm={3}>
              Last name
            </Label>
            <Col>
              <Input
                id="lastName"
                name="lastName"
                value={lastName}
                placeholder="None stored"
                onInput={(e) => setLastName(e.target.value)}
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="studentId" sm={3}>
              Student ID
            </Label>
            <Col>
              <Input
                id="studentId"
                name="studentId"
                value={studentId}
                placeholder="None stored"
                onInput={(e) => setStudentId(e.target.value)}
              />
            </Col>
          </FormGroup>
          {profile.isAdmin && (
            <p>
              <small>Admin account</small>
            </p>
          )}
          {!profile.is_superuser && (
            <>
              <h4>Account deletion</h4>
              <p>
                Change when your account is scheduled to be deleted or delete it
                now.
              </p>
              {/* TODO: Use FormGroup as above */}
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
                <div className="me-auto my-auto">You have unsaved changes.</div>
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
    </MainContent>
  );
}
