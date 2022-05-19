// Food order shop information and menu item validation.

// Shop name validation.
const SHOP_NAME_MAX_LENGTH = 50;
const SHOP_NAME_FEEDBACK = {
  minLength: "Name must not be blank.",
  maxLength: `Name must not contain more than ${SHOP_NAME_MAX_LENGTH} characters.`,
};
export function checkShopName(
  shopName,
  setShopNameIsValid,
  setShopNameFeedback
) {
  // Checks whether shop name is a valid string.
  let isValid = true;
  let feedback = "";
  if (shopName.length === 0) {
    isValid = false;
    feedback = SHOP_NAME_FEEDBACK.minLength;
  } else if (shopName.length > SHOP_NAME_MAX_LENGTH) {
    isValid = false;
    feedback = SHOP_NAME_FEEDBACK.maxLength;
  }
  setShopNameIsValid(isValid);
  setShopNameFeedback(feedback);
  return isValid;
}

// Shop order by validation.
const ORDER_BY_MAX_LENGTH = 30;
const ORDER_BY_FEEDBACK = {
  minLength: "Order by must not be blank.",
  maxLength: `Order by must not contain more than ${ORDER_BY_MAX_LENGTH} characters.`,
};
export function checkOrderBy(orderBy, setOrderByIsValid, setOrderByFeedback) {
  // Checks whether order by is a valid string.
  let isValid = true;
  let feedback = "";
  if (orderBy.length === 0) {
    isValid = false;
    feedback = ORDER_BY_FEEDBACK.minLength;
  } else if (orderBy.length > ORDER_BY_MAX_LENGTH) {
    isValid = false;
    feedback = ORDER_BY_FEEDBACK.maxLength;
  }
  setOrderByIsValid(isValid);
  setOrderByFeedback(feedback);
  return isValid;
}

// Shop arrives at validation.
const ARRIVES_AT_MAX_LENGTH = 30;
const ARRIVES_AT_FEEDBACK = {
  minLength: "Arrives at must not be blank.",
  maxLength: `Arrives at must not contain more than ${ARRIVES_AT_MAX_LENGTH} characters.`,
};
export function checkArrivesAt(
  arrivesAt,
  setArrivesAtIsValid,
  setArrivesAtFeedback
) {
  // Checks whether arrives at is a valid string.
  let isValid = true;
  let feedback = "";
  if (arrivesAt.length === 0) {
    isValid = false;
    feedback = ARRIVES_AT_FEEDBACK.minLength;
  } else if (arrivesAt.length > ARRIVES_AT_MAX_LENGTH) {
    isValid = false;
    feedback = ARRIVES_AT_FEEDBACK.maxLength;
  }
  setArrivesAtIsValid(isValid);
  setArrivesAtFeedback(feedback);
  return isValid;
}

// Menu item name validation.
const ITEM_NAME_MAX_LENGTH = 100;
const ITEM_NAME_FEEDBACK = {
  minLength: "Name must not be blank.",
  maxLength: `Name must not contain more than ${ITEM_NAME_MAX_LENGTH} characters.`,
};
export function checkItemName(
  itemName,
  setItemNameIsValid,
  setItemNameFeedback
) {
  // Checks whether item name is a valid string.
  let isValid = true;
  let feedback = "";
  if (itemName.length === 0) {
    isValid = false;
    feedback = ITEM_NAME_FEEDBACK.minLength;
  } else if (itemName.length > ITEM_NAME_MAX_LENGTH) {
    isValid = false;
    feedback = ITEM_NAME_FEEDBACK.maxLength;
  }
  setItemNameIsValid(isValid);
  setItemNameFeedback(feedback);
  return isValid;
}

// Menu item info validation.
const ITEM_INFO_MAX_LENGTH = 200;
const ITEM_INFO_FEEDBACK = {
  maxLength: `Name must not contain more than ${ITEM_NAME_MAX_LENGTH} characters.`,
};
export function checkItemInfo(
  itemInfo,
  setItemInfoIsValid,
  setItemInfoFeedback
) {
  // Checks whether item info is a valid string.
  let isValid = true;
  let feedback = "";
  if (itemInfo.length > ITEM_INFO_MAX_LENGTH) {
    isValid = false;
    feedback = ITEM_INFO_FEEDBACK.maxLength;
  }
  setItemInfoIsValid(isValid);
  setItemInfoFeedback(feedback);
  return isValid;
}

// Menu item price validation.
// TODO: Max 5 digits, 2 of which reserved for decimal places.
