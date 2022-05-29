// TODO: Consider extracting this element to use in Blog post list

import React, { useEffect, useState } from "react";

import axios from "axios";
import { useParams } from "react-router-dom";
import { Col, Row } from "reactstrap";

import AxiosError from "../../components/axiosError/AxiosError";
import MainContent from "../../components/layout/MainContent";

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
              {new Date(post.date).toLocaleDateString()}
            </p>
            <Row className="mb-5">
              <img
                // className="BlogPostImage"
                src={post.image}
                // FIXME: Add alt text
                alt="tempalt"
              />
            </Row>
            <p>{post.body}</p>
          </Col>
        </Row>
      )}
      {errorDisplay && errorDisplay}
    </MainContent>
  );
}
