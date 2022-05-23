import React, { useEffect, useState } from "react";

import axios from "axios";
import { NavLink as RRNavLink } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  // CardText,
  CardTitle,
  Col,
  Row,
} from "reactstrap";

import MainContent from "../../components/layout/MainContent";

export default function Dashboard() {
  const [numMembershipRequests, setNumMembershipRequests] = useState(0);
  const [numTicketRequests, setNumTicketRequests] = useState(0);

  useEffect(() => {
    axios
      .get("/api/users/", { withCredentials: true })
      .then((res) =>
        setNumMembershipRequests(
          res.data.filter((item) => item.is_requesting_membership).length
        )
      )
      .catch((err) => console.log(err));

    axios
      .get("/api/lan-ticket-requests/?current", {
        withCredentials: true,
      })
      .then((res) => setNumTicketRequests(res.data.length))
      .catch((err) => console.log(err));
  }, []);
  return (
    <MainContent>
      <h2 className="text-center">Admin dashboard</h2>
      <Row className="d-flex flex-row flex-grow-1 mt-5 justify-content-center">
        {numMembershipRequests > 0 && (
          <Col sm="5">
            <Card>
              <CardBody>
                <CardTitle>
                  {numMembershipRequests} user
                  {numMembershipRequests === 1 ? <> is </> : <>s are </>}
                  requesting membership
                </CardTitle>
                {/* TODO: Link directly to membership requests, using search param with React-Router */}
                <Button
                  type="button"
                  className="stretched-link"
                  tag={RRNavLink}
                  to="/admin/users"
                >
                  Go to users
                </Button>
              </CardBody>
            </Card>
          </Col>
        )}
        {numTicketRequests > 0 && (
          <Col sm="5">
            <Card>
              <CardBody>
                <CardTitle>
                  There {numTicketRequests === 1 ? <>is</> : <>are</>}{" "}
                  {numTicketRequests} ticket request
                  {numTicketRequests === 1 ? <></> : <>s</>} waiting to be
                  approved
                </CardTitle>
                {/* <CardText>There are requests waiting to be approved</CardText> */}
                {/* TODO: Can something like this be implemented with React-Router? */}
                {/* <a href="/admin/ticket-requests" className="stretched-link">
                Check them out
              </a> */}
                <Button
                  type="button"
                  className="stretched-link"
                  tag={RRNavLink}
                  to="/admin/tickets"
                >
                  Go to tickets
                </Button>
              </CardBody>
            </Card>
          </Col>
        )}
        {numMembershipRequests === 0 && numTicketRequests === 0 && (
          <p className="text-center fs-5">Nothing to review</p>
        )}
      </Row>
    </MainContent>
  );
}
