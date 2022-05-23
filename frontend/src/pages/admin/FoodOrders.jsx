import React, { useContext, useEffect, useState } from "react";

import axios from "axios";
import {
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";

import MainContent from "../../components/layout/MainContent";
import CsrfTokenContext from "../../contexts/CsrfTokenContext";

// TODO: Add refresh button.
export default function FoodOrders() {
  const [foodShops, setFoodShops] = useState([]);
  const [filterShop, setFilterShop] = useState(-1);
  const [foodOrderList, setFoodOrderList] = useState([]);
  const [shopGroupedPaidFoodOrders, setShopGroupedPaidFoodOrders] = useState(
    {}
  );
  const [shopFilteredPaidFoodOrderIds, setShopFilteredPaidFoodOrderIds] =
    useState({});
  const [totalCost, setTotalCost] = useState(0.0);
  // const [paidFoodOrderShopsList, setPaidFoodOrderShopsList] = useState([]);
  const [filterOrderType, setFilterOrderType] = useState("unpaid");
  const [filterUser, setFilterUser] = useState("");

  // TODO: Might not be necessary if shop name is taken from food order
  function getFoodShops() {
    // Get a list of all food shops from the backend.
    axios
      .get("/api/lan-food-order-shop/", { withCredentials: true })
      .then((res) => {
        setFoodShops(res.data);
      })
      .catch((err) => console.log(err));
  }

  function getFoodOrders() {
    // Get a list of all food orders for the current LAN from the backend.
    axios
      .get("/api/lan-food-order/?current", { withCredentials: true })
      .then((res) => {
        console.log(res.data);
        setFoodOrderList(res.data);
      })
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    getFoodShops();
    getFoodOrders();
  }, []);

  // If filter for paid orders is selected, set paidFoodOrderList to be an object
  // whose attributes represent lists of paid food orders grouped by item.
  useEffect(() => {
    if (filterOrderType === "paid") {
      const newShopGroupedPaidFoodOrders = foodOrderList
        .filter((item) => item.paid)
        .reduce((groupedPaidOrders, paidOrder) => {
          const group = paidOrder.option.id;
          // Disabling this ESLint rule is probably justified here: https://stackoverflow.com/questions/41625399/how-to-handle-eslint-no-param-reassign-rule-in-array-prototype-reduce-function
          // TODO: To avoid this, consider just looping through the array, which might even be better for performance.
          // eslint-disable-next-line no-param-reassign
          groupedPaidOrders[group] = groupedPaidOrders[group] || [];
          groupedPaidOrders[group].push(paidOrder);
          return groupedPaidOrders;
        }, {});
      setShopGroupedPaidFoodOrders(newShopGroupedPaidFoodOrders);
      // TODO: Consider reducing newPaidFoodOrderList to a shopGroupedPaidOrders Object
      //       where attributes represent all the shops ordered from and so can be mapped
      //       to options of the select input like in EventForm.jsx.
    }
  }, [filterOrderType]);

  useEffect(() => {
    const newShopFilteredPaidFoodOrderIds = Object.keys(
      shopGroupedPaidFoodOrders
    ).filter((optionId) => {
      console.log(shopGroupedPaidFoodOrders[optionId][0].option.shop);
      return [-1, shopGroupedPaidFoodOrders[optionId][0].option.shop].includes(
        parseInt(filterShop, 10)
      );
    });
    // TODO: Consider just simply using a loop for this
    setTotalCost(
      newShopFilteredPaidFoodOrderIds.reduce(
        (prevTotalCost, optionId) =>
          prevTotalCost +
          shopGroupedPaidFoodOrders[optionId].length *
            shopGroupedPaidFoodOrders[optionId][0].option.price,
        0.0
      )
    );
    setShopFilteredPaidFoodOrderIds(newShopFilteredPaidFoodOrderIds);
  }, [shopGroupedPaidFoodOrders, filterShop]);

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
          <h3>Food orders:</h3>
          Filter by
          <Row>
            <Col>
              {/* TODO: add check prop to FormGroup and Label */}
              <FormGroup>
                <Input
                  id="unpaid"
                  name="filterOrderType"
                  type="radio"
                  checked={filterOrderType === "unpaid"}
                  onChange={() => setFilterOrderType("unpaid")}
                />{" "}
                <Label for="unpaid">Show only unpaid orders</Label> <br />
                <Input
                  id="paid"
                  name="filterOrderType"
                  type="radio"
                  checked={filterOrderType === "paid"}
                  onChange={() => setFilterOrderType("paid")}
                />{" "}
                <Label for="paid">Show only paid orders</Label>
              </FormGroup>
            </Col>
            <Col>
              {filterOrderType === "unpaid" && (
                <FormGroup floating>
                  <Input
                    id="filterUser"
                    name="filterUser"
                    value={filterUser}
                    placeholder="User"
                    onInput={(e) => setFilterUser(e.target.value)}
                  />
                  <Label for="filterUser">User</Label>
                </FormGroup>
              )}
              {filterOrderType === "paid" && (
                <FormGroup floating>
                  <Input
                    id="filterShop"
                    name="filterShop"
                    type="select"
                    value={filterShop}
                    placeholder="Shop"
                    onInput={(e) => setFilterShop(e.target.value)}
                  >
                    <option key={-1} value={-1}>
                      All shops
                    </option>
                    {foodShops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}
                      </option>
                    ))}
                  </Input>
                  <Label for="filterShop">Shop</Label>
                </FormGroup>
              )}
            </Col>
          </Row>
          <ul className="p-0">
            {filterOrderType === "unpaid" &&
              foodOrderList
                .filter(
                  (item) =>
                    !item.paid &&
                    (item.orderer.user.username
                      .toLowerCase()
                      .startsWith(filterUser.toLowerCase()) ||
                      item.orderer.user.first_name
                        .concat(" ", item.orderer.user.last_name)
                        .toLowerCase()
                        .startsWith(filterUser.toLowerCase()))
                )
                .map((item) => (
                  <Card className="my-2" key={item.id}>
                    <CardBody>
                      <CardTitle
                        title={item.option.name}
                        className="d-flex mb-0"
                      >
                        <h5 className="my-auto flex-grow-1">
                          {item.option.name}
                        </h5>
                      </CardTitle>
                      <CardText>
                        {/* TODO: Add this */}
                        {/* <b>Shop:</b> {item.option.shop.name} <br /> */}
                        <b>Price:</b> £{item.option.price} <br />
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
            {filterOrderType === "paid" && (
              <>
                {shopFilteredPaidFoodOrderIds.map((item) => {
                  const test = shopGroupedPaidFoodOrders[item][0];
                  return (
                    <Card className="my-2" key={item}>
                      <CardBody>
                        <CardTitle
                          title={test.option.name}
                          className="d-flex mb-0"
                        >
                          <h5 className="my-auto d-flex flex-grow-1 justify-content-between">
                            <span>
                              {shopGroupedPaidFoodOrders[item].length}x{" "}
                              {test.option.name}{" "}
                            </span>
                            <span>
                              <small>
                                ({shopGroupedPaidFoodOrders[item].length} x £
                                {test.option.price})
                              </small>{" "}
                              £
                              {(
                                shopGroupedPaidFoodOrders[item].length *
                                test.option.price
                              ).toFixed(2)}
                            </span>
                          </h5>
                        </CardTitle>
                        {/* TODO: Add this */}
                        {/* <b>Shop:</b> {item.option.shop.name} <br /> */}
                        {/* TODO: List orderers in Collapse */}
                        {/* <b>Orderer:</b> {item.orderer.user.first_name} &ldquo; */}
                        {/* {item.orderer.user.username}&rdquo;{" "} */}
                        {/* {item.orderer.user.last_name} <br /> */}
                      </CardBody>
                    </Card>
                  );
                })}
                <p className="text-end fs-5">
                  <b>Total cost:</b> £{totalCost}
                </p>
              </>
            )}
          </ul>
        </Col>
      </Row>
    </MainContent>
  );
}
