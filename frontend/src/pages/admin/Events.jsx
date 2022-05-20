import React, { useEffect, useState } from "react";

import axios from "axios";
import { Button, Card, CardBody, CardTitle, Col, Row } from "reactstrap";

import EventForm from "../../components/forms/EventForm";
import MainContent from "../../components/layout/MainContent";

export default function Events() {
  const [eventList, setEventList] = useState([]);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState({});

  function getEvents() {
    // Get a list of all events from the backend.
    axios
      .get("/api/events/")
      .then((res) => setEventList(res.data))
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    getEvents();
  }, []);

  function getEventAndEdit(eventId) {
    // Get all information about a specific event from the backend and set as
    // event being edited.
    axios
      .get(`/api/events/${eventId}/`)
      .then((res) => {
        setEditingEvent({
          id: res.data.id,
          name: res.data.name,
          type: res.data.type,
          isMembersOnly: res.data.is_members_only,
          location: res.data.location,
          startTime: new Date(res.data.start_time),
          endTime: new Date(res.data.end_time),
        });
        setIsEditingEvent(true);
      })
      .catch((err) => console.log(err));
  }

  const handleClose = () => {
    setIsEditingEvent(false);
    setEditingEvent({});
    getEvents();
  };

  return (
    <MainContent>
      <Row className="justify-content-center">
        <Col sm="8">
          {!isEditingEvent && (
            <>
              <div className="d-flex justify-content-between">
                <h3>Events:</h3>
                <Button color="primary" onClick={() => setIsEditingEvent(true)}>
                  Create new event
                </Button>
              </div>
              <ul className="p-0">
                {eventList.map((item) => (
                  <Card className="my-2" key={item.id}>
                    <CardBody>
                      <CardTitle
                        title={item.name}
                        className="d-flex justify-content-between mb-0"
                      >
                        <h5 className="my-auto">{item.name}</h5>
                        <Button onClick={() => getEventAndEdit(item.id)}>
                          Edit
                        </Button>
                      </CardTitle>
                    </CardBody>
                  </Card>
                ))}
              </ul>
            </>
          )}
          {isEditingEvent && (
            <EventForm
              event={editingEvent.id ? editingEvent : undefined}
              onClose={handleClose}
            />
          )}
        </Col>
      </Row>
    </MainContent>
  );
}
