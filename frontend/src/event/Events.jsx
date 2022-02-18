import React, { useState, useEffect } from "react";

import axios from "axios";
import { Card, CardBody, CardText, CardTitle, Col, Row } from "reactstrap";

export default function Events() {
  const [eventList, setEventList] = useState([]);

  useEffect(() => {
    axios
      .get("/api/events/")
      .then((res) => setEventList(res.data))
      .catch((err) => console.log(err));
  }, [eventList.length]);

  return (
    <main className="d-flex flex-column">
      <Row className="justify-content-center">
        <Col xs="12" sm="6">
          <ul>
            {eventList.map((item) => (
              <Card className="my-2" key={item.id}>
                <CardBody>
                  <CardTitle title={item.name}>
                    <a href={`/events/${item.id}`}>{item.name}</a>
                  </CardTitle>
                  <CardText>{item.body}</CardText>
                  {/* {item.events.length > 0 && (
                    <span>
                      Related posts:
                      <ul>
                        {item.events.map((event) => {
                          console.log(event.id);
                          // let events = [];
                          // for (let i = 0; i < item.events.length; i += 1) {
                          //   events += <li>{item.events[i]}</li>;
                          // }
                          const eventItem = (
                            <li key={event.id}>
                              <a href={`/events/?id=${event.id}`}>{event.name}</a>
                            </li>
                          );
                          // return events.length > 0 ? (
                          return eventItem;
                        })}
                      </ul>
                    </span>
                  )} */}
                </CardBody>
              </Card>
            ))}
          </ul>
        </Col>
      </Row>
    </main>
  );
}
