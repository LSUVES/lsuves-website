/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

import "./Calendar.css";

// https://stackoverflow.com/a/543152
// https://eslint.org/docs/rules/no-extend-native
// aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

function mod(n, m) {
  return ((n % m) + m) % m;
}

function getDay(date) {
  return mod(date.getDay() - 1, 7);
}

export default function Calendar() {
  function datesInMonth(date) {
    const firstDay = getDay(new Date(date.getFullYear(), date.getMonth(), 1));
    const lastDay = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();
    const newDates = new Array(42).fill("");
    for (let i = 0; i < lastDay; i += 1) {
      newDates[firstDay + i] = i + 1;
    }
    return newDates;
  }
  const [date, setDate] = useState(new Date());
  const [dates, setDates] = useState(datesInMonth(date));
  // refactor this
  useEffect(() => {
    setDates(datesInMonth(date));
    // return () => {
    //   cleanup
    // }
  }, [date]);

  const dayCol = useRef(null);
  const [events, setEvents] = useState([]);
  const [eventLabels, setEventLabels] = useState(new Array(6));
  const [eventRowEnds, setEventRowEnds] = useState(
    new Array(3).fill(new Date(date.getFullYear(), date.getMonth(), 1))
  );
  useEffect(() => {
    axios
      .get("/api/events/")
      .then((res) => setEvents(res.data))
      .catch((err) => console.log(err));

    // read this https://stackoverflow.com/a/9329476
    const newEventLabels = new Array(6);
    for (let i = 0; i < events.length; i += 1) {
      const startDate = new Date(events[i].start_time);
      if (startDate.getMonth() === date.getMonth()) {
        for (let j = 0; j < eventRowEnds.length; j += 1) {
          if (startDate > eventRowEnds[j]) {
            console.log(dayCol.current.offsetWidth - 20);
            const endDate = new Date(events[i].end_time);
            let duration = 0;
            let remainingEventDays = Math.round(
              (endDate - startDate) / (1000 * 60 * 60 * 24)
            );
            let startDay = getDay(startDate);
            let remainingWeekDays = 7 - startDay;
            let week = Math.floor(startDate.getDate() / 7);
            while (remainingEventDays !== 0 || week > 6) {
              if (remainingEventDays > remainingWeekDays) {
                duration = remainingWeekDays;
                remainingEventDays -= remainingWeekDays;
                remainingWeekDays = 7;
                console.log(duration);
              } else {
                duration = remainingEventDays;
                remainingEventDays = 0;
              }
              newEventLabels[week] = (
                <div
                  className={`Event${j + 1}`}
                  style={{
                    left: 10 + dayCol.current.offsetWidth * startDay,
                    width: dayCol.current.offsetWidth * duration - 20,
                  }}
                >
                  {events[i].name}
                </div>
              );
              startDay = 0;
              week += 1;
            }
            const newEventRowEnds = eventRowEnds.slice();
            newEventRowEnds[j] = endDate;
            setEventRowEnds(newEventRowEnds);
            break;
          } else {
            console.log(eventRowEnds[j]);
          }
        }
      }
    }
    setEventLabels(newEventLabels);
    // console.log(eventLabels);
    console.log(`here ${eventRowEnds}`);
    return () => {
      setEventLabels(new Array(6));
      setEventRowEnds(
        new Array(3).fill(new Date(date.getFullYear(), date.getMonth(), 1))
      );
      console.log(`gone ${eventRowEnds}`);
    };
  }, [date, dayCol.current, events.length]); // no. no.

  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const labels = [
    <div className="col" ref={dayCol}>
      {weekdays[0]}
    </div>,
  ];
  for (let i = 1; i < 7; i += 1) {
    labels.push(<div className="col">{weekdays[i]}</div>);
  }
  const rows = [
    <div id="labels" className="row">
      {labels}
    </div>,
  ];
  for (let i = 0; i < 6; i += 1) {
    const row = [];
    for (let j = 0; j < 7; j += 1) {
      row.push(
        <div
          className="col"
          style={{
            // refactor if the default bg colour is to be the same as page
            background: `${dates[i * 7 + j] === "" ? "#ffffff" : "#898df5"}`,
          }}
        >
          {dates[i * 7 + j]}
        </div>
      );
    }
    rows.push(
      <div id={`week-${i}`} className="row flex-fill position-relative">
        {row}
        {eventLabels[i]}
      </div>
    );
  }

  return (
    <div className="container d-flex flex-column flex-fill h-100">
      {/* align-items-center shortens the buttons vertically? */}
      <div className="container d-flex flex-row flex-fill align-items-center justify-content-center">
        <button
          type="button"
          onClick={() => {
            setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
          }}
        >
          Previous
        </button>
        <p>
          {date.toLocaleString("default", { month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          onClick={() => {
            setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
          }}
        >
          Next
        </button>
      </div>
      <div className="container d-flex flex-column flex-fill h-100">{rows}</div>
    </div>
  );
}
