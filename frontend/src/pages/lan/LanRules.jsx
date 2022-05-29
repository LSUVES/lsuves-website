import React from "react";

import { Col, Row } from "reactstrap";

import MainContent from "../../components/layout/MainContent";

export default function LanRules() {
  return (
    <MainContent>
      {/* TODO: Centre this, <ol> forces left alignment of text */}
      <Row className="justify-content-center">
        <Col sm={8}>
          <h2 className="text-center">LAN info</h2>
          {/* TODO: Replacr "LAN" with "the LAN"? */}
          <h5 className="mt-5">What to bring</h5>
          <p>
            LANs are a bring your own computer (BYOC) event: you should bring
            your own computer/console, display, and peripherals. You will be
            provided with two power sockets and one Ethernet connection to the
            LAN, as well as a desk and a chair.
            <br />
            There will be a well-stocked tuck shop for snacks but, of course,
            you&apos;re welcome to bring your own. <br />
            {/* TODO: See #food for food orders. */}
            If you&apos;re staying overnight, we recommend bringing something
            warm as well as a pillow and sleeping bag/duvet. Please also bring a
            toothbrush, toothpaste, and deoderant (for everyone&apos;s
            benefit!). <br />
            <b>Do not bring</b> alcohol, speakers, or any high-powered equipment
            (e.g., kettles, mini-fridges, grills). <br />
            Be aware that the society is not responsible for your belongings.
          </p>
          <h5 className="mt-5">Transporting equipment</h5>
          <p>
            The society offers a service for transporting up to two large items
            (e.g., computer and display) of your equipment to and from LAN. If
            you require the service, you must{" "}
            <a href="/lan/van-booking">book it here.</a>
          </p>
          <h5 className="mt-5">Arriving at LAN</h5>
          <p>
            Before you can connect to the LAN, you must sign in with a member of
            on-duty committee at the front desk.
          </p>
          <h5 className="mt-5">Food</h5>
          <p>
            In addition to a tuck shop, committee organises food orders from
            local takeaways. If you&apos;d like to order something, choose what
            you&apos;d like from <a href="/lan/food-order">the menus here</a>{" "}
            and then go to an on-duty committee member to pay before the food
            order closes.
          </p>
          <h5 className="mt-5">Rules</h5>
          <ol>
            <li>
              Do not use the network for any activity that violates the{" "}
              <a href="https://www.lboro.ac.uk/services/it/staff/about/policies/aup/">
                university network&apos;s acceptable use policy
              </a>
              . Your IP is attached to your account and its traffic is logged.
            </li>
            <li>
              Do not drink, smoke or do anything not permitted in univeristy
              buildings.
            </li>
            <li>
              Do not modify the power or network distribution layout. Only use
              the power sockets provided.
            </li>
            <li>Do not connect a router to the LAN.</li>
            <li>
              Do not use any equipment you do not own without permission,
              including but not limited to: university owned
              equipment/furniture, society owned equipment, and personal
              belongings.
            </li>
            <li>
              Do not enter off-limits areas or areas not part of the event.
            </li>
            <li>
              Only use authorised entrances and exits to the building. Use of
              fire exits is not permitted unless in the event of a fire.
            </li>
            <li>
              Do not put open-top liquid containers near electrical equipment.
            </li>
            <li>Do not act irresponsibly or anti-socially.</li>
          </ol>
          <h5 className="mt-5">Safety</h5>
          <p>
            <ul>
              <li>Please take regular breaks from your screen.</li>
              <li>Ensure you stay well-hydrated.</li>
              <li>
                If you have a serious allergy or medical condition, please make
                committee aware.
              </li>
              <li>
                If you become injured at LAN, you must report to a committee
                member, regardless of severity.
              </li>
              <li>
                Ensure you know where the emergency exits are at all times and
                that they are not obstructed.
              </li>
              <li>
                Make sure to sign in when you enter the building and sign out
                when you leave, so that we know who&apos;s inside in case of an
                emergency.
              </li>
            </ul>
          </p>
          <h5 className="mt-5">Leaving LAN</h5>
          <p>Before you leave, make sure to tidy your area.</p>
          <p>
            If you need help getting home, ask! People will be happy to help.
          </p>
          <p>
            Don&apos;t drive tired and if you&apos;re cycling in the dark, use
            lights.
          </p>
        </Col>
      </Row>
    </MainContent>
  );
}
