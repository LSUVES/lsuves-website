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

export default function Blog() {
  const [postList, setPostList] = useState([]);

  useEffect(() => {
    axios
      .get("/api/blog/")
      .then((res) => setPostList(res.data))
      .catch((err) => console.log(err));
  }, [postList.length]);

  return (
    <Row className="justify-content-center">
      <Col xs="12" sm="6">
        <ul>
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
                {item.events.map((event) => {
                  // console.log(item);
                  // console.log(event);
                  // let events = [];
                  // for (let i = 0; i < item.events.length; i += 1) {
                  //   events += <li>{item.events[i]}</li>;
                  // }
                  const eventItem = <li>Event {event}</li>;
                  // return events.length > 0 ? (
                  return (
                    <CardText>
                      Related events:<ul>{eventItem}</ul>
                    </CardText>
                  );
                  // ) : (
                  //   events
                  // );
                })}
              </CardBody>
            </Card>
          ))}
        </ul>
      </Col>
    </Row>
  );
}
