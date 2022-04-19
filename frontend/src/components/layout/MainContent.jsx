import React from "react";

import propTypes from "prop-types";
import { Container } from "reactstrap";

export default function MainContent({ children }) {
  // Wrapper for a page's main content.
  // TODO: Add mt-5 or allow it to be passed in as props
  //       Consider separating main from Container if necessary
  return (
    <main className="d-flex flex-column flex-fill">
      <Container className="d-flex flex-column flex-fill bg-danger">
        {children}
      </Container>
    </main>
  );
}
MainContent.propTypes = {
  children: propTypes.node.isRequired,
};
