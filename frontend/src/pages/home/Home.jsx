import React from "react";

import { Card, CardBody } from "reactstrap";

import MainContent from "../../components/layout/MainContent";

import "./Home.css";

export default function Home() {
  return (
    <div className="HomeBackground d-flex flex-column flex-fill">
      <MainContent>
        <h1 className="display-1 text-center">
          Welcome to A<span className="text-primary">VGS</span>
        </h1>
        <div className="col-xs-3 col-sm-6 mx-auto">
          <Card>
            <CardBody>
              The video game society is the home to all gamers ...
            </CardBody>
          </Card>
        </div>
        {/* TODO: Show two columns side-by-side */}
        {/* <div className="col-sm-6 mx-auto">
          <Card>
            <CardBody>Lorem Ipsum</CardBody>
          </Card>
        </div> */}
      </MainContent>
    </div>
  );
}
