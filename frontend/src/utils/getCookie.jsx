export default function getCookie(name) {
  let value = null;
  if (document.cookie && document.cookie !== "") {
    [, value] = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      .split("=");
  }
  return value;
}
