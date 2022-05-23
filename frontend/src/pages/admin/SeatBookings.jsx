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

export default function SeatBookings() {
  const [seatBookingList, setSeatBookingList] = useState([]);

  function getSeatBookings() {
    // Get a list of all seat bookings for the current LAN from the backend.
    axios
      .get("/api/lan-seat-booking/?current", { withCredentials: true })
      .then((res) => {
        setSeatBookingList(res.data);
      })
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    getSeatBookings();
  }, []);

  return (
    <MainContent>
      <Row className="justify-content-center">
        <Col sm="8">
          <h3>Seat bookings:</h3>
          <ul className="p-0">
            {seatBookingList.map((item) => (
              <Card className="my-2" key={item.id}>
                <CardBody>
                  <CardTitle title={item.name} className="d-flex mb-0">
                    <h5 className="my-auto flex-grow-1">{item.name}</h5>
                  </CardTitle>
                  <CardText>
                    <Table borderless>
                      <tbody>
                        <tr>
                          {/* TODO: Is there a better way to do this? */}
                          <th style={{ width: "25%" }}>
                            <b>Group owner:</b>
                          </th>
                          <td>{item.owner.user.username}</td>
                        </tr>
                        <tr>
                          <th>
                            <b>Members:</b>
                          </th>
                          <td>
                            {item.members.map((member) => (
                              <>
                                {member.user.first_name} &ldquo;
                                {member.user.username}
                                &rdquo; {member.user.last_name}
                                <br />
                              </>
                            ))}
                          </td>
                        </tr>
                        <tr>
                          <th>
                            <b>Seating preference:</b>
                          </th>
                          <td>{item.preference}</td>
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
