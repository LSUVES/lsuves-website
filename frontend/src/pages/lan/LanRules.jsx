import React from "react";

import { Col, Row } from "reactstrap";

import MainContent from "../../components/layout/MainContent";

export default function LanRules() {
  return (
    <MainContent>
      <Row>
        <Col>
          <h2>LAN rules:</h2>
          <ol>
            <li>You do not talk about LANs.</li>
            <li>You do not talk about LANs.</li>
            <li>No bamboozling.</li>
          </ol>
        </Col>
      </Row>
    </MainContent>
  );
}
