import React, { useContext, useEffect, useState } from "react";

import axios from "axios";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";

import MainContent from "../../components/layout/MainContent";
import CsrfTokenContext from "../../contexts/CsrfTokenContext";

export default function AdminTicketRequests() {
  const [ticketRequestList, setTicketRequestList] = useState([]);
  const [ticketList, setTicketList] = useState([]);
  const [showingTicketRequests, setShowingTicketRequests] = useState(false);
  const [filterUser, setFilterUser] = useState("");

  function getTicketRequests() {
    axios
      .get("/api/lan-ticket-requests/?current", {
        withCredentials: true,
      })
      .then((res) => setTicketRequestList(res.data))
      .catch((err) => console.log(err));
  }

  function getTickets() {
    axios
      .get("/api/lan-tickets/?current", { withCredentials: true })
      .then((res) => {
        setTicketList(res.data);
      })
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    getTicketRequests();
    getTickets();
  }, []);

  const csrfTokenCookie = useContext(CsrfTokenContext);

  // FIXME: Check tickets are for current LAN, do not approve for old ones.
  function approveTicketRequest(userId) {
    axios
      .post(
        "/api/lan-ticket-requests/approve_ticket_request/",
        { userId },
        { withCredentials: true, headers: { "X-CSRFToken": csrfTokenCookie } }
      )
      .then(() => {
        getTicketRequests();
        getTickets();
      })
      .catch((err) => console.log(err));
  }

  function activateTicket(ticketId) {
    axios
      .patch(
        `/api/lan-tickets/${ticketId}/`,
        { is_activated: true },
        { withCredentials: true, headers: { "X-CSRFToken": csrfTokenCookie } }
      )
      .then(() => {
        getTickets();
      })
      .catch((err) => console.log(err));
  }

  return (
    <MainContent>
      <Row className="justify-content-center">
        <Col sm={8}>
          {showingTicketRequests && <h3>Ticket requests:</h3>}
          {!showingTicketRequests && <h3>Tickets:</h3>}
          Filter by
          <Row>
            <Col>
              <FormGroup check>
                <Input
                  id="showingTicketRequests"
                  name="showingTicketRequests"
                  type="checkbox"
                  checked={showingTicketRequests}
                  placeholder="Show ticket requests"
                  onChange={(e) => setShowingTicketRequests(e.target.checked)}
                />{" "}
                <Label for="showingTicketRequests">Show ticket requests</Label>{" "}
                <br />
              </FormGroup>
            </Col>
            <Col>
              <FormGroup floating>
                <Input
                  id="filterUser"
                  name="filterUser"
                  value={filterUser}
                  placeholder="User"
                  onInput={(e) => setFilterUser(e.target.value)}
                />
                <Label for="filterUser">User</Label>
              </FormGroup>
            </Col>
          </Row>
          {showingTicketRequests && (
            <ul className="p-0">
              {ticketRequestList
                .filter(
                  (item) =>
                    item.user.username
                      .toLowerCase()
                      .startsWith(filterUser.toLowerCase()) ||
                    item.user.first_name
                      .concat(" ", item.user.last_name)
                      .toLowerCase()
                      .startsWith(filterUser.toLowerCase())
                )
                .map((item) => (
                  <Card key={item.user.id} className="mt-3">
                    <CardBody>
                      <CardTitle>
                        {item.user.first_name} &ldquo;{item.user.username}
                        &rdquo; {item.user.last_name}
                      </CardTitle>
                      <Button
                        type="button"
                        onClick={() => approveTicketRequest(item.user.id)}
                      >
                        Approve ticket request.
                      </Button>
                    </CardBody>
                  </Card>
                ))}
            </ul>
          )}
          {!showingTicketRequests && (
            <ul className="p-0">
              {ticketList
                .filter(
                  (item) =>
                    item.user.username
                      .toLowerCase()
                      .startsWith(filterUser.toLowerCase()) ||
                    item.user.first_name
                      .concat(" ", item.user.last_name)
                      .toLowerCase()
                      .startsWith(filterUser.toLowerCase())
                )
                .map((item) => (
                  <Card key={item.user.id} className="mt-3">
                    <CardBody>
                      <CardTitle>
                        {item.user.first_name} &ldquo;{item.user.username}
                        &rdquo; {item.user.last_name}
                      </CardTitle>
                      {item.is_activated && <>Activated</>}
                      {!item.is_activated && (
                        <>
                          Not activated{" "}
                          <Button
                            type="button"
                            onClick={() => activateTicket(item.id)}
                          >
                            Activate ticket.
                          </Button>
                        </>
                      )}
                    </CardBody>
                  </Card>
                ))}
            </ul>
          )}
        </Col>
      </Row>
    </MainContent>
  );
}
