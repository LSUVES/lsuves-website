import React, { useState, useEffect } from "react";

import axios from "axios";
import {
  Card,
  CardBody,
  CardImg,
  CardText,
  CardTitle,
  Col,
  Row,
} from "reactstrap";

import "./Blog.css";
import MainContent from "../../components/layout/MainContent";

export default function Blog() {
  const [postList, setPostList] = useState([]);

  useEffect(() => {
    axios
      .get("/api/blog/")
      .then((res) => setPostList(res.data))
      .catch((err) => console.log(err));
  }, [postList.length]);

  return (
    <MainContent>
      <Row className="justify-content-center">
        <Col sm="8">
          <ul className="p-0">
            {postList.map((item) => (
              <Card className="my-2" key={item.id}>
                <CardImg
                  className="BlogPostImage"
                  src={item.image}
                  alt="tempalt"
                />
                <CardBody>
                  <CardTitle title={item.title}>{item.title}</CardTitle>
                  <CardText>{item.body}</CardText>
                  {item.events.length > 0 && (
                    <span>
                      Related events:
                      <ul>
                        {item.events.map((event) => {
                          console.log(event.id);
                          // let events = [];
                          // for (let i = 0; i < item.events.length; i += 1) {
                          //   events += <li>{item.events[i]}</li>;
                          // }
                          const eventItem = (
                            <li key={event.id}>
                              <a href={`/events/${event.id}`}>{event.name}</a>
                            </li>
                          );
                          // return events.length > 0 ? (
                          return eventItem;
                        })}
                      </ul>
                    </span>
                  )}
                </CardBody>
              </Card>
            ))}
          </ul>
        </Col>
      </Row>
    </MainContent>
  );
}