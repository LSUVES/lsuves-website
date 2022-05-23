/**
 * Given a Date object, converts it to it's ISO string representation and formats
 * it for use with datetime-local input elements.
 * @param {Date} time
 */

export default function formatDateTime(time) {
  const utcTime = new Date(time);
  utcTime.setMinutes(utcTime.getMinutes() - utcTime.getTimezoneOffset());
  return utcTime.toISOString().slice(0, utcTime.toISOString().lastIndexOf(":"));
}
