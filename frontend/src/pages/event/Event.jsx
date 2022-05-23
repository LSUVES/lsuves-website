import React, { useEffect, useState } from "react";

import axios from "axios";
import { useParams } from "react-router-dom";
import { Col, Row, Table } from "reactstrap";

import AxiosError from "../../components/axiosError/AxiosError";
import MainContent from "../../components/layout/MainContent";

export default function Event() {
  const [event, setEvent] = useState();
  const { eventId } = useParams();
  const [errorDisplay, setErrorDisplay] = useState();

  useEffect(() => {
    axios
      .get(`/api/events/${eventId}/`)
      .then((res) => setEvent(res.data))
      .catch((err) => {
        console.log(err);
        setErrorDisplay(AxiosError(err));
      });
  }, [eventId]);

  // TODO: Add link to LAN page for LAN events.
  //       Make this look nice.
  return (
    <MainContent>
      {event && (
        <Row className="justify-content-center">
          <Col sm={8}>
            <h2 className="text-center">{event.name}</h2>
            <Table borderless>
              <tbody>
                <tr>
                  <th className="text-end">
                    <b>Location:</b>
                  </th>
                  <td>{event.location}</td>
                </tr>
                <tr>
                  <th className="text-end">
                    <b>Starts:</b>
                  </th>
                  <td>
                    {new Date(event.start_time).toLocaleString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                </tr>
                <tr>
                  <th className="text-end">
                    <b>Ends:</b>
                  </th>
                  <td>
                    {new Date(event.end_time).toLocaleString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
      )}
      {errorDisplay && errorDisplay}
    </MainContent>
  );
}
