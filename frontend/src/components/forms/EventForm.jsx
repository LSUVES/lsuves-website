import React, { useContext, useState } from "react";

import axios from "axios";
import propTypes from "prop-types";
import {
  Button,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";

import CsrfTokenContext from "../../contexts/CsrfTokenContext";
import formatDateTime from "../../utils/formatDateTime";
import useUpdateEffect from "../../utils/useUpdateEffect/useUpdateEffect";
import {
  checkLocation,
  checkName,
  checkStartTime,
  DEFAULT_EVENT_TYPE,
  EVENT_TYPES,
  MIN_START_TIME_STR,
  MAX_START_TIME_STR,
  checkEndTime,
} from "../../utils/validation/event";
import MainContent from "../layout/MainContent";

export default function EventForm({ event, onClose }) {
  const [name, setEventName] = useState(event.name);
  const [nameIsValid, setNameIsValid] = useState(null);
  const [nameFeedback, setNameFeedback] = useState("");
  const [type, setEventType] = useState(event.type);
  const [isMembersOnly, setIsMembersOnly] = useState(event.isMembersOnly);
  const [location, setLocation] = useState(event.location);
  const [locationIsValid, setLocationIsValid] = useState(null);
  const [locationFeedback, setLocationFeedback] = useState("");
  const [startTime, setStartTime] = useState(formatDateTime(event.startTime));
  const [startTimeIsValid, setStartTimeIsValid] = useState(null);
  const [startTimeFeedback, setStartTimeFeedback] = useState("");
  const [endTime, setEndTime] = useState(formatDateTime(event.endTime));
  const [endTimeIsValid, setEndTimeIsValid] = useState(null);
  const [endTimeFeedback, setEndTimeFeedback] = useState("");

  // TODO: Decide whether this is worth it.
  // const [maxEndTime, setMaxEndTime] = useState();
  // useEffect(() => {
  //   const newMaxEndTime = new Date(startTime);
  //   newMaxEndTime.setMonth(newMaxEndTime.getMonth() + 1);
  //   setMaxEndTime(formatDateTime(newMaxEndTime));
  // }, [startTime]);

  // Ensure fields are validated when values are changed.
  useUpdateEffect(checkName, [name], [name, setNameIsValid, setNameFeedback]);
  useUpdateEffect(
    checkLocation,
    [location],
    [location, setLocationIsValid, setLocationFeedback]
  );
  useUpdateEffect(
    checkStartTime,
    [startTime],
    [new Date(startTime), setStartTimeIsValid, setStartTimeFeedback]
  );
  useUpdateEffect(
    checkEndTime,
    [endTime, startTime],
    [
      new Date(endTime),
      new Date(startTime),
      setEndTimeIsValid,
      setEndTimeFeedback,
    ]
  );

  function checkAll() {
    let isValid = checkName(name, setNameIsValid, setNameFeedback);
    isValid =
      checkLocation(location, setLocationIsValid, setLocationFeedback) &&
      isValid;
    isValid =
      checkStartTime(
        new Date(startTime),
        setStartTimeIsValid,
        setStartTimeFeedback
      ) && isValid;
    isValid =
      checkEndTime(
        new Date(endTime),
        new Date(startTime),
        setEndTimeIsValid,
        setEndTimeFeedback
      ) && isValid;
    return isValid;
  }

  const csrfTokenCookie = useContext(CsrfTokenContext);

  function updateEvent() {
    // Updates the event on the backend.
    if (!checkAll()) {
      return;
    }

    axios
      .put(
        `/api/events/${event.id}/`,
        {
          name,
          type: type.toLowerCase(),
          is_members_only: isMembersOnly,
          location,
          start_time: startTime,
          end_time: endTime,
        },
        { withCredentials: true, headers: { "X-CSRFToken": csrfTokenCookie } }
      )
      .then((res) => {
        console.log(res.data);
        onClose();
      })
      .catch((err) => console.log(err));
  }

  function createEvent() {
    // Creates the event on the backend.
    if (!checkAll()) {
      return;
    }

    axios
      .post(
        "/api/events/",
        {
          name,
          type: type.toLowerCase(),
          is_members_only: isMembersOnly,
          location,
          start_time: startTime,
          end_time: endTime,
        },
        { withCredentials: true, headers: { "X-CSRFToken": csrfTokenCookie } }
      )
      .then((res) => {
        console.log(res.data);
        onClose();
      })
      .catch((err) => console.log(err));
  }

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  function toggleDeleteModal() {
    console.log(!deleteModalOpen);
    setDeleteModalOpen(!deleteModalOpen);
  }

  function deleteEvent() {
    // Deletes the event on the backend.
    axios
      .delete(`/api/events/${event.id}/`, {
        withCredentials: true,
        headers: { "X-CSRFToken": csrfTokenCookie },
      })
      .then((res) => {
        console.log(res.data);
        onClose();
      })
      .catch((err) => console.log(err));
  }

  return (
    <MainContent classes="m-auto">
      {event.name && <h3>{`Editing ${event.name}`}</h3>}
      {!event.name && <h3>Creating a new event</h3>}
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          if (event.name) {
            updateEvent();
          } else {
            createEvent();
          }
        }}
      >
        <FormGroup floating>
          <Input
            id="name"
            name="name"
            value={name}
            placeholder="Name"
            onInput={(e) => setEventName(e.target.value)}
            invalid={nameIsValid === false}
          />
          <Label for="name">Name</Label>
          {!nameIsValid && <FormFeedback>{nameFeedback}</FormFeedback>}
        </FormGroup>
        <FormGroup floating>
          <Input
            id="type"
            name="type"
            type="select"
            value={type}
            placeholder="Type"
            onInput={(e) => setEventType(e.target.value)}
          >
            {Object.keys(EVENT_TYPES).map((typeKey) => (
              <option key={typeKey} value={typeKey}>
                {EVENT_TYPES[typeKey]}
              </option>
            ))}
          </Input>
          <Label for="type">Type</Label>
        </FormGroup>
        {/* TODO: Make other checkboxes on the site like this */}
        <FormGroup check inline>
          <Label check>
            <Input
              id="isMembersOnly"
              name="isMembersOnly"
              type="checkbox"
              value={isMembersOnly}
              placeholder="Is members only"
              onInput={(e) => setIsMembersOnly(e.target.value)}
            />{" "}
            Is members only
          </Label>
        </FormGroup>
        <FormGroup floating>
          <Input
            id="location"
            name="location"
            value={location}
            placeholder="Location"
            onInput={(e) => setLocation(e.target.value)}
            invalid={locationIsValid === false}
          />
          <Label for="location">Location</Label>
          {!locationIsValid && <FormFeedback>{locationFeedback}</FormFeedback>}
        </FormGroup>
        <Row>
          <Col>
            <FormGroup floating>
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                defaultValue={startTime}
                min={MIN_START_TIME_STR}
                max={MAX_START_TIME_STR}
                onInput={(e) => setStartTime(e.target.value)}
                invalid={startTimeIsValid === false}
              />
              <Label for="startTime">Start time</Label>
              {!startTimeIsValid && (
                <FormFeedback>{startTimeFeedback}</FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col>
            <FormGroup floating>
              <Input
                id="endTime"
                name="endTime"
                type="datetime-local"
                defaultValue={endTime}
                min={startTime}
                max={MAX_START_TIME_STR}
                onInput={(e) => setEndTime(e.target.value)}
                invalid={endTimeIsValid === false}
              />
              <Label for="endTime">End time</Label>
              {!endTimeIsValid && (
                <FormFeedback>{endTimeFeedback}</FormFeedback>
              )}
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormGroup>
              <Button
                id="cancel"
                name="cancel"
                color="secondary"
                size="lg"
                block
                onClick={() => onClose()}
              >
                Cancel
              </Button>
            </FormGroup>
          </Col>
          <Col>
            {/* TODO: Grey out update button until changes have been made */}
            <FormGroup>
              <Button id="submit" name="submit" color="primary" size="lg" block>
                {event.name && <>Update event</>}
                {!event.name && <>Create event</>}
              </Button>
            </FormGroup>
          </Col>
        </Row>
        {event.name && (
          <Row>
            <Col />
            <Col>
              <FormGroup>
                <Button
                  id="delete"
                  name="delete"
                  color="danger"
                  size="lg"
                  block
                  onClick={() => toggleDeleteModal()}
                >
                  Delete event
                </Button>
                <Modal
                  isOpen={deleteModalOpen}
                  toggle={() => toggleDeleteModal()}
                >
                  <ModalHeader toggle={() => toggleDeleteModal()}>
                    Are you sure you want to delete {event.name}?
                  </ModalHeader>
                  <ModalFooter>
                    <Button color="primary" onClick={() => deleteEvent()}>
                      Delete
                    </Button>
                    <Button
                      color="secondary"
                      onClick={() => toggleDeleteModal()}
                    >
                      Cancel
                    </Button>
                  </ModalFooter>
                </Modal>
              </FormGroup>
            </Col>
          </Row>
        )}
      </Form>
    </MainContent>
  );
}
EventForm.propTypes = {
  event: propTypes.shape({
    id: propTypes.number,
    name: propTypes.string,
    type: propTypes.string,
    isMembersOnly: propTypes.bool,
    location: propTypes.string,
    startTime: propTypes.instanceOf(Date),
    endTime: propTypes.instanceOf(Date),
  }),
  onClose: propTypes.func.isRequired,
};
EventForm.defaultProps = {
  event: {
    id: -1,
    name: "",
    type: DEFAULT_EVENT_TYPE,
    isMembersOnly: false,
    location: "",
    startTime: new Date(),
    endTime: new Date(),
  },
};
