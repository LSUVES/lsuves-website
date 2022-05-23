import React, { useEffect, useState } from "react";

import axios from "axios";
import { Card, CardBody, CardTitle, Col, Row } from "reactstrap";

import MainContent from "../../components/layout/MainContent";

export default function LanTimetable() {
  const [lanEventList, setLanEventList] = useState([]);

  useEffect(() => {
    axios
      .get("/api/events/current_lan_events/")
      .then((res) => setLanEventList(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <MainContent>
      <Row className="justify-content-center">
        <Col sm={8}>
          <h2 className="text-center">Lan events</h2>
          <ul>
            {lanEventList.map((item) => (
              <Card key={item.id} className="mt-3">
                <CardBody>
                  <CardTitle title={item.name}>
                    <a href={`/events/${item.id}`}>{item.name}</a>
                  </CardTitle>
                </CardBody>
              </Card>
            ))}
          </ul>
        </Col>
      </Row>
    </MainContent>
  );
}
