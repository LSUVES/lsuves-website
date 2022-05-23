import React, { useContext, useEffect, useState } from "react";

import axios from "axios";
import {
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  //   Toast,
  //   ToastHeader,
} from "reactstrap";

import MainContent from "../../components/layout/MainContent";
import CsrfTokenContext from "../../contexts/CsrfTokenContext";
import useUpdateEffect from "../../utils/useUpdateEffect/useUpdateEffect";
import {
  checkItemName,
  checkItemInfo,
  checkShopName,
  checkOrderBy,
  checkArrivesAt,
} from "../../utils/validation/food-options";

export default function FoodOptions() {
  const [shops, setShops] = useState([]);
  const [shopId, setShopId] = useState(-2);
  const [isOpen, setIsOpen] = useState(false);
  const [shopName, setShopName] = useState("");
  const [shopNameIsValid, setShopNameIsValid] = useState(null);
  const [shopNameFeedback, setShopNameFeedback] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [orderByIsValid, setOrderByIsValid] = useState(null);
  const [orderByFeedback, setOrderByFeedback] = useState("");
  const [arrivesAt, setArrivesAt] = useState("");
  const [arrivesAtIsValid, setArrivesAtIsValid] = useState(null);
  const [arrivesAtFeedback, setArrivesAtFeedback] = useState("");

  const [menuItems, setMenuItems] = useState([]);
  const [menuItemName, setMenuItemName] = useState("");
  const [menuItemNameIsValid, setMenuItemNameIsValid] = useState(null);
  const [menuItemNameFeedback, setMenuItemNameFeedback] = useState("");
  const [menuItemInfo, setMenuItemInfo] = useState("");
  const [menuItemInfoIsValid, setMenuItemInfoIsValid] = useState(null);
  const [menuItemInfoFeedback, setMenuItemInfoFeedback] = useState("");
  const [menuItemPrice, setMenuItemPrice] = useState(0.0);
  //   const [menuItemPriceIsValid, setMenuItemPriceIsValid] = useState(null);
  //   const [menuItemPriceFeedback, setMenuItemPriceFeedback] = useState("");

  //   const [showShopUpdateToast, setShowShopUpdateToast] = useState(false);

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

  useEffect(() => {
    getFoodShops();
    getFoodItems();
  }, []);

  function setFoodShop(id = -1) {
    setShopId(id);
    if (id === -1) {
      setIsOpen(false);
      setShopName("");
      setOrderBy("");
      setArrivesAt("");
    } else {
      // FIXME: Doesn't this error if id = -2 (when a shop is deleted)?
      const shop = shops.find((item) => item.id === id);
      setIsOpen(shop.is_open);
      setShopName(shop.name);
      setOrderBy(shop.order_by);
      setArrivesAt(shop.arrives_at);
    }
    // FIXME: Don't run this until after the associated useUpdateEffects have run
    setShopNameIsValid(null);
    setShopNameFeedback("");
    setOrderByIsValid(null);
    setOrderByFeedback("");
    setArrivesAtIsValid(null);
    setArrivesAtFeedback("");
  }

  // Ensure fields are validated when values are changed.
  // TODO: Perform validation for modal fields as well.
  useUpdateEffect(
    checkShopName,
    [shopName],
    [shopName, setShopNameIsValid, setShopNameFeedback]
  );
  useUpdateEffect(
    checkOrderBy,
    [orderBy],
    [orderBy, setOrderByIsValid, setOrderByFeedback]
  );
  useUpdateEffect(
    checkArrivesAt,
    [arrivesAt],
    [arrivesAt, setArrivesAtIsValid, setArrivesAtFeedback]
  );

  function checkAllShopFields() {
    let isValid = checkShopName(
      shopName,
      setShopNameIsValid,
      setShopNameFeedback
    );
    isValid =
      checkOrderBy(orderBy, setOrderByIsValid, setOrderByFeedback) && isValid;
    isValid =
      checkArrivesAt(arrivesAt, setArrivesAtIsValid, setArrivesAtFeedback) &&
      isValid;
    return isValid;
  }

  const csrfTokenCookie = useContext(CsrfTokenContext);

  function addShop() {
    // If fields aren't valid, don't proceed with sending request
    if (!checkAllShopFields()) {
      return;
    }

    axios
      .post(
        "/api/lan-food-order-shop/",
        {
          name: shopName,
          order_by: orderBy,
          arrives_at: arrivesAt,
          is_open: isOpen,
        },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      .then((res) => {
        getFoodShops();
        setShopId(res.data.id);
      })
      .catch((err) => console.log(err));
  }

  function updateShop() {
    // If fields aren't valid, don't proceed with sending request
    if (!checkAllShopFields()) {
      return;
    }

    axios
      .put(
        `/api/lan-food-order-shop/${shopId}/`,
        {
          name: shopName,
          order_by: orderBy,
          arrives_at: arrivesAt,
          is_open: isOpen,
        },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      .then(() => {
        // TODO: Show this as an autohide alert/toast
        console.log("Updated shop information");
        // setShowShopUpdateToast(true);
      })
      .catch((err) => console.log(err));
  }

  const [showingDeleteShopModal, setShowingDeleteShopModal] = useState(false);
  function toggleDeleteShopModal() {
    setShowingDeleteShopModal(!showingDeleteShopModal);
  }

  function deleteShop() {
    axios
      .delete(`/api/lan-food-order-shop/${shopId}/`, {
        withCredentials: true,
        headers: { "X-CSRFToken": csrfTokenCookie },
      })
      .then(() => {
        toggleDeleteShopModal();
        setShopId(-2);
        getFoodShops();
      })
      .catch((err) => console.log(err));
  }

  const [menuItemId, setMenuItemId] = useState(-1);
  const [showingItemModal, setShowingItemModal] = useState(false);
  function toggleItemModal(itemId = -1) {
    setMenuItemId(itemId);
    if (itemId !== -1) {
      const menuItem = menuItems.find((item) => item.id === itemId);
      setMenuItemName(menuItem.name);
      setMenuItemInfo(menuItem.info);
      setMenuItemPrice(menuItem.price);
    } else {
      // TODO: Resetting IsValid and Feedback params only needs to happen
      // when modal is closed, this calls them when creating a new item as well.
      setMenuItemName("");
      setMenuItemNameIsValid(null);
      setMenuItemNameFeedback("");
      setMenuItemInfo("");
      setMenuItemInfoIsValid(null);
      setMenuItemInfoFeedback("");
      setMenuItemPrice(0.0);
    }
    setShowingItemModal(!showingItemModal);
  }

  function checkAllMenuItemFields() {
    let isValid = checkItemName(
      menuItemName,
      setMenuItemNameIsValid,
      setMenuItemNameFeedback
    );
    isValid =
      checkItemInfo(
        menuItemInfo,
        setMenuItemInfoIsValid,
        setMenuItemInfoFeedback
      ) && isValid;
    return isValid;
  }

  function addItem() {
    // TODO: Disable add item button.
    if (!checkAllMenuItemFields()) {
      return;
    }

    axios
      .post(
        "/api/lan-food-order-menu-item/",
        {
          shop: shopId,
          name: menuItemName,
          info: menuItemInfo,
          price: menuItemPrice,
        },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      .then(() => {
        toggleItemModal();
        getFoodItems();
      })
      .catch((err) => console.log(err));
  }

  function updateItem() {
    if (!checkAllMenuItemFields()) {
      return;
    }

    axios
      .put(
        `/api/lan-food-order-menu-item/${menuItemId}/`,
        {
          shop: shopId,
          name: menuItemName,
          info: menuItemInfo,
          price: menuItemPrice,
        },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfTokenCookie },
        }
      )
      .then(() => {
        toggleItemModal();
        getFoodItems();
      })
      .catch((err) => console.log(err));
  }

  function deleteItem(itemId) {
    axios
      .delete(`/api/lan-food-order-menu-item/${itemId}/`, {
        withCredentials: true,
        headers: { "X-CSRFToken": csrfTokenCookie },
      })
      .then(() => {
        getFoodItems();
      })
      .catch((err) => console.log(err));
  }

  return (
    <MainContent>
      <Row className="justify-content-center">
        <Col sm="8">
          <h3>Food options:</h3>
          <Nav tabs className="mb-3">
            {shops.map((item) => (
              <NavItem key={item.id}>
                <NavLink
                  onClick={() => setFoodShop(item.id)}
                  href="#"
                  active={shopId === item.id}
                >
                  {item.name}
                </NavLink>
              </NavItem>
            ))}
            <NavItem>
              {/* TODO: Can this and this alone be a pill? */}
              <NavLink
                onClick={() => setFoodShop()}
                href="#"
                className="text-success"
                active={shopId === -1}
              >
                Add shop
              </NavLink>
            </NavItem>
          </Nav>
          {shopId !== -2 && (
            <>
              <Form>
                <FormGroup>
                  <Input
                    id="isOpen"
                    type="checkbox"
                    checked={isOpen}
                    onChange={(e) => setIsOpen(e.target.checked)}
                  />{" "}
                  <Label for="isOpen">Open for orders</Label>
                </FormGroup>
                <FormGroup>
                  <Label for="shopName">Shop name</Label>
                  <Input
                    id="shopName"
                    name="shopName"
                    value={shopName}
                    onInput={(e) => setShopName(e.target.value)}
                    invalid={shopNameIsValid === false}
                  />
                  {!shopNameIsValid && (
                    <FormFeedback>{shopNameFeedback}</FormFeedback>
                  )}
                </FormGroup>
                <FormGroup>
                  <Label for="orderBy">Order by</Label>
                  <Input
                    id="orderBy"
                    name="orderBy"
                    value={orderBy}
                    onInput={(e) => setOrderBy(e.target.value)}
                    invalid={orderByIsValid === false}
                  />
                  {!orderByIsValid && (
                    <FormFeedback>{orderByFeedback}</FormFeedback>
                  )}
                </FormGroup>
                <FormGroup>
                  <Label for="arrivesAt">Arrives at</Label>
                  <Input
                    id="arrivesAt"
                    name="arrivesAt"
                    value={arrivesAt}
                    onInput={(e) => setArrivesAt(e.target.value)}
                    invalid={arrivesAtIsValid === false}
                  />
                  {!arrivesAtIsValid && (
                    <FormFeedback>{arrivesAtFeedback}</FormFeedback>
                  )}
                </FormGroup>
                {shopId === -1 && (
                  <FormGroup>
                    <Button
                      id="addShop"
                      name="addShop"
                      color="primary"
                      onClick={() => addShop()}
                    >
                      Add shop
                    </Button>
                  </FormGroup>
                )}
                {shopId !== -1 && (
                  <FormGroup row>
                    <Col>
                      <Button
                        id="updateShop"
                        name="updateShop"
                        color="primary"
                        onClick={() => updateShop()}
                      >
                        Update shop information
                      </Button>
                    </Col>
                    <Col className="text-end">
                      <Button
                        id="deleteShop"
                        name="deleteShop"
                        color="danger"
                        onClick={() => toggleDeleteShopModal()}
                      >
                        Delete shop
                      </Button>
                    </Col>
                  </FormGroup>
                )}
              </Form>
              {shopId !== -1 && (
                <>
                  <hr />
                  <h5>Menu</h5>
                  {menuItems
                    .filter((item) => item.shop === shopId)
                    .map((item) => (
                      <Card className="my-2" key={item.id}>
                        <CardBody>
                          <CardTitle title={item.name} className="d-flex mb-0">
                            <h5 className="my-auto flex-grow-1">{item.name}</h5>
                          </CardTitle>
                          <CardText>
                            {/* TODO: Instead of using modals to edit values, add an onClick that replaces
                              text fields with inputs using menuItemName etc. as values set to item's. */}
                            <b>Info:</b> {item.info}
                            <br />
                            <b>Price:</b> {item.price}
                          </CardText>
                          <Row>
                            <Col>
                              <Button
                                id="toggleUpdateItemModal"
                                name="toggleUpdateItemModal"
                                onClick={() => toggleItemModal(item.id)}
                              >
                                Update menu item
                              </Button>
                            </Col>
                            <Col className="text-end">
                              <Button
                                id="deleteItem"
                                name="deleteItem"
                                color="danger"
                                onClick={() => deleteItem(item.id)}
                              >
                                Delete menu item
                              </Button>
                            </Col>
                          </Row>
                        </CardBody>
                      </Card>
                    ))}
                  <Button
                    id="addItem"
                    name="addItem"
                    color="primary"
                    onClick={() => toggleItemModal()}
                  >
                    Add menu item
                  </Button>
                  {showingItemModal && (
                    // TODO: The showingItemModal value is used for conditional
                    //       rendering instead of with the isOpen prop as the use
                    //       of undefined values in a (technically) rendered
                    //       component caused issues with modals in other files.
                    //       Confirm whether this is also the case here.
                    <Modal isOpen toggle={() => toggleItemModal()}>
                      <ModalHeader toggle={() => toggleItemModal()}>
                        {menuItemId === -1 && (
                          <>
                            Adding menu item.
                            {/* TODO: Include to what shop */}
                          </>
                        )}
                        {/* TODO: Replace menu item with original value of menuItemName */}
                        {menuItemId !== -1 && <>Editing menu item.</>}
                      </ModalHeader>
                      <ModalBody>
                        <FormGroup floating>
                          <Input
                            id="menuItemName"
                            name="menuItemName"
                            value={menuItemName}
                            placeholder="Item name"
                            onInput={(e) => setMenuItemName(e.target.value)}
                            invalid={menuItemNameIsValid === false}
                          />
                          <Label for="name">Item name</Label>
                          {!menuItemNameIsValid && (
                            <FormFeedback>{menuItemNameFeedback}</FormFeedback>
                          )}
                        </FormGroup>
                        <FormGroup floating>
                          <Input
                            id="menuItemInfo"
                            name="menuItemInfo"
                            type="textarea"
                            value={menuItemInfo}
                            placeholder="Item info"
                            onInput={(e) => setMenuItemInfo(e.target.value)}
                            invalid={menuItemInfoIsValid === false}
                          />
                          <Label for="name">Item info</Label>
                          {!menuItemInfoIsValid && (
                            <FormFeedback>{menuItemInfoFeedback}</FormFeedback>
                          )}
                        </FormGroup>
                        <FormGroup floating>
                          <Input
                            id="menuItemPrice"
                            name="menuItemPrice"
                            type="number"
                            min={0}
                            step={0.01}
                            value={menuItemPrice}
                            placeholder="Item price"
                            onInput={(e) => setMenuItemPrice(e.target.value)}
                            // invalid={nameIsValid === false}
                          />
                          <Label for="name">Item price</Label>
                          {/* {!nameIsValid && <FormFeedback>{nameFeedback}</FormFeedback> */}
                        </FormGroup>
                      </ModalBody>
                      <ModalFooter>
                        {menuItemId === -1 && (
                          <Button color="primary" onClick={() => addItem()}>
                            Add menu item
                          </Button>
                        )}
                        {menuItemId !== -1 && (
                          <Button color="primary" onClick={() => updateItem()}>
                            Update menu item
                          </Button>
                        )}

                        <Button
                          color="secondary"
                          onClick={() => toggleItemModal()}
                        >
                          Cancel
                        </Button>
                      </ModalFooter>
                    </Modal>
                  )}
                  {showingDeleteShopModal && (
                    <Modal isOpen toggle={() => toggleDeleteShopModal()}>
                      <ModalHeader toggle={() => toggleDeleteShopModal()}>
                        Are you sure you want to delete{" "}
                        {shops.find((item) => item.id === shopId).name}
                      </ModalHeader>
                      <ModalFooter>
                        <Button color="danger" onClick={() => deleteShop()}>
                          Delete shop
                        </Button>
                        <Button
                          color="secondary"
                          onClick={() => toggleDeleteShopModal()}
                        >
                          Cancel
                        </Button>
                      </ModalFooter>
                    </Modal>
                  )}
                </>
              )}
              {/* TODO: Display toast in the top/bottom right and autofade 
                        (not currently built-in to Reactstrap) */}
              {/* <Toast isOpen={showShopUpdateToast}>
                <ToastHeader>Shop information updated</ToastHeader>
              </Toast> */}
            </>
          )}
        </Col>
      </Row>
    </MainContent>
  );
}
