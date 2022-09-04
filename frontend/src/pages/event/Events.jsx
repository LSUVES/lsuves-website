import React, { useState, useEffect } from "react";

import axios from "axios";
import { Card, CardBody, CardText, CardTitle, Col, Row } from "reactstrap";

import MainContent from "../../components/layout/MainContent";

export default function Events() {
  const [eventList, setEventList] = useState([]);

  useEffect(() => {
    axios
      .get("/api/events/")
      .then((res) => setEventList(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <MainContent mainClass="background">
      <Row className="justify-content-center">
        <Col sm="8">
          <h3 className="text-center">Upcoming events</h3>
          <ul className="p-0">
            {/* TODO: Use event.end_time instead? */}
            {eventList
              .filter((event) => new Date(event.start_time) > new Date())
              .map((item) => (
                <Card className="my-2" key={item.id}>
                  <CardBody>
                    <CardTitle title={item.name}>
                      {/* TODO: Don't render date if event is this week or weekday if event is today */}
                      {new Date(item.start_time).toLocaleString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        weekday: "short",
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                      })}{" "}
                      <a href={`/events/${item.id}`} className="stretched-link">
                        {item.name}
                      </a>
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
    </MainContent>
  );
}
