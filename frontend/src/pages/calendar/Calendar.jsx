import React, { useEffect, useState } from "react";

import axios from "axios";
import { Button, Col, Row } from "reactstrap";

import "./Calendar.css";
import MainContent from "../../components/layout/MainContent";

// TODO: Check compliance with the statement: if something can be derived from
//       either props or state, it probably shouldn't be in the state.

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

  // Monitor width of a column (i.e., day) of the calendar.
  // TODO: See if it's possible to observe Bootstrap breakpoints instead
  //       Ensure observed label reflects the width of all labels; change
  //       labels to shorter forms (e.g., Mon, Tues, Wed) if one doesn't fit
  const [calendarColWidth, setCalendarColWidth] = useState(0);
  const resizeObserver = new ResizeObserver((entries) => {
    for (let i = 0; i < entries.length; i += 1) {
      setCalendarColWidth(entries[i].borderBoxSize[0].inlineSize);
    }
  });
  useEffect(() => {
    resizeObserver.observe(document.getElementById("calendarColMonday"));
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Create states for events (to be fetched from the back end), their html
  // displays on each row (i.e., week) of the calendar, and the end dates of
  // displayed events.
  const [events, setEvents] = useState(Object.create(null));
  const [eventLabels, setEventLabels] = useState(new Array(6));
  useEffect(() => {
    // Get events from backend if they haven't already been fetched.
    // TODO: Put this into a separate useEffect hook.
    const yearMonth = `${date.getFullYear()}-${date.getMonth()}`;
    if (!(yearMonth in events)) {
      axios
        .get("/api/events/", {
          params: { year: date.getFullYear(), month: date.getMonth() + 1 },
        })
        .then((res) =>
          setEvents({
            ...events,
            [yearMonth]: res.data,
          })
        )
        .catch((err) => console.log(err));
    }
    // TODO: Refactor to use pointer to events[yearMonth].
    if (events[yearMonth]) {
      // Initialise new event labels.
      const newEventLabels = new Array(6);
      for (let row = 0; row < newEventLabels.length; row += 1) {
        newEventLabels[row] = [];
      }
      const eventRowEndDateNums = new Array(3).fill(0);

      // Loop through events.
      for (let i = 0; i < events[yearMonth].length; i += 1) {
        // Get start date of event.
        const startDate = new Date(events[yearMonth][i].start_time);
        let adjustedStartDateNum = startDate.getDate();
        if (
          startDate.getMonth() < date.getMonth() ||
          startDate.getFullYear() < date.getFullYear()
        ) {
          adjustedStartDateNum = 1;
        }
        // Loop through the end dates of currently shown events and check if the
        // start date of the current event is later than any so that the event
        // can be shown.
        for (let j = 0; j < eventRowEndDateNums.length; j += 1) {
          if (adjustedStartDateNum > eventRowEndDateNums[j]) {
            // Get the end date of the event and use it to calculate the span
            // of the event in days.
            const endDate = new Date(events[yearMonth][i].end_time);
            let adjustedEndDateNum = endDate.getDate();
            if (
              endDate.getMonth() > date.getMonth() ||
              endDate.getFullYear() > date.getFullYear()
            ) {
              adjustedEndDateNum = lastDateNum;
            } else if (endDate.getHours() === 0 && endDate.getMinutes() === 0) {
              adjustedEndDateNum -= 1;
            }
            let remainingEventDays =
              adjustedEndDateNum - adjustedStartDateNum + 1;

            // Get the day of the week the event starts on and the number of
            // days from it to the end of the week.
            let startDay =
              adjustedStartDateNum === 1 ? firstDay : getDay(startDate);
            let remainingWeekDays = 7 - startDay;

            // Initialise variables for the number of days the event lasts in the
            // current week and the week index.
            let lengthThisWeek = 0;
            let week = Math.floor((adjustedStartDateNum + firstDay - 1) / 7);

            // Loop until every day of the event has been accounted for or the
            // end of the month is reached.
            // FIXME: Fix display issues with event labels when a user zooms in, i.e., reduce the number of
            //        rows of labels to display from 3 to 0 as the height of each day shrinks
            // TODO: Add tabindex="-1" to additional identical labels to prevent excess tabbing
            //       Add code to add focus outline to all identical labels when the first one is tabbed to
            while (remainingEventDays !== 0) {
              if (remainingEventDays > remainingWeekDays) {
                lengthThisWeek = remainingWeekDays;
                remainingEventDays -= remainingWeekDays;
                remainingWeekDays = 7;
              } else {
                lengthThisWeek = remainingEventDays;
                remainingEventDays = 0;
              }
              console.log(
                `${events[yearMonth][i].id},${events[yearMonth][i].name}: row: ${j}; startDay: ${startDay}; lengthThisWeek: ${lengthThisWeek}`
              );
              newEventLabels[week].push(
                <a
                  id={`Event${events[yearMonth][i].id}`}
                  key={`Event${events[yearMonth][i].id}`}
                  href={`/events/${events[yearMonth][i].id}`}
                  title={events[yearMonth][i].name}
                  className={`Event${j + 1}`}
                  style={{
                    left: 10 + calendarColWidth * startDay,
                    width: calendarColWidth * lengthThisWeek - 20,
                  }}
                >
                  <span className="EventText">{events[yearMonth][i].name}</span>
                </a>
              );
              startDay = 0;
              week += 1;
            }
            eventRowEndDateNums[j] = adjustedEndDateNum;
            break;
          } else {
            console.log(
              `Event: ${events[yearMonth][i].name} failed check with row ${j}. Start date: ${adjustedStartDateNum} vs ${eventRowEndDateNums[j]}`
            );
          }
        }
      }
      setEventLabels(newEventLabels);
      // console.log(eventLabels);
    }
    return () => {
      setEventLabels(new Array(6));
    };
  }, [firstDay, lastDateNum, calendarColWidth, JSON.stringify(events)]); // FIXME: Either don't have events as state or extract the JSON.stringify()

  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const labels = [];
  for (let i = 0; i < 7; i += 1) {
    labels.push(
      <Col id={`calendarCol${weekdays[i]}`}>
        {/* style={{ minWidth: "98px" }}> */}
        {weekdays[i]}
      </Col>
    );
  }
  const rows = [
    <Row id="labels" className="flex-nowrap">
      {labels}
    </Row>,
  ];
  // TODO: Allow users to click a day to see a list of all events
  for (let i = 0; i < 6; i += 1) {
    const row = [];
    for (let j = 0; j < 7; j += 1) {
      row.push(
        <Col
          style={{
            // TODO: Refactor if the default bg colour is to be the same as page
            background: `${dates[i * 7 + j] === "" ? "#ffffff" : "#898df5"}`,
            // minWidth: "98px",
          }}
        >
          {dates[i * 7 + j]}
        </Col>
      );
    }
    rows.push(
      <Row id={`week-${i}`} className="flex-fill flex-nowrap position-relative">
        {row}
        {eventLabels[i]}
      </Row>
    );
  }
  // FIXME: Layout breaks on mobile devices (see point about label widths)
  // TODO: Button text is not aligned with date text.
  return (
    <MainContent>
      {/* TODO: Instead of Row > Cols consider just using a div with "d-flex justify-content-between" */}
      <Row className="text-center">
        <Col>
          <Button
            type="button"
            onClick={() => {
              setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
            }}
            color="primary"
          >
            Previous month
          </Button>
        </Col>
        <Col>
          <h4>
            {date.toLocaleString("default", { month: "long", year: "numeric" })}
          </h4>
        </Col>
        <Col>
          <Button
            type="button"
            onClick={() => {
              setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
            }}
            color="primary"
          >
            Next month
          </Button>
        </Col>
      </Row>
      {/* mx options might not be necessary if issue with displaying day labels
      at smaller widths is fixed (e.g., by shortening them) */}
      <Row className="d-flex flex-row flex-fill h-100">
        <Col className="d-flex flex-column flex-fill">{rows}</Col>
      </Row>
    </MainContent>
  );
}
