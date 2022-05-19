// Event information constraints and validation functions.

import formatDateTime from "../formatDateTime";

// Event name validation.
export const MAX_NAME_LENGTH = 100;
const NAME_FEEDBACK = {
  minLength: "Name must not be blank.",
  maxLength: `Name must not contain more than ${MAX_NAME_LENGTH} characters.`,
};
export function checkName(name, setNameIsValid, setNameFeedback) {
  // Checks whether name is a valid string.
  let isValid = true;
  let feedback = "";
  if (name.length === 0) {
    isValid = false;
    feedback = NAME_FEEDBACK.minLength;
  } else if (name.length > MAX_NAME_LENGTH) {
    isValid = false;
    feedback = NAME_FEEDBACK.maxLength;
  }
  setNameIsValid(isValid);
  setNameFeedback(feedback);
  return isValid;
}

// Event type validation.
export const EVENT_TYPES = {
  games: "Games",
  social: "Social",
  tournament: "Tournament",
  lan: "LAN",
  organisational: "Organisational",
  other: "Other",
};
export const DEFAULT_EVENT_TYPE = "Games";

// Event location validation.
export const MAX_LOCATION_LENGTH = 100;
const LOCATION_FEEDBACK = {
  minLength: "Location must not be blank.",
  maxLength: `Location must not contain more than ${MAX_LOCATION_LENGTH} characters.`,
};
export function checkLocation(
  location,
  setLocationIsValid,
  setLocationFeedback
) {
  // Checks whether location is a valid string.
  let isValid = true;
  let feedback = "";
  if (location.length === 0) {
    isValid = false;
    feedback = LOCATION_FEEDBACK.minLength;
  } else if (location.length > MAX_LOCATION_LENGTH) {
    isValid = false;
    feedback = LOCATION_FEEDBACK.maxLength;
  }
  setLocationIsValid(isValid);
  setLocationFeedback(feedback);
  return isValid;
}

// Event start/end time validation.
const MIN_START_TIME = new Date();
MIN_START_TIME.setUTCHours(0, 0, 0, 0);
const MAX_START_TIME = new Date(`${MIN_START_TIME.getFullYear() + 2}-08-01`);
MAX_START_TIME.setUTCHours(0, 0, 0, 0);
const MIN_START_TIME_STR = formatDateTime(MIN_START_TIME);
const MAX_START_TIME_STR = formatDateTime(MAX_START_TIME);
export { MIN_START_TIME_STR, MAX_START_TIME_STR };
const startTimeFeedback = {
  minTime:
    "Event start time should not be before today (but you can use the Django admin page for this).",
  maxTime:
    "Event end time should not be more than two years away (but you can use the Django admin page for this).",
};
export function checkStartTime(
  startTime,
  setStartTimeIsValid,
  setStartTimeFeedback
) {
  // Checks whether the start time is not before today and not longer than two
  // years away.
  let isValid = true;
  let feedback = "";
  if (startTime < MIN_START_TIME) {
    isValid = false;
    feedback = startTimeFeedback.minTime;
  } else if (startTime > MAX_START_TIME) {
    isValid = false;
    feedback = startTimeFeedback.maxTime;
  }
  setStartTimeIsValid(isValid);
  setStartTimeFeedback(feedback);
  return isValid;
}
const endTimeFeedback = {
  minTime: "Event end time should be after its start time.",
  maxTime:
    "Event end time should not be more than a month later than the start time (but you can use the Django admin page for this).",
};
export function checkEndTime(
  endTime,
  startTime,
  setEndTimeIsValid,
  setEndTimeFeedback
) {
  // Checks whether the end time is later than the start time but not by more
  // than a month (which is almost certainly too generous anyway).
  // TODO: Actually enforce that second condition.
  //       Ensure events are not shorter than 5 minutes.
  let isValid = true;
  let feedback = "";
  if (endTime <= startTime) {
    isValid = false;
    feedback = endTimeFeedback.minTime;
  }
  setEndTimeIsValid(isValid);
  setEndTimeFeedback(feedback);
  return isValid;
}
