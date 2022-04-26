import React, { useState } from "react";

import axios from "axios";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import "../../styles/authentication.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  function forgotPassword() {
    axios
      .post(
        "/api/users/email_password_reset_token/",
        {
          email,
        },
        {
          withCredentials: true,
        }
      )
      .then(() => {
        // if (res.status >= 200 && res.status <= 299) {
        // TODO: Display confirmation message
      })
      .catch((err) => {
        // TODO: DRY this out with AxiosError.jsx
        console.log(err);
        if (err.response) {
          // if (err.response.status === 400) {
          // }
          console.log(err.response);
        } else if (err.request) {
          console.log(err.request);
        } else {
          console.log(err.message);
        }
      });
  }

  return (
    <main className="d-flex flex-column flex-fill m-auto form--thin">
      <h2>Forgot password?</h2>
      <p>
        Enter the email attached to your account and we&apos;ll send you an
        email with a link to reset your password.
      </p>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          forgotPassword();
        }}
      >
        <FormGroup>
          <Label for="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onInput={(e) => setEmail(e.target.value)}
            // invalid={emailIsValid === false}
            // required
          />
          {/* {!emailIsValid && (
              <FormFeedback>Please enter a valid email.</FormFeedback>
            )} */}
        </FormGroup>
        <FormGroup>
          <Button id="submit" name="submit">
            Send password reset email
          </Button>
        </FormGroup>
      </Form>
      <small>
        Can&apos;t remember your email? <br />
        Contact us here ...
      </small>
    </main>
  );
}
