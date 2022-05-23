import React, { useContext, useEffect, useState } from "react";

import axios from "axios";
import { Button, Col, Form, FormGroup, Input, Label, Row } from "reactstrap";

import MainContent from "../../components/layout/MainContent";
import CsrfTokenContext from "../../contexts/CsrfTokenContext";

export default function LanVanBookingForm() {
  const [bookingId, setBookingId] = useState(-1);
  const [contactPhoneNumber, setContactPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [collectionRequired, setCollectionRequired] = useState(false);
  const [dropoffRequired, setDropoffRequired] = useState(false);
  const [availability, setAvailability] = useState("");

  const csrfTokenCookie = useContext(CsrfTokenContext);

  useEffect(() => {
    axios
      .get("/api/lan-van-booking/my_van_booking/", {
        withCredentials: true,
        headers: { "X-CSRFToken": csrfTokenCookie },
      })
      .then((res) => {
        setBookingId(res.data.id);
        setContactPhoneNumber(res.data.contact_phone_number);
        setAddress(res.data.address);
        setPostcode(res.data.postcode);
        setCollectionRequired(res.data.collection_required);
        setDropoffRequired(res.data.dropoff_required);
        setAvailability(res.data.availability);
      })
      .catch((err) => console.log(err));
  }, []);

  function createBooking() {
    axios
      .post(
        "/api/lan-van-booking/",
        {
          contact_phone_number: contactPhoneNumber,
          address,
          postcode,
          collection_required: collectionRequired,
          dropoff_required: dropoffRequired,
          availability,
        },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      .then((res) => setBookingId(res.data.id))
      .catch((err) => console.log(err));
  }

  function updateBooking() {
    axios
      .put(
        `/api/lan-van-booking/${bookingId}/`,
        {
          contact_phone_number: contactPhoneNumber,
          address,
          postcode,
          collection_required: collectionRequired,
          dropoff_required: dropoffRequired,
          availability,
        },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      ) // TODO: Show success notification with fade out.
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
  }

  function deleteBooking() {
    axios
      .delete(`/api/lan-van-booking/${bookingId}/`, {
        withCredentials: true,
        headers: { "X-CSRFToken": csrfTokenCookie },
      })
      .then(() => setBookingId(-1))
      .catch((err) => console.log(err));
  }

  return (
    <MainContent>
      <Row className="justify-content-center">
        <Col sm={6}>
          <h2>Van booking form</h2>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              if (bookingId === -1) {
                createBooking();
              } else {
                updateBooking();
              }
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
                checked={collectionRequired}
                onChange={(e) => setCollectionRequired(e.target.checked)}
              />{" "}
              <Label for="collection-required">Require collection</Label>
            </FormGroup>
            <FormGroup>
              <Input
                id="dropoff-required"
                type="checkbox"
                checked={dropoffRequired}
                onChange={(e) => setDropoffRequired(e.target.checked)}
              />{" "}
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
            {bookingId === -1 && (
              <FormGroup>
                <Button id="submit" name="submit" color="primary">
                  Book LAN van
                </Button>
              </FormGroup>
            )}
            {!(bookingId === -1) && (
              <FormGroup row>
                <Col>
                  <Button
                    id="deleteBooking"
                    name="deleteBooking"
                    color="danger"
                    onClick={() => deleteBooking()}
                  >
                    Delete LAN van booking
                  </Button>
                </Col>
                <Col>
                  <Button id="submit" name="submit" color="primary">
                    Update LAN van booking
                  </Button>
                </Col>
              </FormGroup>
            )}
          </Form>
        </Col>
      </Row>
    </MainContent>
  );
}
