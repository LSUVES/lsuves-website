import React from "react";

import {
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Row,
} from "reactstrap";

export default function Dashboard() {
  return (
    <main className="d-flex flex-column flex-grow-1">
      <Row className="d-flex flex-row flex-grow-1 mt-5 justify-content-center">
        {/* TODO: Only display if requests exist */}
        <Col sm="5">
          <Card>
            <CardBody>
              <CardTitle>Membership requests</CardTitle>
              <Button type="button" className="stretched-link">
                Go to membership requests
              </Button>
            </CardBody>
          </Card>
        </Col>
        <Col sm="5">
          <Card>
            <CardBody>
              <CardTitle>Ticket requests</CardTitle>
              <CardText>There are requests waiting to be approved</CardText>
              {/* TODO: Is there a better way of linking to things with RR? */}
              <a href="/admin/ticket-requests" className="stretched-link">
                Check them out
              </a>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </main>
  );
}
