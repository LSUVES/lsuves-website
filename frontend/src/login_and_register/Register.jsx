// import React, { useState } from "react";
import React from "react";

import { Button, Container, Form, FormGroup, Input, Label } from "reactstrap";

export default function Register() {
  // [deletionDate, setDeletionDate] = useState(new Date(new Date().getFullYear() + 3, 7, 1));
  function register() {
    // pass
  }
  return (
    <main className="d-flex flex-column vh-100">
      <Container className="m-auto AccountCredentialsForm">
        <h2>Create an account</h2>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            register();
          }}
        >
          <FormGroup>
            <Label for="username">Username</Label>
            <Input id="username" name="username" />
          </FormGroup>
          <FormGroup>
            <Label for="email">Email</Label>
            {/* FIXME: Why does the type helptext lag? It's Chrome. */}
            <Input id="email" name="email" type="email" />
          </FormGroup>
          <FormGroup>
            <Label for="deletionDate">Date of account deletion</Label>
            {/* FIXME: Default value not working? */}
            <Input
              id="deletionDate"
              name="deletionDate"
              type="date"
              defaultValue={new Date(new Date().getFullYear() + 3, 7, 1)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="password">Password</Label>
            <Input id="password" name="password" type="password" />
          </FormGroup>
          <FormGroup>
            <Label for="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
            />
          </FormGroup>
          <FormGroup>
            <Button id="submit" name="submit">
              Create account
            </Button>
          </FormGroup>
        </Form>
        <small>
          Already have an account? <a href="/login">Log in here</a>.
        </small>
      </Container>
    </main>
  );
}
