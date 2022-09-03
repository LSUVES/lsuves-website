// TODO: Consider extracting this element to use in Blog post list

import React, { useEffect, useState } from "react";

import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import { Col, Row } from "reactstrap";

import AxiosError from "../../components/axiosError/AxiosError";
import MainContent from "../../components/layout/MainContent";

// Map all headings in the post to use a different max size (e.g., less than the
// title heading)
const headingStart = 3;
const headingMap = {};
for (let i = 1; i < 7 - headingStart; i += 1) {
  headingMap[`h${i}`] = `h${i + headingStart - 1}`;
}
for (let i = 7 - headingStart; i < 7; i += 1) {
  headingMap[`h${i}`] = "h6";
}

export default function Post() {
  const [post, setPost] = useState();
  const { postId } = useParams();
  const [errorDisplay, setErrorDisplay] = useState();

  useEffect(() => {
    axios
      .get(`/api/blog/${postId}/`)
      .then((res) => setPost(res.data))
      .catch((err) => {
        console.log(err);
        setErrorDisplay(AxiosError(err));
      });
  }, [postId]);

  return (
    <MainContent>
      {post && (
        <Row className="justify-content-center">
          <Col sm={8}>
            {/* TODO: Figure out how to make h2 inline with date */}
            {/* <div className="d-flex flex-column">
              <h2 className="align-self-center">{post.title}</h2>
              <p className="align-self-end">
                {new Date(post.date).toLocaleDateString()}
              </p>
            </div> */}
            <h2 className="text-center">{post.title}</h2>
            <p className="text-end">
              Posted at{" "}
              {new Date(post.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              on {new Date(post.date).toLocaleDateString()}
            </p>
            {post.image && (
              <Row className="mb-5">
                <img
                  // className="BlogPostImage"
                  src={post.image}
                  alt={`${post.title} banner`}
                />
              </Row>
            )}
            <ReactMarkdown
              components={{
                ...{
                  img: ({ src, alt }) => (
                    <img src={src} alt={alt} style={{ maxWidth: "100%" }} />
                  ),
                },
                ...headingMap,
              }}
            >
              {post.body}
            </ReactMarkdown>
          </Col>
        </Row>
      )}
      {errorDisplay && errorDisplay}
    </MainContent>
  );
}
