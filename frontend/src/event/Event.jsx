import React, { useEffect, useState } from "react";

import axios from "axios";
import { useParams } from "react-router-dom";
import { Container } from "reactstrap";

import AxiosError from "../axiosError/AxiosError";

export default function Event() {
  const [event, setEvent] = useState();
  const { eventId } = useParams();
  const [display, setDisplay] = useState();

  useEffect(() => {
    axios
      .get(`/api/events/${eventId}/`)
      .then((res) => setEvent(res.data))
      .catch((err) => {
        setDisplay(AxiosError(err));
      });
  }, [eventId]);

  useEffect(() => {
    console.log(event);
    if (event) {
      setDisplay(
        <>
          <h2>{event.name}</h2>
          <p>
            <b>Location:</b> {event.location}
          </p>
          <p>
            <b>Begins:</b> {new Date(event.start_time).toString()}
          </p>
          <p>
            <b>Ends:</b> {new Date(event.end_time).toString()}
          </p>
        </>
      );
    }
  }, [event]);

  return (
    <main className="d-flex flex-column">
      <Container>{display}</Container>
    </main>
  );
}
