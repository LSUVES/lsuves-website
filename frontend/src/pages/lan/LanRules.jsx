import React from "react";

import { Col, Row } from "reactstrap";

import MainContent from "../../components/layout/MainContent";

export default function LanRules() {
  return (
    <MainContent>
      {/* TODO: Centre this, <ol> forces left alignment of text */}
      <Row className="justify-content-center">
        <Col sm={8}>
          <h2 className="text-center">LAN rules</h2>
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
