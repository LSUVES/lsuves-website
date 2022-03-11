export default function getCookie(name) {
  let value = null;
  console.log(document.cookie);
  if (document.cookie && document.cookie !== "") {
    [, value] = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      .split("=");
  }
  return value;
}
