import React, { useState } from "react";

import axios from "axios";
import { Button, Col, Form, FormGroup, Input, Label, Row } from "reactstrap";

import MainContent from "../../components/layout/MainContent";

export default function LanVanBookingForm() {
  const [contactPhoneNumber, setContactPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [collectionRequired, setCollectionRequired] = useState(null);
  const [dropoffRequired, setDropoffRequired] = useState(null);
  const [availability, setAvailability] = useState("");

  function bookVan() {
    // FIXME: add CSRF param
    axios
      .post("/api/lan-van-booking/", {}, { withCredentials: true })
      .then(() => console.log("YIPPEE"))
      .catch((err) => console.log(err));
  }

  return (
    <MainContent>
      <Row>
        <Col>
          <h2>Van Booking Form</h2>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              bookVan();
            }}
          >
            <FormGroup>
              <Label for="contact-phone-number">Contact phone number</Label>
              <Input
                id="contact-phone-number"
                name="contact-phone-number"
                value={contactPhoneNumber}
                onInput={(e) => setContactPhoneNumber(e.target.value)}
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
              <Label for="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={address}
                onInput={(e) => setAddress(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label for="postcode">Postcode</Label>
              <Input
                id="postcode"
                name="postcode"
                value={postcode}
                onInput={(e) => setPostcode(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Input
                id="collection-required"
                type="checkbox"
                value={collectionRequired}
                onInput={(e) => setCollectionRequired(e.target.value)}
              />
              <Label for="collection-required">Require collection</Label>
            </FormGroup>
            <FormGroup>
              <Input
                id="dropoff-required"
                type="checkbox"
                value={dropoffRequired}
                onInput={(e) => setDropoffRequired(e.target.value)}
              />
              <Label for="dropoff-required">Require drop-off</Label>
            </FormGroup>
            <FormGroup>
              <Label for="availability">Availability</Label>
              <Input
                id="availability"
                name="availability"
                type="textarea"
                value={availability}
                onInput={(e) => setAvailability(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Button id="submit" name="submit">
                Book seat
              </Button>
            </FormGroup>
          </Form>
        </Col>
      </Row>
    </MainContent>
  );
}
