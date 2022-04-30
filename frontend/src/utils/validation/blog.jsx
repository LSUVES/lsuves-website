// Blog post information constraints and validation functions.

// Blog post title validation.
export const MAX_TITLE_LENGTH = 100;
const TITLE_FEEDBACK = {
  minLength: "Title must not be blank.",
  maxLength: `Title must not contain more than ${MAX_TITLE_LENGTH} characters.`,
};
export function checkTitle(title, setTitleIsValid, setTitleFeedback) {
  // Checks whether name is a valid string.
  let isValid = true;
  let feedback = "";
  if (title.length === 0) {
    isValid = false;
    feedback = TITLE_FEEDBACK.minLength;
  } else if (title > MAX_TITLE_LENGTH) {
    isValid = false;
    feedback = TITLE_FEEDBACK.maxLength;
  }
  setTitleIsValid(isValid);
  setTitleFeedback(feedback);
  return isValid;
}

// Blog post body validation.
export function checkBody(body, setBodyIsValid, setBodyFeedback) {
  // Checks whether name is a valid string.
  let isValid = true;
  let feedback = "";
  if (body.length === 0) {
    isValid = false;
    feedback = "Body must not be blank.";
  }
  setBodyIsValid(isValid);
  setBodyFeedback(feedback);
  return isValid;
}
