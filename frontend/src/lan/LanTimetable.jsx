import React, { useEffect, useState } from "react";

import axios from "axios";
import { Card, CardBody, CardTitle, Col, Container, Row } from "reactstrap";

export default function LanTimetable() {
  const [lanEventList, setLanEventList] = useState([]);

  useEffect(() => {
    axios
      .get("/api/events/current_lan_events/")
      .then((res) => setLanEventList(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <main>
      <Container className="mt-5">
        <Row>
          <Col>
            <h3>Lan events:</h3>
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
      </Container>
    </main>
  );
}
