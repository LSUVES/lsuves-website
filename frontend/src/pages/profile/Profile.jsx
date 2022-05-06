import React, { useContext, useEffect, useState } from "react";

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
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
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
        setProfile(res.data); // TODO: Find a way to remove this.
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

  function requestMembership() {
    axios
      .patch(
        "/api/users/request_membership/",
        {},
        { withCredentials: true, headers: { "X-CSRFToken": csrfTokenCookie } }
      )
      .then(() => {
        setProfile({ ...profile, is_requesting_membership: true });
      })
      .catch((err) => console.log(err));
  }

  // State and functions for the change password modal.
  const [changePasswordInputType, setChangePasswordInputType] =
    useState("password");
  const showChangePassword = () => {
    if (changePasswordInputType === "password") {
      setChangePasswordInputType("text");
    } else {
      setChangePasswordInputType("password");
    }
  };
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [changePasswordOldPassword, setChangePasswordOldPassword] =
    useState("");
  const [changePasswordNewPassword, setChangePasswordNewPassword] =
    useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  // TODO: One non-binary variable would probably be a better choice to handle this
  const [isWaitingForChangePassword, setIsWaitingForChangePassword] =
    useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  function toggleChangePasswordModal() {
    if (changePasswordModalOpen) {
      setChangePasswordInputType("password");
      setChangePasswordOldPassword("");
      setChangePasswordNewPassword("");
      setChangePasswordError("");
      setPasswordChanged(false);
    }
    setChangePasswordModalOpen(!changePasswordModalOpen);
  }
  function changePassword() {
    // FIXME: Add password validation.
    setIsWaitingForChangePassword(true);
    axios
      .patch(
        "/api/users/change_own_password/",
        {
          old_password: changePasswordOldPassword,
          new_password: changePasswordNewPassword,
        },
        { withCredentials: true, headers: { "X-CSRFToken": csrfTokenCookie } }
      )
      .then(() => {
        setIsWaitingForChangePassword(false);
        setPasswordChanged(true);
      })
      .catch((err) => {
        setIsWaitingForChangePassword(false);
        if (err.response) {
          if (err.response.status === 400) {
            // TODO: Be more specific.
            setChangePasswordError("Invalid password.");
          } else {
            setChangePasswordError(err.response.data);
          }
        } else if (err.request) {
          setChangePasswordError(err.request);
        } else {
          setChangePasswordError(err.message);
        }
      });
  }

  // State and functions for the delete account modal.
  const navigate = useNavigate();
  const [confirmDeletePasswordInputType, setConfirmDeletePasswordInputType] =
    useState("password");
  const showConfirmDeletePassword = () => {
    if (confirmDeletePasswordInputType === "password") {
      setConfirmDeletePasswordInputType("text");
    } else {
      setConfirmDeletePasswordInputType("password");
    }
  };
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState("");
  const [deleteAccountError, setDeleteAccountError] = useState("");
  function toggleDeleteModal() {
    setDeleteAccountModalOpen(!deleteAccountModalOpen);
  }
  function deleteAccount() {
    // Delete a user's account on the backend.
    // Pass password in data of delete request.
    axios
      .delete("/api/users/delete_own_account/", {
        data: { password: deleteAccountPassword },
        withCredentials: true,
        headers: { "X-CSRFToken": csrfTokenCookie },
      })
      // If successful, refresh the page.
      .then(() => navigate(0))
      .catch((err) => {
        if (err.response) {
          if (err.response.status === 400) {
            setDeleteAccountError("Invalid password.");
          } else {
            setDeleteAccountError(err.response.data);
          }
        } else if (err.request) {
          setDeleteAccountError(err.request);
        } else {
          setDeleteAccountError(err.message);
        }
      });
  }

  return (
    <MainContent>
      {!profile && <>{error}</>}
      {profile && (
        // FIXME: Does the Form need to be the direct parent of FormGroups to capture enter key-press?
        //        At any rate, since the default behaviour (if no onClick prop is given) of Button
        //        elements within a form is to submit it, they should probably be moved outside.
        // TODO:  Centre content.
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
            <Col sm={3}>
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
            <Col sm={3}>
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
          {/* TODO: Consider creating a separate profile page for superusers so variables
                    aren't used unnecessarily. */}
          {!profile.is_superuser && (
            <>
              <FormGroup row>
                <Label for="firstName" sm={3}>
                  First name
                </Label>
                <Col sm={3}>
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
                <Col sm={3}>
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
                <Col sm={3}>
                  <Input
                    id="studentId"
                    name="studentId"
                    value={studentId}
                    placeholder="None stored"
                    onInput={(e) => setStudentId(e.target.value)}
                  />
                </Col>
              </FormGroup>
              <Row>
                <Col sm={3}>Membership?</Col>
                <Col>
                  {!profile.is_member && !profile.is_requesting_membership && (
                    <>
                      {" "}
                      No{" "}
                      <Button onClick={() => requestMembership()}>
                        Request membership
                      </Button>
                    </>
                  )}
                  {!profile.is_member && profile.is_requesting_membership && (
                    <>Pending confirmation from committee</>
                  )}
                  {profile.is_member && <>Yes</>}
                </Col>
              </Row>
            </>
          )}
          {profile.isAdmin && (
            <p>
              <small>Admin account</small>
            </p>
          )}
          <hr />
          <Row className="my-3">
            <Col sm={3}>
              <h4>Password</h4>
            </Col>
            <Col>
              <Button onClick={() => toggleChangePasswordModal()}>
                Change password
              </Button>
            </Col>
          </Row>
          <hr />
          {!profile.is_superuser && (
            <>
              <h4>Account deletion</h4>
              <p>
                Change when your account is scheduled to be deleted or delete it
                now.
              </p>
              <FormGroup row>
                <Label for="deletionDate" sm={3}>
                  Date of account deletion
                </Label>
                <Col sm={3}>
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
              </FormGroup>
              <Row>
                <Col sm={3} />
                <Col>
                  <Button color="danger" onClick={() => toggleDeleteModal()}>
                    Delete account
                  </Button>
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
          {/* Change password modal. */}
          <Modal
            isOpen={changePasswordModalOpen}
            toggle={
              !isWaitingForChangePassword
                ? () => toggleChangePasswordModal()
                : undefined
            }
          >
            {!passwordChanged && (
              <>
                <ModalHeader
                  toggle={
                    !isWaitingForChangePassword
                      ? () => toggleChangePasswordModal()
                      : undefined
                  }
                >
                  Change your password:
                </ModalHeader>
                {/* TODO: Consider containing this in a form to capture enter keypress */}
                <ModalBody>
                  <FormGroup floating>
                    <Input
                      id="changePasswordOldPassword"
                      name="changePasswordOldPassword"
                      type={changePasswordInputType}
                      value={changePasswordOldPassword}
                      placeholder="Old password"
                      onInput={(e) =>
                        setChangePasswordOldPassword(e.target.value)
                      }
                    />
                    <Label for="changePasswordOldPassword">Old password:</Label>
                  </FormGroup>
                  <FormGroup floating>
                    <Input
                      id="changePasswordNewPassword"
                      name="changePasswordNewPassword"
                      type={changePasswordInputType}
                      value={changePasswordNewPassword}
                      placeholder="New password"
                      onInput={(e) =>
                        setChangePasswordNewPassword(e.target.value)
                      }
                    />
                    <Label for="changePasswordNewPassword">New password:</Label>
                  </FormGroup>
                  <Label className="mb-3">
                    <Input
                      id="showChangePassword"
                      name="showChangePassword"
                      type="checkbox"
                      onClick={showChangePassword}
                    />{" "}
                    Show password
                  </Label>
                  {changePasswordError && (
                    <Alert color="danger">{changePasswordError}</Alert>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="primary"
                    disabled={
                      !changePasswordOldPassword &&
                      !changePasswordNewPassword &&
                      isWaitingForChangePassword
                    }
                    onClick={() => changePassword()}
                  >
                    Change password
                  </Button>
                  <Button
                    color="secondary"
                    onClick={() => toggleChangePasswordModal()}
                    disabled={isWaitingForChangePassword}
                  >
                    Cancel
                  </Button>
                </ModalFooter>
              </>
            )}
            {passwordChanged && (
              <ModalHeader toggle={() => toggleChangePasswordModal()}>
                Your password has been changed.
              </ModalHeader>
            )}
          </Modal>
          {/* Delete account modal. */}
          <Modal
            isOpen={deleteAccountModalOpen}
            toggle={() => toggleDeleteModal()}
          >
            <ModalHeader toggle={() => toggleDeleteModal()}>
              Are you sure you want to delete your account and all information
              associated with it?
            </ModalHeader>
            <ModalBody>
              This is immediate and irreversible. It will only destroy data
              shared on this site. Any membership or tickets bought via the LSU
              website will still be valid and can still be used with a new
              account.
              <br />
              <br />
              <Label for="confirmDeletePassword">
                Enter your password to confirm:
              </Label>
              <Input
                id="confirmDeletePassword"
                name="confirmDeletePassword"
                type={confirmDeletePasswordInputType}
                value={deleteAccountPassword}
                placeholder="Password"
                onInput={(e) => setDeleteAccountPassword(e.target.value)}
              />
              <Label className="mb-3">
                <Input
                  id="showConfirmDeletePassword"
                  name="showConfirmDeletePassword"
                  type="checkbox"
                  onClick={showConfirmDeletePassword}
                />{" "}
                Show password
              </Label>
              {deleteAccountError && (
                <Alert color="danger">{deleteAccountError}</Alert>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                disabled={!deleteAccountPassword}
                onClick={() => deleteAccount()}
              >
                Delete
              </Button>
              <Button color="secondary" onClick={() => toggleDeleteModal()}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
        </Form>
      )}
    </MainContent>
  );
}
