import React, { useContext, useEffect, useState } from "react";

import axios from "axios";
import propTypes from "prop-types";
import {
  Alert,
  Button,
  Col,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";

import MainContent from "../../components/layout/MainContent";
import CsrfTokenContext from "../../contexts/CsrfTokenContext";

// TODO: DRY this out with App.jsx
export default function Lan({ isAuthenticated }) {
  const [currentLan, setCurrentLan] = useState();
  const [waitingForCurrentLan, setWaitingForCurrentLan] = useState(true);
  const [hasTicket, setHasTicket] = useState(false);
  const [requestedTicket, setRequestedTicket] = useState(false);
  const [waitingForTicketResponse, setWaitingForTicketResponse] =
    useState(true);
  const [lanCountdownTime, setLanCountdownTime] = useState();
  const [timer, setTimer] = useState();

  useEffect(() => {
    axios
      .get("/api/events/current_lan/")
      .then((res) => {
        setCurrentLan(res.data);
        setWaitingForCurrentLan(false);
        console.log(currentLan);
      })
      .catch((err) => {
        console.log(err);
        setWaitingForCurrentLan(false);
      });
  }, []);

  useEffect(() => {
    // TODO: Consider rolling the requests to my_lan_ticket_request and my_lan_ticket into a
    //       single API call.
    //       Ensure this is called again when going back to the page after logging in.
    if (isAuthenticated) {
      axios
        .get("/api/lan-tickets/my_lan_ticket/", { withCredentials: true })
        .then((res) => {
          setHasTicket(true);
          setWaitingForTicketResponse(false);
          console.log(res);
        })
        .catch((err) => {
          if (err.response) {
            if (err.response.status === 404) {
              axios
                .get("/api/lan-ticket-requests/my_lan_ticket_request/", {
                  withCredentials: true,
                })
                .then((res) => {
                  setRequestedTicket(true);
                  setWaitingForTicketResponse(false);
                  console.log(res);
                })
                // FIXME: Handle other server errors.
                .catch((err2) => {
                  console.log(err2);
                  setWaitingForTicketResponse(false);
                });
            } else {
              console.log(err.response);
            }
          } else if (err.request) {
            console.log(err.request);
          } else {
            console.log(err.message);
          }
        });
    } else {
      // FIXME: Give auth time to go through when this page is loaded directly.
      console.log("Un-authed");
      setWaitingForTicketResponse(false);
    }
  }, [isAuthenticated]);

  const [countdownDays, setCountdownDays] = useState("00");
  const [countdownHours, setCountdownHours] = useState("00");
  const [countdownMinutes, setCountdownMinutes] = useState("00");
  const [countdownSeconds, setCountdownSeconds] = useState("00");

  // TODO: Consider this as a reason to use moment.js or similar.
  function tick() {
    const newCountDownTime =
      new Date(currentLan.start_time).getTime() - new Date().getTime();
    setLanCountdownTime(newCountDownTime);
    const seconds = Math.floor((newCountDownTime / 1000) % 60);
    const minutes = Math.floor((newCountDownTime / (1000 * 60)) % 60);
    const hours = Math.floor((newCountDownTime / (1000 * 60 * 60)) % 24);
    const days = Math.floor(newCountDownTime / (1000 * 60 * 60 * 24));

    setCountdownDays(days < 10 ? `0${days}` : days);
    setCountdownHours(hours < 10 ? `0${hours}` : hours);
    setCountdownMinutes(minutes < 10 ? `0${minutes}` : minutes);
    setCountdownSeconds(seconds < 10 ? `0${seconds}` : seconds);
  }
  useEffect(() => {
    if (currentLan) {
      setTimer(setInterval(() => tick(), 1000));
    }
    return () => {
      clearInterval(timer);
    };
  }, [currentLan]);

  // return `${days} day${days === 1 ? "" : "s"}, ${hours} hour${
  //   hours === 1 ? "" : "s"
  // }, ${minutes} minute${minutes === 1 ? "" : "s"}, and ${seconds} second${
  //   seconds === 1 ? "" : "s"
  // }`;

  // Get CSRF token from context.
  const csrfTokenCookie = useContext(CsrfTokenContext);

  const [addIdentityModalOpen, setAddIdentityModalOpen] = useState(false);
  const [addIdentityFirstName, setAddIdentityFirstName] = useState("");
  const [addIdentityLastName, setAddIdentityLastName] = useState("");
  const [addIdentityStudentId, setAddIdentityStudentId] = useState("");
  const [addIdentityError, setAddIdentityError] = useState("");
  const [addIdentityTicketRequestError, setAddIdentityTicketRequestError] =
    useState("");
  // TODO: One non-binary variable would probably be a better choice to handle this
  const [isWaitingForAddIdentity, setIsWaitingForAddIdentity] = useState(false);
  const [identityAdded, setIdentityAdded] = useState(false);

  // Toggle the visibility of the add identity modal
  function toggleAddIdentityModal() {
    if (!addIdentityModalOpen) {
      setAddIdentityError("");
      setIdentityAdded(false);
    }
    setAddIdentityModalOpen(!addIdentityModalOpen);
  }

  function addIdentity() {
    setIsWaitingForAddIdentity(true);
    axios
      .patch(
        "/api/users/profile/",
        {
          first_name: addIdentityFirstName,
          last_name: addIdentityLastName,
          student_id: addIdentityStudentId,
        },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      .then(() => {
        axios
          .post(
            "/api/lan-ticket-requests/",
            {},
            {
              withCredentials: true,
              headers: { "X-CSRFToken": csrfTokenCookie },
            }
          )
          .then((res) => {
            // TODO: Apparently this is necessary to catch internal server errors,
            //       e.g., when withCredentials isn't provided, so it may be
            //       necessary to amend all the other axios requests
            if (res.status >= 200 && res.status <= 299) {
              setRequestedTicket(true);
            }
          })
          .catch((err) => {
            console.log(err);
            setAddIdentityTicketRequestError(
              "an error occurred while requesting a ticket."
            );
          });
        setIsWaitingForAddIdentity(false);
        setIdentityAdded(true);
      })
      .catch((err) => {
        setIsWaitingForAddIdentity(false);
        if (err.response) {
          if (err.response.status === 400) {
            // TODO: Be more specific.
            setAddIdentityError("An error occurred while adding your details.");
          } else {
            setAddIdentityError(err.response.data);
          }
        } else if (err.request) {
          setAddIdentityError(err.request);
        } else {
          setAddIdentityError(err.message);
        }
      });
  }

  // If the user has given their name and student ID, create a ticket
  // request on the back end. Otherwise, open the add student identity
  // modal.
  function requestTicket() {
    axios
      .post(
        "/api/lan-ticket-requests/",
        {},
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      .then((res) => {
        // TODO: Apparently this is necessary to catch internal server errors,
        //       e.g., when withCredentials isn't provided, so it may be
        //       necessary to amend all the other axios requests
        if (res.status >= 200 && res.status <= 299) {
          setRequestedTicket(true);
        }
      })
      .catch((err) => {
        // If the user hasn't added their details the back end will return a 403.
        // TODO: There are definitely other situations where the back end returns a 403.
        if (err.response.status === 403) {
          // Get user's name and student ID.
          axios
            .get("/api/users/profile/", { withCredentials: true })
            .then((res) => {
              setAddIdentityFirstName(res.data.first_name);
              setAddIdentityLastName(res.data.last_name);
              setAddIdentityStudentId(res.data.student_id);
              toggleAddIdentityModal();
            })
            .catch((getErr) => {
              console.log(getErr);
            });
        } else {
          console.log(err);
        }
      });
  }

  return (
    // TODO: Lift top row out of MainContent
    <MainContent>
      <Row className="p-5 bg-primary text-white text-center">
        <Col>
          {!waitingForCurrentLan && !currentLan && (
            <>
              <h2>LAN parties</h2>
              <p>Stay tuned for the next one!</p>
            </>
          )}
          {currentLan && (
            <>
              <h2>{currentLan.name}</h2>
              {/* TODO: Eliminate delay between displaying LAN title and timer or at least
                      ensure layout is unaffected. */}
              {Number.isInteger(lanCountdownTime) && lanCountdownTime > 0 && (
                <>
                  <Row>
                    <Col>
                      <h5 className="mb-0">Starts in</h5>
                    </Col>
                  </Row>
                  {/* TODO: Consider just not using Cols for this */}
                  <Row className="justify-content-center">
                    <Col xs={2} lg={1}>
                      <h3 className="mb-0">{countdownDays}</h3>
                      <small>Days</small>
                    </Col>
                    <Col xs={2} lg={1}>
                      <h3 className="mb-0">{countdownHours}</h3>
                      <small>Hours</small>
                    </Col>
                    <Col xs={2} lg={1}>
                      <h3 className="mb-0">{countdownMinutes}</h3>
                      <small>Minutes</small>
                    </Col>
                    <Col xs={2} lg={1}>
                      <h3 className="mb-0">{countdownSeconds}</h3>
                      <small>Seconds</small>
                    </Col>
                  </Row>
                </>
              )}
            </>
          )}
        </Col>
      </Row>
      <Row className="m-5">
        <Row>
          <Col sm="6">
            <h2>What is a LAN party?</h2>
            <p>
              Typically held in the James France auditorium over an entire
              weekend (Friday evening to Sunday afternoon), LAN parties (or
              LANs, for short) provide a space for you bring your own
              computer/console and play among friends, as well as with the
              society&apos;s games and equipment. With a variety of games and
              tournaments to take part in, LANs are a great place to meet new
              people, win prizes, and, of course, play video (and tabletop!)
              games.
            </p>
            <p>
              Regular tickets buy you a seat, table and two plug sockets for
              your set-up (don&apos;t worry about carrying everything, we offer
              a van pickup and drop-off service).
            </p>
          </Col>
          {currentLan &&
            !waitingForTicketResponse &&
            !hasTicket &&
            !requestedTicket && (
              <Col sm="6">
                <h2>How to get a ticket</h2>
                <ol>
                  <li className="fs-4 mt-3">Purchase one here: ...</li>
                  <li className="fs-4 mt-3">
                    Then,{" "}
                    {!isAuthenticated && (
                      <>
                        <a href="/login">login</a> and
                      </>
                    )}{" "}
                    click the button below to send a request to committee to
                    check and give you access.{" "}
                    <Button
                      type="button"
                      onClick={() => requestTicket()}
                      disabled={!isAuthenticated}
                    >
                      I&apos;ve bought a ticket
                    </Button>
                  </li>
                </ol>
              </Col>
            )}
          {!waitingForTicketResponse && requestedTicket && !hasTicket && (
            <Col sm="6">
              <h2 className="text-primary">
                Waiting for committee to verify ticket purchase.
              </h2>
            </Col>
          )}
          {hasTicket && (
            <Col sm="6">
              <h2>LAN to-do list:</h2>
              <ol>
                <li>
                  {/* TODO: Make this work with React Router (use Navlinks instead?) */}
                  <a href="/lan/rules/">
                    Read the information and rules for LANs.
                  </a>
                </li>
                {/* TODO: Make this conditional on whether LAN van will be run. */}
                <li>
                  <a href="/lan/van-booking/">
                    Book the LAN van pick-up service.
                  </a>
                </li>
                <li>
                  <a href="/lan/seat-booking/">Book a seating group.</a>
                </li>
              </ol>
            </Col>
          )}
        </Row>
      </Row>
      {/* Add identity modal. */}
      <Modal
        isOpen={addIdentityModalOpen}
        toggle={
          !isWaitingForAddIdentity ? () => toggleAddIdentityModal() : undefined
        }
      >
        {!identityAdded && (
          <>
            <ModalHeader
              toggle={
                !isWaitingForAddIdentity
                  ? () => toggleAddIdentityModal()
                  : undefined
              }
            >
              Please give your name and student ID so your ticket can be
              verified.
            </ModalHeader>
            {/* TODO: Consider containing this in a form to capture enter keypress */}
            <ModalBody>
              {/* TODO: Add link to profile */}
              <p>
                You can edit or remove these later by going to your profile.
              </p>
              <FormGroup floating>
                <Input
                  id="addIdentityFirstName"
                  name="addIdentityFirstName"
                  value={addIdentityFirstName}
                  // invalid={!addIdentityFirstName}
                  placeholder="First name"
                  onInput={(e) => setAddIdentityFirstName(e.target.value)}
                />
                <Label for="addIdentityFirstName">First name</Label>
                {/* {!addIdentityFirstName && (
                  <FormFeedback>First name must not be blank.</FormFeedback>
                )} */}
              </FormGroup>
              <FormGroup floating>
                <Input
                  id="addIdentityLastName"
                  name="addIdentityLastName"
                  value={addIdentityLastName}
                  // invalid={!addIdentityLastName}
                  placeholder="Last name"
                  onInput={(e) => setAddIdentityLastName(e.target.value)}
                />
                <Label for="addIdentityLastName">Last name</Label>
                {/* {!addIdentityLastName && (
                  <FormFeedback>Last name must not be blank.</FormFeedback>
                )} */}
              </FormGroup>
              <FormGroup floating>
                <Input
                  id="addIdentityStudentId"
                  name="addIdentityStudentId"
                  value={addIdentityStudentId}
                  // invalid={!addIdentityStudentId}
                  placeholder="Student ID"
                  onInput={(e) => setAddIdentityStudentId(e.target.value)}
                />
                <Label for="addIdentityStudentId">Student ID</Label>
                {/* {!addIdentityStudentId && (
                  <FormFeedback>Student ID must not be blank.</FormFeedback>
                )} */}
              </FormGroup>
              {addIdentityError && (
                <Alert color="danger">{addIdentityError}</Alert>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                disabled={
                  !addIdentityFirstName ||
                  !addIdentityLastName ||
                  !addIdentityStudentId ||
                  isWaitingForAddIdentity
                }
                onClick={() => addIdentity()}
              >
                Add details and request ticket
              </Button>
              <Button
                color="secondary"
                onClick={() => toggleAddIdentityModal()}
                disabled={isWaitingForAddIdentity}
              >
                Cancel
              </Button>
            </ModalFooter>
          </>
        )}
        {identityAdded && (
          <ModalHeader toggle={() => toggleAddIdentityModal()}>
            Your details have been added{" "}
            {!addIdentityTicketRequestError && (
              <>and a LAN ticket has been requested.</>
            )}
            {addIdentityTicketRequestError && (
              <span className="text-danger">
                but {addIdentityTicketRequestError}
              </span>
            )}
          </ModalHeader>
        )}
      </Modal>
    </MainContent>
  );
}
Lan.propTypes = {
  isAuthenticated: propTypes.bool.isRequired,
};
