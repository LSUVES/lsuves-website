// Validation constratints.

export const MAX_USERNAME_LENGTH = 150;
// TODO: Consider allowing symbols on the backend.
export const VALID_USERNAME_REGEX = /^[\w.@+-]+$/;
export const USERNAME_FEEDBACK = {
  minLength: "Username must not be blank.",
  maxLength: `Username must not contain more than ${MAX_USERNAME_LENGTH} characters.`,
  characters: "Username must contain only letters, numbers, and @.+-_.",
};

export const MIN_PASSWORD_LENGTH = 8;
// FIXME: In Django, max password size is 4096 bytes but since the hash is stored
//        in 128 characters, the Django Rest Framework serializer gets confused.
export const MAX_PASSWORD_LENGTH = 128;
export const PASSWORD_FEEDBACK = {
  minLength: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  maxLength: `Password must not contain more than ${MAX_PASSWORD_LENGTH} characters`,
};

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
