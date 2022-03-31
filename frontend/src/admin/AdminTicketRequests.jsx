import React, { useEffect, useState } from "react";

import axios from "axios";
import propTypes from "prop-types";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Container,
  Row,
} from "reactstrap";

import getCookie from "../utils/getCookie";

export default function AdminTicketRequests({ isAuthenticated }) {
  const [ticketRequestList, setTicketRequestList] = useState([]);
  // FIXME: use an object for this.
  const [approvedTicketRequests, setApprovedTicketRequests] = useState(
    Object.create(null)
  );

  useEffect(() => {
    if (isAuthenticated) {
      axios
        .get("/api/lan-ticket-requests/", { withCredentials: true })
        .then((res) => setTicketRequestList(res.data))
        .catch((err) => console.log(err));
    }
  }, [isAuthenticated]);
  useEffect(() => {
    if (isAuthenticated) {
      axios
        .get("/api/lan-tickets/", { withCredentials: true })
        .then((res) => {
          const newApprovedTicketRequests = [];
          res.data.forEach((item) => {
            newApprovedTicketRequests[item.user.id] = true;
          });
          setApprovedTicketRequests({
            ...approvedTicketRequests,
            ...newApprovedTicketRequests,
          });
        })
        .catch((err) => console.log(err));
    }
  }, [isAuthenticated]);

  function approveTicketRequest(userId) {
    let csrfTokenCookie = getCookie("csrftoken");
    // TODO: DRY this out (see Login and Register) by pulling into getCsrfTokenCookie function
    if (!csrfTokenCookie) {
      axios
        .get("/api/csrf/")
        .then(() => {
          csrfTokenCookie = getCookie("csrftoken");
        })
        .catch((err) => {
          console.log(err);
        });
    }

    axios
      .post(
        "/api/lan-ticket-requests/approve_ticket_request/",
        { userId },
        { withCredentials: true, headers: { "X-CSRFToken": csrfTokenCookie } }
      )
      .then(() => {
        // FIXME: doesn't update
        console.log(userId);
        setApprovedTicketRequests({
          ...approvedTicketRequests,
          [userId]: true,
        });
      })
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    console.log(approvedTicketRequests);
    console.log(approvedTicketRequests[7]);
  }, [approvedTicketRequests]);

  return (
    <main>
      <Container className="mt-5">
        <Row>
          <Col>
            <h3>Ticket requests:</h3>
            <ul>
              {ticketRequestList.map((item) => (
                <Card key={item.user.id} className="mt-3">
                  <CardBody>
                    <CardTitle>{item.user.username}</CardTitle>
                    {!approvedTicketRequests[item.user.id] && (
                      <Button
                        type="button"
                        onClick={() => approveTicketRequest(item.user.id)}
                      >
                        Approve ticket request.
                      </Button>
                    )}
                    {approvedTicketRequests[item.user.id] && (
                      <p>Ticket request approved</p>
                    )}
                  </CardBody>
                </Card>
              ))}
            </ul>
          </Col>
        </Row>
      </Container>
    </main>
  );
}
AdminTicketRequests.propTypes = {
  isAuthenticated: propTypes.bool.isRequired,
};
