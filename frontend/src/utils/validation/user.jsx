// User account information constraints and validation functions.

// Username validation
export const MAX_USERNAME_LENGTH = 150;
// TODO: Consider allowing symbols on the backend.
export const VALID_USERNAME_REGEX = /^[\w.@+-]+$/;
export const USERNAME_FEEDBACK = {
  minLength: "Username must not be blank.",
  maxLength: `Username must not contain more than ${MAX_USERNAME_LENGTH} characters.`,
  characters: "Username must contain only letters, numbers, and @.+-_.",
};
export function checkUsername(
  username,
  setUsernameIsValid,
  setUsernameFeedback
) {
  // Checks whether username is a valid string but not whether it's free.
  let isValid = true;
  let feedback = "";
  if (username.length === 0) {
    isValid = false;
    feedback = USERNAME_FEEDBACK.minLength;
  } else if (username.length > MAX_USERNAME_LENGTH) {
    isValid = false;
    feedback = USERNAME_FEEDBACK.maxLength;
  } else if (!VALID_USERNAME_REGEX.test(username)) {
    isValid = false;
    feedback = USERNAME_FEEDBACK.characters;
  }
  setUsernameIsValid(isValid);
  setUsernameFeedback(feedback);
  return isValid;
}

// Email validation
export function checkEmail(email, setEmailIsValid) {
  // Checks whether the email has been provided (but not if it's valid).
  let isValid = true;
  // TODO: Consider implementing a more thorough check:
  //       https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
  //       https://stackoverflow.com/questions/46155/whats-the-best-way-to-validate-an-email-address-in-javascript
  if (email.length === 0) {
    isValid = false;
  }
  setEmailIsValid(isValid);
  return isValid;
}

// Deletion date validation
const MIN_DATE = new Date();
MIN_DATE.setUTCMonth(MIN_DATE.getMonth() + 1);
MIN_DATE.setUTCDate(1);
MIN_DATE.setUTCHours(0, 0, 0, 0);
const MAX_DATE = new Date(`${MIN_DATE.getFullYear() + 5}-08-01`);
MAX_DATE.setUTCHours(0, 0, 0, 0);
export { MIN_DATE, MAX_DATE };
export const DELETION_DATE_FEEDBACK = {
  minDate:
    "Deletion date must be at least a month from the present. You can delete your account manually at any time.",
  maxDate:
    "Deletion date cannot be longer than five years from the present. You can change this later.",
};
export function checkDeletionDate(
  deletionDate,
  setDeletionDateIsValid,
  setDeletionDateFeedback
) {
  // Checks whether the date of deletion is within the valid range.
  let isValid = true;
  let feedback = "";
  const deletionDateDate = new Date(deletionDate);
  if (deletionDateDate < MIN_DATE) {
    feedback = DELETION_DATE_FEEDBACK.minDate;
    isValid = false;
  } else if (deletionDateDate > MAX_DATE) {
    feedback = DELETION_DATE_FEEDBACK.maxDate;
    isValid = false;
  }
  setDeletionDateIsValid(isValid);
  setDeletionDateFeedback(feedback);
  return isValid;
}

// Password validation
export const MIN_PASSWORD_LENGTH = 8;
// FIXME: In Django, max password size is 4096 bytes but since the hash is stored
//        in 128 characters, the Django Rest Framework serializer gets confused.
export const MAX_PASSWORD_LENGTH = 128;
export const PASSWORD_FEEDBACK = {
  minLength: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  maxLength: `Password must not contain more than ${MAX_PASSWORD_LENGTH} characters`,
};
export function checkPassword(
  password,
  setPasswordIsValid,
  setPasswordFeedback
) {
  // Checks whether the password length is valid.
  let isValid = true;
  let feedback = "";
  if (password.length < MIN_PASSWORD_LENGTH) {
    isValid = false;
    feedback = PASSWORD_FEEDBACK.minLength;
  } else if (password.length > MAX_PASSWORD_LENGTH) {
    isValid = false;
    feedback = PASSWORD_FEEDBACK.maxLength;
  }
  setPasswordIsValid(isValid);
  setPasswordFeedback(feedback);
  return isValid;
}
export function checkRepeatPassword(
  password,
  repeatPassword,
  setRepeatPasswordIsValid
) {
  // Checks whether the passwords match.
  let isValid = true;
  if (password !== repeatPassword) {
    isValid = false;
  }
  setRepeatPasswordIsValid(isValid);
  return isValid;
}
