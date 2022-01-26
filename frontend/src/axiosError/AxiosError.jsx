import React from "react";

export default function HttpError(error) {
  const { response, request } = error;
  let message = <h2>An error occurred</h2>;

  if (response) {
    // The request was sent and the server responded with a status code that
    // was not 2XX (successful)
    message = (
      <h2>
        Error {error.response.status}: {error.response.statusText}
      </h2>
    );
    if (error.response.status === 404) {
      // TODO: Add funny meme?
    }
  } else if (request) {
    // The request was sent but no response was received
    console.log(error.request);
  } else {
    // An error was triggered while setting up the request
    console.log(error.message);
  }

  return <main>{message}</main>;
}
