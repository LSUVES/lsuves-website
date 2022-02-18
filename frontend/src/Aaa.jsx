// FIXME: Delete this. Used it to test whether it's possible to update the
//        state of a parent component, i.e., a React Router page. It is, but
//        chances are when you try to return to the parent page it'll refresh
//        and lose the state anyway.
import React from "react";

import propTypes from "prop-types";
import { Container, Form, FormGroup, Input, Label } from "reactstrap";

export default function Aaa({ test, setTest }) {
  return (
    <main className="d-flex flex-column vh-100">
      <Container className="m-auto">
        <h2>Aaa</h2>
        <Form>
          <FormGroup>
            <Label for="test">Test</Label>
            <Input
              id="test"
              name="test"
              value={test}
              onInput={(e) => {
                setTest(e.target.value);
                console.log(test);
              }}
            />
          </FormGroup>
        </Form>
      </Container>
    </main>
  );
}
Aaa.propTypes = {
  test: propTypes.string.isRequired,
  setTest: propTypes.func.isRequired,
};
