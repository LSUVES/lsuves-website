import React from "react";

import { Card, CardBody } from "reactstrap";

import "./Home.css";

export default function Home() {
  return (
    <main>
      <div className="HomeBackground">
        <h1 className="display-1 text-center">
          Welcome to A<span className="text-primary">VGS</span>
        </h1>
        <div className="col-xs-3 col-sm-6 mx-auto">
          <Card>
            <CardBody>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
              molestie, dolor quis vehicula dignissim, turpis arcu iaculis
              justo, eu ullamcorper ex justo vel est. Nullam enim augue, semper
              at libero et, sodales volutpat turpis. Donec non vehicula nunc,
              non pulvinar ex. Phasellus lorem elit, luctus at neque quis,
              aliquet lobortis velit. Aenean sit amet finibus metus. In faucibus
              posuere velit, ac volutpat ligula pellentesque et. In blandit
              ligula sit amet imperdiet consectetur. Fusce ornare nibh lorem, et
              efficitur turpis dapibus vel. Maecenas commodo felis metus, vitae
              porttitor orci bibendum consectetur.
            </CardBody>
          </Card>
        </div>
        {/* TODO: Show two columns side-by-side */}
        {/* <div className="col-sm-6 mx-auto">
          <Card>
            <CardBody>Lorem Ipsum</CardBody>
          </Card>
        </div> */}
      </div>
    </main>
  );
}
