import React, { useEffect, useState } from "react";

import axios from "axios";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardImg,
  CardText,
  CardTitle,
  Col,
  Row,
} from "reactstrap";

import MainContent from "../../components/layout/MainContent";

import "./Home.css";

export default function Home() {
  const [latestBlogPost, setLatestBlogPost] = useState();
  const [nextEvent, setNextEvent] = useState();

  useEffect(() => {
    axios
      .get("/api/blog/")
      .then((res) => {
        setLatestBlogPost(res.data[0]);
        console.log(res.data);
      })
      .catch((err) => console.log(err));

    axios
      .get("/api/events/")
      .then((res) =>
        setNextEvent(
          res.data.filter((event) => new Date(event.start_time) > new Date())[0]
        )
      )
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    console.log("blog");
    console.log(latestBlogPost);
    console.log("event");
    console.log(nextEvent);
  }, [latestBlogPost, nextEvent]);
  return (
    <div className="HomeBackground d-flex flex-column flex-fill">
      <MainContent>
        <h1 className="display-1 text-center">
          Welcome to A<span className="text-primary">VGS</span>
        </h1>
        <Row className="justify-content-center mt-5">
          <Col sm={8}>
            <Card>
              <CardBody>
                The video game society is the home to all gamers. On this
                website you can keep up to date with our news and events and
                request LAN tickets and services.
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row className="justify-content-center mt-5">
          <Col xs={6} sm={4}>
            {/* TODO: Link to individual blog and event once breadcrumbs added */}
            {latestBlogPost && (
              <Card>
                <CardBody>
                  <CardTitle title="Latest blog post" className="fs-5">
                    Latest blog post
                  </CardTitle>
                  <CardText className="mb-0">
                    <Link to="/blog" className="stretched-link">
                      {latestBlogPost.title}{" "}
                    </Link>
                  </CardText>
                  <CardImg
                    className="BlogPostImage"
                    src={latestBlogPost.image}
                    // FIXME: Add alt text
                    alt="tempalt"
                  />
                  {/* TODO: Standardise this. */}
                  <CardText>
                    {latestBlogPost.body.slice(0, 50) +
                      (latestBlogPost.body.length > 50 ? "..." : "")}
                  </CardText>
                </CardBody>
              </Card>
            )}
            {!latestBlogPost && (
              <Card>
                <CardBody>
                  <CardTitle title="No blog posts" className="mb-0 fs-5">
                    No recent blog posts
                  </CardTitle>
                </CardBody>
              </Card>
            )}
          </Col>
          <Col xs={6} sm={4}>
            {nextEvent && (
              <Card>
                <CardBody>
                  <CardTitle title="Next event" className="fs-5">
                    Next event
                  </CardTitle>
                  <CardText>
                    <Link to="/events" className="stretched-link">
                      {nextEvent.name}{" "}
                    </Link>{" "}
                    <br />
                    Starts on{" "}
                    {new Date(nextEvent.start_time).toLocaleDateString([], {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(nextEvent.start_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    <br />
                    and ends on{" "}
                    {new Date(nextEvent.end_time).toLocaleDateString([], {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(nextEvent.end_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                  </CardText>
                </CardBody>
              </Card>
            )}
            {!nextEvent && (
              <Card>
                <CardBody>
                  <CardTitle title="No events" className="mb-0 fs-5">
                    No upcoming events
                  </CardTitle>
                </CardBody>
              </Card>
            )}
          </Col>
        </Row>
      </MainContent>
    </div>
  );
}
