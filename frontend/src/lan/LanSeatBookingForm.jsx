import React, { useState } from "react";

import axios from "axios";
import {
  Button,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";

export default function LanSeatBookingForm() {
  const [groupName, setGroupName] = useState("");
  const [seatingPreference, setSeatingPreference] = useState("");

  function bookSeat() {
    // FIXME: add CSRF param
    axios
      .post("/api/lan-seat-booking/", {}, { withCredentials: true })
      .then(() => console.log("YIPPEE"))
      .catch((err) => console.log(err));
  }
  return (
    <main>
      <Container>
        <Row>
          <Col>
            <h2>Seat Booking Form</h2>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                bookSeat();
              }}
            >
              <FormGroup>
                <Label for="group-name">Group name</Label>
                <Input
                  id="group-name"
                  name="group-name"
                  value={groupName}
                  onInput={(e) => setGroupName(e.target.value)}
                  // invalid={usernameIsValid === false}
                  // required
                />
                {/* {!usernameIsValid && (
                  <FormFeedback>
                    Username must be not be blank and contain no more than{" "}
                    {MAX_USERNAME_LENGTH} characters
                  </FormFeedback>
                )} */}
              </FormGroup>
              <FormGroup>
                <Label for="preference">Seating preference</Label>
                <Input
                  id="preference"
                  name="preference"
                  type="textarea"
                  value={seatingPreference}
                  onInput={(e) => setSeatingPreference(e.target.value)}
                  // invalid={emailIsValid === false}
                  // required
                />
                {/* {!emailIsValid && (
                  <FormFeedback>Please enter a valid email.</FormFeedback>
                )} */}
              </FormGroup>
              <FormGroup>
                <Button id="submit" name="submit">
                  Book seat
                </Button>
              </FormGroup>
            </Form>
          </Col>
        </Row>
      </Container>
    </main>
  );
}
