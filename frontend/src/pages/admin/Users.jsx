import React, { useContext, useEffect, useState } from "react";

import axios from "axios";
import {
  Button,
  Card,
  CardBody,
  // CardText,
  CardTitle,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Table,
  UncontrolledCollapse,
} from "reactstrap";

import MainContent from "../../components/layout/MainContent";
import CsrfTokenContext from "../../contexts/CsrfTokenContext";

export default function Users() {
  const [userList, setUserList] = useState([]);

  function getUsers() {
    // Get a list of all users from the backend.
    axios
      .get("/api/users/", { withCredentials: true })
      .then((res) => setUserList(res.data))
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    getUsers();
  }, [userList.length]);

  const csrfTokenCookie = useContext(CsrfTokenContext);

  function giveUserMembership(userId) {
    axios
      .patch(
        `/api/users/${userId}/`,
        // TODO: is_requesting_membership=false should be enforced on backend.
        { is_member: true, is_requesting_membership: false },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      .then((res) => {
        const newUserList = userList.slice();
        newUserList.find((user) => user.id === res.data.id).is_member =
          res.data.is_member;
        setUserList(newUserList);
      })
      .catch((err) => console.log(err));
  }

  function revokeUserMembership(userId) {
    axios
      .patch(
        `/api/users/${userId}/`,
        { is_member: false },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      .then((res) => {
        const newUserList = userList.slice();
        newUserList.find((user) => user.id === res.data.id).is_member =
          res.data.is_member;
        setUserList(newUserList);
      })
      .catch((err) => console.log(err));
  }

  const [userToAdmin, setUserToAdmin] = useState();
  function toggleAdminModal(userId) {
    setUserToAdmin(userId);
  }
  function adminUser() {
    // Gives the user admin on the backend.
    axios
      .patch(
        `/api/users/${userToAdmin}/`,
        { isAdmin: true },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      .then((res) => {
        toggleAdminModal();
        const newUserList = userList.slice();
        newUserList.find((user) => user.id === res.data.id).isAdmin =
          res.data.isAdmin;
        console.log(newUserList);
        setUserList(newUserList);
      })
      .catch((err) => console.log(err));
  }

  function unAdminUser(userId) {
    // Removes admin from a user on the backend.
    axios
      .patch(
        `/api/users/${userId}/`,
        { isAdmin: false },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      .then((res) => {
        const newUserList = userList.slice();
        newUserList.find((user) => user.id === res.data.id).isAdmin =
          res.data.isAdmin;
        console.log(newUserList);
        setUserList(newUserList);
      })
      .catch((err) => console.log(err));
  }

  const [userToResetPassword, setUserToResetPassword] = useState();
  const [isWaitingForResetPassword, setIsWaitingForResetPassword] =
    useState(false);
  const [newUserPassword, setNewUserPassword] = useState("");
  const [resetPasswordError, setResetPasswordError] = useState("");
  function toggleResetPasswordModal(userId) {
    setUserToResetPassword(userId);
    setNewUserPassword("");
    setResetPasswordError("");
    setIsWaitingForResetPassword(false);
  }
  function resetUserPassword() {
    // Resets the user's password on the backend and displays the new one.
    setIsWaitingForResetPassword(true);
    axios
      .patch(
        `/api/users/${userToResetPassword}/admin_reset_password/`,
        {},
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      .then((res) => {
        setNewUserPassword(res.data.password);
        setIsWaitingForResetPassword(false);
      })
      .catch((err) => {
        if (err.response) {
          setResetPasswordError(err.response.statusText);
        } else if (err.request) {
          // FIXME: These are probably objects and so will error
          setResetPasswordError(err.request);
        } else {
          setResetPasswordError(err.message);
        }
        setIsWaitingForResetPassword(false);
      });
  }

  const [userToDelete, setUserToDelete] = useState();
  function toggleDeleteModal(userId) {
    setUserToDelete(userId);
  }
  function deleteUser() {
    // Deletes the user on the backend.
    axios
      .delete(`/api/users/${userToDelete}/`, {
        withCredentials: true,
        headers: { "X-CSRFToken": csrfTokenCookie },
      })
      .then(() => {
        toggleDeleteModal();
        // TODO: instead of calling getUsers again, just remove the deleted user.
        getUsers();
      })
      .catch((err) => console.log(err));
  }

  return (
    <MainContent>
      <Row className="justify-content-center">
        <Col sm="8">
          <div className="d-flex justify-content-between">
            <h3>Users:</h3>
          </div>
          <ul className="p-0">
            {userList.map((item) => (
              <Card className="my-2" key={item.id}>
                <CardBody>
                  <CardTitle title={item.username} className="d-flex mb-0">
                    <h5 className="my-auto flex-grow-1">
                      {/* FIXME: Add overflow to prevent long usernames spilling out */}
                      {!item.is_superuser && (
                        <Button
                          color="link"
                          id={`toggler${item.id}`}
                          disabled={item.is_superuser}
                        >
                          {item.username}
                        </Button>
                      )}
                      {/* TODO: Clean this up or just don't display superusers */}
                      {item.is_superuser && (
                        <>
                          {item.username} <small>(superuser)</small>
                        </>
                      )}
                    </h5>
                  </CardTitle>
                  {!item.is_superuser && (
                    <UncontrolledCollapse toggler={`#toggler${item.id}`}>
                      <Table borderless>
                        <tbody>
                          <tr>
                            <th>Email</th>
                            <td>{item.email}</td>
                          </tr>
                          <tr>
                            <th>First name</th>
                            <td>{item.first_name}</td>
                          </tr>
                          <tr>
                            <th>Last name</th>
                            <td>{item.last_name}</td>
                          </tr>
                          <tr>
                            <th>Student ID</th>
                            <td>{item.student_id}</td>
                          </tr>
                          <tr>
                            <th>Member?</th>
                            {!item.is_member && (
                              <td className="d-flex justify-content-between">
                                No
                                <Button
                                  className="me-2"
                                  onClick={() => giveUserMembership(item.id)}
                                >
                                  Give membership
                                </Button>
                              </td>
                            )}
                            {item.is_member && (
                              <td className="d-flex justify-content-between">
                                Yes
                                <Button
                                  className="me-2"
                                  onClick={() => revokeUserMembership(item.id)}
                                >
                                  Revoke membership
                                </Button>
                              </td>
                            )}
                          </tr>
                          <tr>
                            <th>Admin?</th>
                            {!item.isAdmin && (
                              <td className="d-flex justify-content-between">
                                No{" "}
                                {item.is_member && (
                                  <Button
                                    className="me-2"
                                    onClick={() => toggleAdminModal(item.id)}
                                  >
                                    Make admin
                                  </Button>
                                )}
                              </td>
                            )}
                            {item.isAdmin && (
                              <td className="d-flex justify-content-between">
                                Yes
                                <Button
                                  className="me-2"
                                  onClick={() => unAdminUser(item.id)}
                                >
                                  Remove admin
                                </Button>
                              </td>
                            )}
                          </tr>
                        </tbody>
                      </Table>
                      <Button
                        className="me-2"
                        onClick={() => toggleResetPasswordModal(item.id)}
                      >
                        Change password
                      </Button>
                      <Button
                        color="danger"
                        onClick={() => toggleDeleteModal(item.id)}
                      >
                        Delete
                      </Button>
                    </UncontrolledCollapse>
                  )}
                  {/* <CardText>{item.body}</CardText> */}
                </CardBody>
              </Card>
            ))}
          </ul>
          {userToAdmin && (
            // Admin user modal
            <Modal isOpen toggle={() => toggleAdminModal()}>
              <ModalHeader toggle={() => toggleAdminModal()}>
                Are you sure you want to give{" "}
                {userList.find((user) => user.id === userToAdmin).username}{" "}
                admin powers?
              </ModalHeader>
              <ModalFooter>
                <Button color="primary" onClick={() => adminUser()}>
                  Give admin
                </Button>
                <Button color="secondary" onClick={() => toggleAdminModal()}>
                  Cancel
                </Button>
              </ModalFooter>
            </Modal>
          )}
          {userToResetPassword && (
            // Reset user password modal
            <Modal
              isOpen
              toggle={
                !isWaitingForResetPassword && !newUserPassword
                  ? () => toggleResetPasswordModal()
                  : undefined
              }
            >
              {!isWaitingForResetPassword &&
                !newUserPassword &&
                !resetPasswordError && (
                  <>
                    <ModalHeader toggle={() => toggleResetPasswordModal()}>
                      Are you sure you want to reset{" "}
                      {
                        userList.find((user) => user.id === userToResetPassword)
                          .username
                      }
                      &apos;s password?
                    </ModalHeader>
                    <ModalFooter>
                      <Button
                        color="primary"
                        onClick={() => resetUserPassword()}
                      >
                        Reset password
                      </Button>
                      <Button
                        color="secondary"
                        onClick={() => toggleResetPasswordModal()}
                      >
                        Cancel
                      </Button>
                    </ModalFooter>
                  </>
                )}
              {isWaitingForResetPassword && (
                <ModalHeader>
                  Waiting for server to respond with new password...
                </ModalHeader>
              )}
              {newUserPassword && (
                <>
                  <ModalHeader>
                    {/* TODO: Should probably get this from response */}
                    New password for{" "}
                    {
                      userList.find((user) => user.id === userToResetPassword)
                        .username
                    }
                    :
                  </ModalHeader>
                  <ModalBody>{newUserPassword}</ModalBody>
                  <ModalFooter>
                    <Button
                      color="primary"
                      onClick={() => toggleResetPasswordModal()}
                    >
                      Done
                    </Button>
                  </ModalFooter>
                </>
              )}
              {resetPasswordError && (
                <>
                  <ModalHeader>The following error occurred:</ModalHeader>
                  <ModalBody>{resetPasswordError}</ModalBody>
                  <ModalFooter>
                    <Button
                      color="primary"
                      onClick={() => toggleResetPasswordModal()}
                    >
                      Oof
                    </Button>
                  </ModalFooter>
                </>
              )}
            </Modal>
          )}
          {userToDelete && (
            // Delete user modal
            <Modal isOpen toggle={() => toggleDeleteModal()}>
              <ModalHeader toggle={() => toggleDeleteModal()}>
                Are you sure you want to delete{" "}
                {userList.find((user) => user.id === userToDelete).username}?
              </ModalHeader>
              <ModalFooter>
                <Button color="primary" onClick={() => deleteUser()}>
                  Delete
                </Button>
                <Button color="secondary" onClick={() => toggleDeleteModal()}>
                  Cancel
                </Button>
              </ModalFooter>
            </Modal>
          )}
        </Col>
      </Row>
    </MainContent>
  );
}
