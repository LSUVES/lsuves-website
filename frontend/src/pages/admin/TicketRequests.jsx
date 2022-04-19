import React, { useContext, useEffect, useState } from "react";

import axios from "axios";
import propTypes from "prop-types";
import { Button, Card, CardBody, CardTitle, Col, Row } from "reactstrap";

import CsrfTokenContext from "../../contexts/CsrfTokenContext";

export default function AdminTicketRequests({ isAuthenticated }) {
  const [ticketRequestList, setTicketRequestList] = useState([]);
  // FIXME: use an object for this.
  const [approvedTicketRequests, setApprovedTicketRequests] = useState(
    Object.create(null)
  );

  useEffect(() => {
    if (isAuthenticated) {
      // TODO: Should only get current LAN ticket( request)s
      axios
        .get("/api/lan-ticket-requests/?current", {
          withCredentials: true,
        })
        .then((res) => setTicketRequestList(res.data))
        .catch((err) => console.log(err));
    }
  }, [isAuthenticated]);
  useEffect(() => {
    // FIXME: Check tickets are for current LAN, do not approve for old ones.
    if (isAuthenticated) {
      axios
        .get("/api/lan-tickets/?current", { withCredentials: true })
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

  const csrfTokenCookie = useContext(CsrfTokenContext);

  function approveTicketRequest(userId) {
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
    </main>
  );
}
AdminTicketRequests.propTypes = {
  isAuthenticated: propTypes.bool.isRequired,
};
