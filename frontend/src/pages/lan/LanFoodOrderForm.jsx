import React, { useContext, useEffect, useState } from "react";

import axios from "axios";
import {
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
} from "reactstrap";

import MainContent from "../../components/layout/MainContent";
import CsrfTokenContext from "../../contexts/CsrfTokenContext";

export default function LanFoodOrderForm() {
  const [shops, setShops] = useState([]);
  const [shopId, setShopId] = useState(-1);
  const [menuItems, setMenuItems] = useState([]);
  const [userOrder, setUserOrder] = useState([]);

  function getFoodShops() {
    // Get a list of all food shops from the backend.
    axios
      .get("/api/lan-food-order-shop/", { withCredentials: true })
      .then((res) => {
        setShops(res.data);
      })
      .catch((err) => console.log(err));
  }

  function getFoodItems() {
    // Get a list of all menu items from the backend.
    axios
      .get("/api/lan-food-order-menu-item/", { withCredentials: true })
      .then((res) => {
        setMenuItems(res.data);
      })
      .catch((err) => console.log(err));
  }

  function getUserOrder() {
    // Get a list of all menu items ordered by the user this LAN from the backend.
    // FIXME: Add ?current
    axios
      .get("/api/lan-food-order/my_food_orders/", {
        withCredentials: true,
      })
      .then((res) => setUserOrder(res.data))
      .catch((err) => {
        setUserOrder([]);
        console.log(err);
      });
  }

  useEffect(() => {
    getFoodShops();
    getFoodItems();
    getUserOrder();
  }, []);

  function setFoodShop(id = -1) {
    setShopId(id);
    // if (id === -1) {
    //   setIsOpen(false);
    //   setShopName("");
    //   setOrderBy("");
    //   setArrivesAt("");
    // } else {
    //   const shop = shops.find((item) => item.id === id);
    //   setIsOpen(shop.is_open);
    //   setShopName(shop.name);
    //   setOrderBy(shop.order_by);
    //   setArrivesAt(shop.arrives_at);
    // }
  }

  const csrfTokenCookie = useContext(CsrfTokenContext);

  function orderItem(optionId) {
    // Send item order request for user to backend.
    axios
      .post(
        "/api/lan-food-order/",
        { option: optionId },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      .then(() => getUserOrder())
      .catch((err) => console.log(err));
  }

  function removeItem(itemId) {
    // Delete the user's ordered item from backend.
    axios
      .delete(`/api/lan-food-order/${itemId}/`, {
        withCredentials: true,
        headers: { "X-CSRFToken": csrfTokenCookie },
      })
      .then(() => getUserOrder())
      .catch((err) => console.log(err));
  }

  return (
    <MainContent>
      <h2 className="text-center">Food order form</h2>
      {userOrder.length > 0 && (
        <>
          <h5>Your order:</h5>
          {userOrder.map((item) => (
            <Card className="my-2" key={item.id}>
              <CardBody>
                <CardTitle title={item.option.name} className="mb-0">
                  <Row>
                    <Col>
                      <h5>{item.option.name}</h5>
                    </Col>
                    <Col>
                      <h5 className="text-end">
                        £{item.option.price} {item.paid ? "(Paid)" : undefined}{" "}
                      </h5>
                    </Col>
                  </Row>
                </CardTitle>
                <CardText>{item.option.info}</CardText>
                {!item.paid && (
                  <Button
                    id="removeItem"
                    name="removeItem"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove item from order
                  </Button>
                )}
              </CardBody>
            </Card>
          ))}
          <p className="text-end fs-5">
            <b>Total to pay:</b> £
            {userOrder
              .filter((order) => !order.paid)
              .map((order) => order.option.price)
              .reduce((prev, next) => prev + parseFloat(next), 0.0)
              .toFixed(2)}
          </p>
          <hr />
        </>
      )}
      <h5>Menus:</h5>
      <Nav tabs className="mb-3">
        {shops.map((item) => (
          <NavItem key={item.id}>
            <NavLink
              onClick={() => setFoodShop(item.id)}
              href="#"
              active={shopId === item.id}
              // TODO: Give user a reason for why the shop is disabled or just don't display it
              disabled={
                !item.is_open ||
                menuItems.filter((menuItem) => menuItem.shop === item.id)
                  .length === 0
              }
            >
              {item.name}
            </NavLink>
          </NavItem>
        ))}
      </Nav>
      {shopId !== -1 && (
        <>
          <Row className="text-center">
            <Col>
              <p>
                <b>Order by:</b>{" "}
                {shops.find((item) => item.id === shopId).order_by}
              </p>
            </Col>
            <Col>
              <p>
                <b>Arrives at:</b>{" "}
                {shops.find((item) => item.id === shopId).arrives_at}
              </p>
            </Col>
          </Row>
          {/* TODO: Consider using Row and Col to restrict Card width so price isn't so far away */}
          {menuItems
            .filter((item) => item.shop === shopId)
            .map((item) => (
              <Card className="my-2" key={item.id}>
                <CardBody>
                  <CardTitle title={item.name} className="mb-0">
                    <Row>
                      <Col>
                        <h5>{item.name}</h5>
                      </Col>
                      <Col>
                        <h5 className="text-end">£{item.price}</h5>
                      </Col>
                    </Row>
                  </CardTitle>
                  <CardText>{item.info}</CardText>
                  <Button
                    id="orderItem"
                    name="orderItem"
                    color="primary"
                    onClick={() => orderItem(item.id)}
                  >
                    Order
                  </Button>
                </CardBody>
              </Card>
            ))}
        </>
      )}
      {/* TODO: Display toast in the top/bottom right and autofade 
                        (not currently built-in to Reactstrap) */}
      {/* <Toast isOpen={showShopUpdateToast}>
                <ToastHeader>Item added to order</ToastHeader>
              </Toast> */}
    </MainContent>
  );
}
