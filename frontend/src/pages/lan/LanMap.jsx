import React from "react";

import { Col, Row } from "reactstrap";

import MainContent from "../../components/layout/MainContent";
import { ReactComponent as LanMap } from "../../LANMap.svg";

export default function Map() {
  return (
    <MainContent>
      <Row className="justify-content-center">
        <Col sm={8}>
          <h2 className="text-center">LAN map</h2>
          <LanMap />
        </Col>
      </Row>
    </MainContent>
  );
}
