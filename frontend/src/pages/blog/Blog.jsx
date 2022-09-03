import React, { useState, useEffect } from "react";

import axios from "axios";
// import ReactMarkdown from "react-markdown";
import {
  Card,
  CardBody,
  CardImg,
  // CardText,
  CardTitle,
  Col,
  Row,
} from "reactstrap";

import "./Blog.css";
import MainContent from "../../components/layout/MainContent";

// Map all headings in the post to use a different max size (e.g., less than the
// title heading)
// const headingStart = 4;
// const headingMap = {};
// for (let i = 1; i < 7 - headingStart; i += 1) {
//   headingMap[`h${i}`] = `h${i + headingStart - 1}`;
// }
// for (let i = 7 - headingStart; i < 7; i += 1) {
//   headingMap[`h${i}`] = "h6";
// }

export default function Blog() {
  const [postList, setPostList] = useState([]);

  useEffect(() => {
    axios
      .get("/api/blog/")
      .then((res) => {
        setPostList(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <MainContent>
      <Row className="justify-content-center">
        <Col sm="8">
          <h2>Blog</h2>
          <ul className="p-0">
            {postList.map((item) => (
              <Card className="my-2" key={item.id}>
                {item.image && (
                  <CardImg
                    className="BlogPostImage"
                    src={item.image}
                    // TODO: Consider manual alt texts
                    alt={`${item.title} banner`}
                  />
                )}
                <CardBody>
                  <CardTitle title={item.title}>
                    <Row>
                      <Col>
                        <h3>
                          <a
                            href={`/blog/${item.id}`}
                            className="stretched-link"
                          >
                            {item.title}
                          </a>
                        </h3>
                      </Col>
                      <Col className="text-end">
                        <small>
                          Posted on {new Date(item.date).toLocaleDateString()}
                        </small>
                      </Col>
                    </Row>
                  </CardTitle>
                  {/* TODO: Consider looking into way to give post preview in a
                            way that respects Markdown elements. */}
                  {/* <CardText>
                    <ReactMarkdown components={headingMap}>
                      {item.body.slice(0, 50) +
                        (item.body.length > 50 ? "..." : "")}
                    </ReactMarkdown>
                  </CardText> */}
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
