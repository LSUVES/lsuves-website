import React, { useContext, useEffect, useState } from "react";

import axios from "axios";
import {
  Button,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";

import MainContent from "../../components/layout/MainContent";
import CsrfTokenContext from "../../contexts/CsrfTokenContext";
import useUpdateEffect from "../../utils/useUpdateEffect/useUpdateEffect";

export default function LanSeatBookingForm() {
  const [waitingForResponse, setWaitingForResponse] = useState(true);
  const [groupId, setGroupId] = useState(-1);
  // TODO: Almost certainly not the best way of handling these mutually
  //       exclusive states.
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [ownsGroup, setOwnsGroup] = useState(true);
  const [groupName, setGroupName] = useState("");
  const [groupNameError, setGroupNameError] = useState("");
  const [seatingPreference, setSeatingPreference] = useState("");

  const csrfTokenCookie = useContext(CsrfTokenContext);

  useEffect(() => {
    axios
      .get("/api/lan-seat-booking/my_seat_booking/", {
        withCredentials: true,
        headers: { "X-CSRFToken": csrfTokenCookie },
      })
      .then((res) => {
        setGroupName(res.data.name);
        setSeatingPreference(res.data.preference);
        setOwnsGroup(res.data.isOwner);
        setGroupId(res.data.id);
      })
      .catch((err) => console.log(err))
      .finally(() => setWaitingForResponse(false));
  }, []);

  function joinSeatBookingGroup() {
    axios
      .post(
        "/api/lan-seat-booking/join_seat_booking/",
        { name: groupName },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      .then((res) => {
        setGroupName(res.data.name);
        setSeatingPreference(res.data.preference);
        setOwnsGroup(false);
        setGroupId(res.data.id);
        setIsJoiningGroup(false);
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status === 404) {
            setGroupNameError("No seat booking group with that name exists.");
          } else {
            console.log(err.response);
          }
        } else if (err.request) {
          console.log(err.request);
        } else {
          console.log(err.message);
        }
      });
  }

  function createSeatBookingGroup() {
    axios
      .post(
        "/api/lan-seat-booking/",
        { name: groupName, preference: seatingPreference },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      .then((res) => {
        setGroupId(res.data.id);
        setIsCreatingGroup(false);
      })
      .catch((err) => {
        if (err.response) {
          setGroupNameError(
            "A seat booking group with that name already exists."
          );
        } else {
          console.log(err);
        }
      });
  }

  function updateSeatBookingGroup() {
    axios
      .put(
        `/api/lan-seat-booking/${groupId}/`,
        { name: groupName, preference: seatingPreference },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      // TODO: Show success notification with fade out.
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
  }

  function leaveSeatBookingGroup() {
    axios
      .post(
        "/api/lan-seat-booking/leave_seat_booking/",
        {},
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      .then(() => {
        setGroupId(-1);
        setGroupName("");
        setSeatingPreference("");
        setOwnsGroup(true);
      });
  }

  function checkGroupName(groupNameLocal, setGroupNameErrorLocal) {
    let isValid = true;
    let feedback = "";
    if (groupNameLocal.length === 0) {
      isValid = false;
      feedback = "You must provide a group name";
    }
    setGroupNameErrorLocal(feedback);
    return isValid;
  }
  useUpdateEffect(checkGroupName, [groupName], [groupName, setGroupNameError]);

  return (
    <MainContent>
      <Row>
        <Col sm={6}>
          <h2>Seat booking form</h2>
          {!waitingForResponse && (
            <>
              {groupId === -1 && (
                <Row className="text-center">
                  <Col>
                    <Button
                      onClick={() => {
                        setIsCreatingGroup(false);
                        setIsJoiningGroup(true);
                      }}
                      active={isJoiningGroup}
                    >
                      Join group
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      onClick={() => {
                        setIsJoiningGroup(false);
                        setIsCreatingGroup(true);
                      }}
                      active={isCreatingGroup}
                    >
                      Create group
                    </Button>
                  </Col>
                </Row>
              )}
              {!(groupId === -1) && (
                <Row className="text-center">
                  <Col />
                  <Col>
                    <Button
                      color="danger"
                      onClick={() => {
                        leaveSeatBookingGroup();
                      }}
                      disabled={ownsGroup}
                    >
                      Leave group
                    </Button>
                  </Col>
                </Row>
              )}
              {(!(groupId === -1) || isJoiningGroup || isCreatingGroup) && (
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (isJoiningGroup) {
                      joinSeatBookingGroup();
                    } else if (isCreatingGroup) {
                      createSeatBookingGroup();
                    }
                  }}
                >
                  <FormGroup>
                    <Label for="group-name">Group name</Label>
                    <Input
                      id="group-name"
                      name="group-name"
                      value={groupName}
                      onInput={(e) => setGroupName(e.target.value)}
                      readOnly={!ownsGroup}
                      invalid={groupNameError}
                      // required
                    />
                    {groupNameError && (
                      <FormFeedback>{groupNameError}</FormFeedback>
                    )}
                  </FormGroup>
                  {isJoiningGroup && (
                    <FormGroup>
                      <Button
                        id="joinSeatBookingGroup"
                        name="joinSeatBookingGroup"
                        color="primary"
                        onClick={() => joinSeatBookingGroup()}
                      >
                        Join seat booking group
                      </Button>
                    </FormGroup>
                  )}
                  {(isCreatingGroup || !(groupId === -1)) && (
                    <FormGroup>
                      <Label for="preference">Seating preference</Label>
                      <Input
                        id="preference"
                        name="preference"
                        type="textarea"
                        value={seatingPreference}
                        onInput={(e) => setSeatingPreference(e.target.value)}
                        readOnly={!ownsGroup}
                        // invalid={emailIsValid === false}
                        // required
                      />
                      {/* {!emailIsValid && (
                  <FormFeedback>Please enter a valid email.</FormFeedback>
                )} */}
                    </FormGroup>
                  )}
                  {isCreatingGroup && (
                    <FormGroup>
                      <Button
                        id="createSeatBookingGroup"
                        name="createSeatBookingGroup"
                        color="primary"
                        onClick={() => createSeatBookingGroup()}
                      >
                        Create seat booking group
                      </Button>
                    </FormGroup>
                  )}
                  {!(groupId === -1) && ownsGroup && (
                    <FormGroup>
                      <Button
                        id="updateSeatBookingGroup"
                        name="updateSeatBookingGroup"
                        color="primary"
                        onClick={() => updateSeatBookingGroup()}
                      >
                        Update seat booking group
                      </Button>
                    </FormGroup>
                  )}
                </Form>
              )}
            </>
          )}
        </Col>
      </Row>
    </MainContent>
  );
}
