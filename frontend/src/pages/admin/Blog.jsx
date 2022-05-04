import React, { useEffect, useState } from "react";

import axios from "axios";
import {
  Button,
  Card,
  CardBody,
  // CardText,
  CardTitle,
  Col,
  Row,
} from "reactstrap";

import BlogForm from "../../components/forms/BlogForm";
import MainContent from "../../components/layout/MainContent";

export default function Blog() {
  const [postList, setPostList] = useState([]);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editingPost, setEditingPost] = useState({});

  function getPosts() {
    // Get a list of all blog posts from the backend.
    axios
      .get("/api/blog/")
      .then((res) => setPostList(res.data))
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    getPosts();
  }, [postList.length]);

  function getPostAndEdit(postId) {
    // Get all information about a specific post from the backend and set as
    // post being edited.
    axios
      .get(`/api/blog/${postId}/`)
      .then((res) => {
        setEditingPost({
          id: res.data.id,
          title: res.data.title,
          body: res.data.body,
          image: res.data.image,
          date: res.data.date,
          events: res.data.events,
        });
        setIsEditingPost(true);
      })
      .catch((err) => console.log(err));
  }

  const handleClose = () => {
    setIsEditingPost(false);
    setEditingPost({});
    getPosts();
  };

  return (
    <MainContent>
      <Row className="justify-content-center">
        <Col sm="8">
          {!isEditingPost && (
            <>
              <div className="d-flex justify-content-between">
                <h3>Blog posts:</h3>
                <Button color="primary" onClick={() => setIsEditingPost(true)}>
                  Create new post
                </Button>
              </div>
              <ul className="p-0">
                {postList.map((item) => (
                  <Card className="my-2" key={item.id}>
                    <CardBody>
                      <CardTitle
                        title={item.title}
                        className="d-flex justify-content-between mb-0"
                      >
                        <h5 className="my-auto">{item.title}</h5>
                        <Button onClick={() => getPostAndEdit(item.id)}>
                          Edit
                        </Button>
                      </CardTitle>
                      {/* <CardText>{item.body}</CardText> */}
                    </CardBody>
                  </Card>
                ))}
              </ul>
            </>
          )}
          {isEditingPost && (
            <BlogForm
              post={editingPost.id ? editingPost : undefined}
              onClose={handleClose}
            />
          )}
        </Col>
      </Row>
    </MainContent>
  );
}
