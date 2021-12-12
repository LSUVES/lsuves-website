import React, { useEffect, useRef, useState } from "react";

import axios from "axios";
import { Button } from "reactstrap";
import "./Calendar.css";

// An implementation of modulo that handles negatives properly.
function mod(n, m) {
  return ((n % m) + m) % m;
}

// Returns an int from 1 to 7 corresponding to the day of the week
// where Monday is 1 and Sunday is 7.
function getDay(date) {
  return mod(date.getDay() - 1, 7);
}

export default function Calendar() {
  // Returns an array of size 42 corresponding to the 6 x 7 style of a calendar
  // with blank values padding a block of integers incrementing from 1 to 28-31
  // where the index mod 7 represents the day of the week given by getDay above.
  function datesInMonth(firstDay, lastDateNum) {
    // const firstDay = getDay(new Date(date.getFullYear(), date.getMonth(), 1));
    // const lastDate = new Date(
    //   date.getFullYear(),
    //   date.getMonth() + 1,
    //   0
    // ).getDate();

    const newDates = new Array(42).fill("");
    for (let i = 0; i < lastDateNum; i += 1) {
      newDates[firstDay + i] = i + 1;
    }
    return newDates;
  }

  // Creates states for current date, the first day of the month, and the date
  // of the last day of the month which get updated together.
  const [date, setDate] = useState(new Date());
  const [firstDay, setFirstDay] = useState(
    getDay(new Date(date.getFullYear(), date.getMonth(), 1))
  );
  const [lastDateNum, setLastDateNum] = useState(
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  );
  useEffect(() => {
    setFirstDay(getDay(new Date(date.getFullYear(), date.getMonth(), 1)));
    setLastDateNum(
      new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    );
  }, [date]);

  // Create a state to hold calendar dates corresponding to current date that's
  // updated when the date changes.
  const [dates, setDates] = useState(datesInMonth(firstDay, lastDateNum));
  useEffect(() => {
    setDates(datesInMonth(firstDay, lastDateNum));
  }, [firstDay, lastDateNum]);

  // Create ref for a column (i.e., day) of the calendar.
  const dayCol = useRef(null);

  // Create states for events (to be fetched from the back end), their html
  // displays on each row (i.e., week) of the calendar, and the end dates of
  // displayed events.
  const [events, setEvents] = useState([]);
  const [eventLabels, setEventLabels] = useState(new Array(6));
  useEffect(() => {
    // Get events from backend.
    axios
      .get("/api/events/")
      .then((res) => setEvents(res.data))
      .catch((err) => console.log(err));

    // Initialise new event labels.
    const newEventLabels = new Array(6);
    let eventRowEnds = new Array(3).fill(
      new Date(date.getFullYear(), date.getMonth(), 1)
    );

    // Loop through events.
    for (let i = 0; i < events.length; i += 1) {
      // Get start date of event and check that it falls within current month.
      const startDate = new Date(events[i].start_time);
      if (startDate.getMonth() === date.getMonth()) {
        // Loop through the end dates of currently shown events and check if the
        // start date of the current event is later than any so that the event
        // can be shown.
        for (let j = 0; j < eventRowEnds.length; j += 1) {
          if (startDate > eventRowEnds[j]) {
            // console.log(dayCol.current.offsetWidth - 20);
            // Get the end date of the event and use it to calculate the length
            // of the event in days.
            const endDate = new Date(events[i].end_time);
            let adjustedEndDateNum = endDate.getDate();
            if (
              endDate.getMonth() > date.getMonth() ||
              endDate.getFullYear() > date.getFullYear()
            ) {
              adjustedEndDateNum = lastDateNum;
            } else if (endDate.getHours === 0 && endDate.getMinutes === 0) {
              adjustedEndDateNum -= 1;
            }
            let remainingEventDays =
              adjustedEndDateNum - startDate.getDate() + 1;
            // Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1;
            // console.log(remainingEventDays);

            // Get the day of the week the event starts on and the number of
            // days from it to the end of the week.
            let startDay = getDay(startDate);
            let remainingWeekDays = 7 - startDay;

            // Initialise variables for the number of days the event lasts in the
            // current week and the week index.
            let lengthThisWeek = 0;
            let week = Math.floor((startDate.getDate() + firstDay - 1) / 7);

            // Loop until every day of the event has been accounted for or the
            // end of the month is reached.
            // FIXME: "&& week < 6" is not sufficient for the latter condition,
            //        months can have only 5 weeks or end mid-week.
            while (remainingEventDays !== 0) {
              if (remainingEventDays > remainingWeekDays) {
                lengthThisWeek = remainingWeekDays;
                remainingEventDays -= remainingWeekDays;
                remainingWeekDays = 7;
              } else {
                lengthThisWeek = remainingEventDays;
                remainingEventDays = 0;
              }
              // don't actually use buttons for this
              newEventLabels[week] = (
                <button
                  type="button"
                  className={`Event${j + 1}`}
                  style={{
                    left: 10 + dayCol.current.offsetWidth * startDay,
                    width: dayCol.current.offsetWidth * lengthThisWeek - 20,
                  }}
                >
                  {events[i].name}
                </button>
              );
              startDay = 0;
              week += 1;
            }
            const newEventRowEnds = eventRowEnds.slice();
            newEventRowEnds[j] = endDate;
            eventRowEnds = newEventRowEnds;
            // console.log(events);
            break;
          } else {
            console.log(
              `Event: ${events[i].name} failed check with row ${j}. Start date: ${startDate} vs ${eventRowEnds[j]}`
            );
          }
        }
      }
    }
    setEventLabels(newEventLabels);
    // console.log(eventLabels);
    return () => {
      setEventLabels(new Array(6));
    };
  }, [firstDay, lastDateNum, dayCol.current, JSON.stringify(events)]); // no. no.

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
        <Button
          type="button"
          onClick={() => {
            setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
          }}
          color="primary"
        >
          Previous
        </Button>
        <h4>
          {date.toLocaleString("default", { month: "long", year: "numeric" })}
        </h4>
        <Button
          type="button"
          onClick={() => {
            setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
          }}
          color="primary"
        >
          Next
        </Button>
      </div>
      <div className="container d-flex flex-column flex-fill h-100">{rows}</div>
    </div>
  );
}
