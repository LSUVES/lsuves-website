import React, { useEffect, useState } from "react";

import axios from "axios";
import { Card, CardBody, CardText, CardTitle, Col, Row } from "reactstrap";

import MainContent from "../../components/layout/MainContent";

export default function VanBookings() {
  const [vanBookingList, setVanBookingList] = useState([]);

  function getVanBookings() {
    // Get a list of all van bookings from the backend.
    axios
      .get("/api/lan-van-booking/", { withCredentials: true })
      .then((res) => {
        console.log(res.data);
        setVanBookingList(res.data);
      })
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    getVanBookings();
  }, [vanBookingList.length]);

  return (
    <MainContent>
      <Row className="justify-content-center">
        <Col sm="8">
          <div className="d-flex justify-content-between">
            <h3>Van bookings:</h3>
          </div>
          <ul className="p-0">
            {vanBookingList.map((item) => (
              <Card className="my-2" key={item.id}>
                <CardBody>
                  <CardTitle title={item.requester} className="d-flex mb-0">
                    {/* TODO: Serialize username */}
                    <h5 className="my-auto flex-grow-1">{item.requester}</h5>
                  </CardTitle>
                  <CardText>
                    {/* TODO: Use unbulleted list instead? */}
                    <b>Contact phone number:</b> {item.contact_phone_number}
                    <br />
                    <b>Address:</b> {item.address}
                    <br />
                    <b>Postcode:</b> {item.postcode}
                    <br />
                    <b>Requires collection:</b>{" "}
                    {item.collection_required ? "Yes" : "No"}
                    <br />
                    <b>Requires drop-off:</b>{" "}
                    {item.dropoff_required ? "Yes" : "No"}
                    <br />
                    <b>Availability:</b> {item.availability}
                  </CardText>
                </CardBody>
              </Card>
            ))}
          </ul>
        </Col>
      </Row>
    </MainContent>
  );
}
