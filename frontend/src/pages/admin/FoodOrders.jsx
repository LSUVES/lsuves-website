import React, { useEffect, useState } from "react";

import axios from "axios";
import { Card, CardBody, CardText, CardTitle, Col, Row } from "reactstrap";

import MainContent from "../../components/layout/MainContent";

export default function FoodOrders() {
  const [foodOrderList, setFoodOrderList] = useState([]);

  function getFoodOrders() {
    // Get a list of all food orders from the backend.
    axios
      .get("/api/lan-seat-booking/", { withCredentials: true })
      .then((res) => {
        console.log(res.data);
        setFoodOrderList(res.data);
      })
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    getFoodOrders();
  }, [foodOrderList.length]);

  return (
    <MainContent>
      <Row className="justify-content-center">
        <Col sm="8">
          <div className="d-flex justify-content-between">
            <h3>Food orders:</h3>
          </div>
          <ul className="p-0">
            {foodOrderList.map((item) => (
              <Card className="my-2" key={item.id}>
                <CardBody>
                  <CardTitle title={item.name} className="d-flex mb-0">
                    <h5 className="my-auto flex-grow-1">{item.name}</h5>
                  </CardTitle>
                  <CardText>
                    <b>Group owner:</b> {item.owner.user} <br />
                    <b>Seating preference:</b> {item.preference}
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
