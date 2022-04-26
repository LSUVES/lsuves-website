/**
 * Given a Date object, converts it to it's ISO string representation and formats
 * it for use with datetime-local input elements.
 * @param {Date} time
 */
export default function formatDateTime(time) {
  return time.toISOString().slice(0, time.toISOString().lastIndexOf(":"));
}
