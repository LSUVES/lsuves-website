import React, { useEffect, useState } from "react";

import axios from "axios";
import {
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Row,
  Table,
} from "reactstrap";

import MainContent from "../../components/layout/MainContent";

export default function VanBookings() {
  const [vanBookingList, setVanBookingList] = useState([]);

  function getVanBookings() {
    // Get a list of all van bookings for the current LAN from the backend.
    axios
      .get("/api/lan-van-booking/?current", { withCredentials: true })
      .then((res) => {
        setVanBookingList(res.data);
      })
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    getVanBookings();
  }, []);

  return (
    <MainContent>
      <Row className="justify-content-center">
        <Col sm="8">
          <h3>Van bookings:</h3>
          <ul className="p-0">
            {vanBookingList.map((item) => (
              // TODO: Display each booking as a row in a table and allow user to download as CSV
              <Card className="my-2" key={item.id}>
                <CardBody>
                  <CardTitle
                    title={item.requester.user.username}
                    className="d-flex mb-0"
                  >
                    <h5 className="my-auto flex-grow-1">
                      {item.requester.user.first_name} &ldquo;
                      {item.requester.user.username}&rdquo;{" "}
                      {item.requester.user.last_name}
                    </h5>
                  </CardTitle>
                  <CardText>
                    <Table borderless>
                      <tbody>
                        <tr>
                          <th style={{ width: "25%" }}>
                            <b>Contact phone number:</b>
                          </th>
                          <td>{item.contact_phone_number}</td>
                        </tr>
                        <tr>
                          <th>
                            <b>Address:</b>
                          </th>
                          <td>{item.address}</td>
                        </tr>
                        <tr>
                          <th>
                            <b>Postcode:</b>
                          </th>
                          <td>{item.postcode}</td>
                        </tr>
                        <tr>
                          <th>
                            <b>Requires collection:</b>
                          </th>
                          <td>{item.collection_required ? "Yes" : "No"}</td>
                        </tr>
                        <tr>
                          <th>
                            <b>Requires drop-off:</b>
                          </th>
                          <td>{item.dropoff_required ? "Yes" : "No"}</td>
                        </tr>
                        <tr>
                          <th>
                            <b>Availability:</b>
                          </th>
                          <td>{item.availability}</td>
                        </tr>
                      </tbody>
                    </Table>
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
