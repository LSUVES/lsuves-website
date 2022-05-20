import React, { useContext, useEffect, useState } from "react";

import axios from "axios";
import {
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Row,
} from "reactstrap";

import MainContent from "../../components/layout/MainContent";
import CsrfTokenContext from "../../contexts/CsrfTokenContext";

export default function FoodOrders() {
  const [foodOrderList, setFoodOrderList] = useState([]);

  function getFoodOrders() {
    // Get a list of all food orders from the backend.
    axios
      .get("/api/lan-food-order/?current/", { withCredentials: true })
      .then((res) => {
        console.log(res.data);
        setFoodOrderList(res.data);
      })
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    getFoodOrders();
  }, []);

  const csrfTokenCookie = useContext(CsrfTokenContext);

  function markPaid(orderId) {
    axios
      .patch(
        `/api/lan-food-order/${orderId}/`,
        { paid: true },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      .then(() => getFoodOrders())
      .catch((err) => console.log(err));
  }

  return (
    <MainContent>
      <Row className="justify-content-center">
        <Col sm="8">
          <div className="d-flex justify-content-between">
            <h3>Food orders:</h3>
          </div>
          {/* TODO: Filter by user, unpaid/paid where paid orders are compressed together */}
          <ul className="p-0">
            {foodOrderList.map((item) => (
              <Card className="my-2" key={item.id}>
                <CardBody>
                  <CardTitle title={item.option.name} className="d-flex mb-0">
                    <h5 className="my-auto flex-grow-1">{item.option.name}</h5>
                  </CardTitle>
                  <CardText>
                    <b>Orderer:</b> {item.orderer.user.first_name} &ldquo;
                    {item.orderer.user.username}&rdquo;{" "}
                    {item.orderer.user.last_name} <br />
                    <b>Paid:</b>{" "}
                    {item.paid ? (
                      "Yes"
                    ) : (
                      <>
                        No{" "}
                        <Button
                          id="markPaid"
                          name="markPaid"
                          onClick={() => markPaid(item.id)}
                        >
                          Mark paid
                        </Button>
                      </>
                    )}
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
