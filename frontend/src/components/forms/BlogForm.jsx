import React, { useContext, useState } from "react";

import axios from "axios";
import propTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import {
  Button,
  Card,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";

import CsrfTokenContext from "../../contexts/CsrfTokenContext";
import useUpdateEffect from "../../utils/useUpdateEffect/useUpdateEffect";
import { checkBody, checkTitle } from "../../utils/validation/blog";
import MainContent from "../layout/MainContent";

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

export default function BlogForm({ post, onClose }) {
  const [title, setTitle] = useState(post.title);
  const [titleIsValid, setTitleIsValid] = useState(null);
  const [titleFeedback, setTitleFeedback] = useState("");
  const [body, setBody] = useState(post.body);
  const [bodyIsValid, setBodyIsValid] = useState(null);
  const [bodyFeedback, setBodyFeedback] = useState("");
  const [image, setImage] = useState(post.image);
  // const [imageAltText, setImageAltText] = useState(""); // useState(post.imageAltText)
  // const [imageAltTextIsValid, setImageAltTextIsValid] = useState(null);
  const [imageUrl, setImageUrl] = useState(post.image);
  const [date] = useState(post.date);
  // TODO: Implement this.
  const [events] = useState(post.events);

  const [previewing, setPreviewing] = useState(false);

  // Ensure fields are validated when values are changed.
  useUpdateEffect(
    checkTitle,
    [title],
    [title, setTitleIsValid, setTitleFeedback]
  );
  useUpdateEffect(checkBody, [body], [body, setBodyIsValid, setBodyFeedback]);

  function checkAll() {
    let isValid = checkTitle(title, setTitleIsValid, setTitleFeedback);
    isValid = checkBody(body, setBodyIsValid, setBodyFeedback) && isValid;
    return isValid;
  }

  const csrfTokenCookie = useContext(CsrfTokenContext);

  function updatePost() {
    // Updates the post on the backend.
    if (!checkAll()) {
      return;
    }

    // As with createPost, use FormData to handle uploading the image.
    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    // If user has uploaded a new image, i.e., image is no longer the URL of the
    // original one, add it to the form.
    if (image !== imageUrl) {
      formData.append("image", image);
    }
    // TODO: Don't update post date, add edit date?
    // formData.append("date", date);
    console.log(date);
    formData.append("events", events);

    axios
      .patch(`/api/blog/${post.id}/`, formData, {
        withCredentials: true,
        headers: { "X-CSRFToken": csrfTokenCookie },
      })
      .then((res) => {
        console.log(res.data);
        onClose();
      })
      .catch((err) => console.log(err));
  }

  function createPost() {
    // Creates the blog post on the backend.
    if (!checkAll()) {
      return;
    }

    // Add fields to an instance of FormData and upload as multipart/form-data.
    // Although FormData can be instantiated from a form, the names may not agree
    // with the API so append them manually.
    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    formData.append("image", image);
    formData.append("date", new Date().toISOString());
    formData.append("events", []);

    axios
      .post("/api/blog/", formData, {
        withCredentials: true,
        headers: {
          "X-CSRFToken": csrfTokenCookie,
        },
      })
      .then((res) => {
        console.log(res.data);
        onClose();
      })
      .catch((err) => console.log(err));
  }

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  function toggleDeleteModal() {
    setDeleteModalOpen(!deleteModalOpen);
  }

  function deletePost() {
    // Deletes the post on the backend.
    axios
      .delete(`/api/blog/${post.id}/`, {
        withCredentials: true,
        headers: { "X-CSRFToken": csrfTokenCookie },
      })
      .then((res) => {
        console.log(res.data);
        onClose();
      })
      .catch((err) => console.log(err));
  }

  function addImage(inputImage) {
    // Gets image from file input and displays it to the user.
    setImage(inputImage);
    // Release previous BLOB URL to prevent memory leaks in case someone really
    // can't decide which image to use.
    URL.revokeObjectURL(imageUrl);
    setImageUrl(URL.createObjectURL(inputImage));
  }

  return (
    <MainContent classes="m-auto">
      <Row>
        <Col xs="9">
          {post.title && <h3>{`Editing ${post.title}`}</h3>}
          {!post.title && <h3>Creating a new post</h3>}
        </Col>
        <Col>
          <Button
            id="preview"
            name="preview"
            color="secondary"
            block
            onClick={() => setPreviewing(!previewing)}
          >
            {!previewing && <>Preview</>}
            {previewing && <>Edit</>}
          </Button>
        </Col>
      </Row>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          if (post.title) {
            updatePost();
          } else {
            createPost();
          }
        }}
      >
        {!previewing && (
          <>
            <FormGroup floating>
              <Input
                id="title"
                name="title"
                value={title}
                placeholder="Title"
                onInput={(e) => setTitle(e.target.value)}
                invalid={titleIsValid === false}
              />
              <Label for="name">Title</Label>
              {!titleIsValid && <FormFeedback>{titleFeedback}</FormFeedback>}
            </FormGroup>
            {/* TODO: Allow additional images to be uploaded for use in the body.
                      Find a way to support embedding YouTube videos. */}
            <FormGroup floating>
              <Input
                id="body"
                name="body"
                type="textarea"
                value={body}
                placeholder="Body"
                onInput={(e) => setBody(e.target.value)}
                invalid={bodyIsValid === false}
              />
              <Label for="location">Body</Label>
              {!bodyIsValid && <FormFeedback>{bodyFeedback}</FormFeedback>}
            </FormGroup>
            <Card className="mb-3">
              {/* TODO: If you've completed every other TODO, make this match above */}
              <Label for="image" className="ms-3 mt-1">
                Image
              </Label>
              {/* TODO: Add onClick expand modal or summat */}
              <img src={imageUrl} alt={`${title} banner`} />
              {/* alt={imageAltText} /> */}
              <Input
                id="image"
                name="image"
                type="file"
                // value={image}
                onInput={(e) => addImage(e.target.files[0])}
              />
              {/*
              // <FormGroup floating className="mb-0"> 
              <div className="form-floating">
                <Input
                  id="imageAltText"
                  name="imageAltText"
                  value={imageAltText}
                  placeholder="Alt text"
                  onInput={(e) => setImageAltText(e.target.value)}
                  // invalid={imageAltTextIsValid === false}
                />
                <Label for="imageAltText">Alt text</Label>
              </div>
              // </FormGroup> 
              */}
            </Card>
          </>
        )}
        {previewing && (
          <>
            <h2 className="text-center">{title}</h2>
            <p className="text-end">
              Posted at{" "}
              {new Date(date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              on {new Date(date).toLocaleDateString()}
            </p>
            {imageUrl && (
              <Row className="mb-5">
                <img
                  // className="BlogPostImage"
                  src={imageUrl}
                  alt={`${title} banner`}
                  // alt={imageAltText}
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
              {body}
            </ReactMarkdown>
          </>
        )}
        <Row>
          <Col>
            <FormGroup>
              <Button
                id="cancel"
                name="cancel"
                color="secondary"
                size="lg"
                block
                onClick={() => onClose()}
              >
                Cancel
              </Button>
            </FormGroup>
          </Col>
          <Col>
            {/* TODO: Grey out update button until changes have been made */}
            <FormGroup>
              <Button id="submit" name="submit" color="primary" size="lg" block>
                {post.title && <>Update post</>}
                {!post.title && <>Create post</>}
              </Button>
            </FormGroup>
          </Col>
        </Row>
        {post.title && (
          <Row>
            <Col />
            <Col>
              <FormGroup>
                <Button
                  id="delete"
                  name="delete"
                  color="danger"
                  size="lg"
                  block
                  onClick={() => toggleDeleteModal()}
                >
                  Delete post
                </Button>
                <Modal
                  isOpen={deleteModalOpen}
                  toggle={() => toggleDeleteModal()}
                >
                  <ModalHeader toggle={() => toggleDeleteModal()}>
                    Are you sure you want to delete {post.title}?
                  </ModalHeader>
                  <ModalFooter>
                    <Button color="primary" onClick={() => deletePost()}>
                      Delete
                    </Button>
                    <Button
                      color="secondary"
                      onClick={() => toggleDeleteModal()}
                    >
                      Cancel
                    </Button>
                  </ModalFooter>
                </Modal>
              </FormGroup>
            </Col>
          </Row>
        )}
      </Form>
    </MainContent>
  );
}
BlogForm.propTypes = {
  post: propTypes.shape({
    id: propTypes.number,
    title: propTypes.string,
    body: propTypes.string,
    image: propTypes.string,
    date: propTypes.instanceOf(Date),
    events: propTypes.arrayOf(propTypes.string),
  }),
  onClose: propTypes.func.isRequired,
};
BlogForm.defaultProps = {
  post: {
    id: -1,
    title: "",
    body: "",
    image: "",
    date: new Date(),
    events: [],
  },
};
