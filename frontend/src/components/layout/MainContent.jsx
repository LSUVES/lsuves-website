import React from "react";

import propTypes from "prop-types";
import { Container } from "reactstrap";

export default function MainContent({ children }) {
  // Wrapper for a page's main content.
  // TODO: Add mt-5 or allow it to be passed in as props
  //       Consider separating main from Container if necessary
  return (
    <main className="d-flex flex-column flex-fill">
      <Container className="d-flex flex-column flex-fill bg-warning my-3">
        {children}
      </Container>
    </main>
  );
}
MainContent.propTypes = {
  // className: propTypes.string,
  children: propTypes.node.isRequired,
};
// MainContent.defaultProps = {
//   className: "",
// };
