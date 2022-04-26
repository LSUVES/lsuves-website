import React, { useEffect, useState } from "react";

import axios from "axios";
import { useParams } from "react-router-dom";

import AxiosError from "../../components/axiosError/AxiosError";
import MainContent from "../../components/layout/MainContent";

export default function Event() {
  const [event, setEvent] = useState();
  const { eventId } = useParams();
  const [display, setDisplay] = useState();

  useEffect(() => {
    axios
      .get(`/api/events/${eventId}/`)
      .then((res) => setEvent(res.data))
      .catch((err) => {
        console.log(err);
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
            <b>Starts:</b> {new Date(event.start_time).toLocaleString()}
          </p>
          <p>
            <b>Ends:</b> {new Date(event.end_time).toLocaleString()}
          </p>
        </>
      );
    }
  }, [event]);

  return <MainContent>{display}</MainContent>;
}
