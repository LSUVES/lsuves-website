import React, { useEffect, useState } from "react";

import axios from "axios";
import { Container } from "reactstrap";

import AxiosError from "../axiosError/AxiosError";

export default function Profile() {
  const [profile, setProfile] = useState();
  //   const { profileId } = useParams();
  const [display, setDisplay] = useState();

  useEffect(() => {
    axios
      .get(`/api/profile/`, { withCredentials: true })
      .then((res) => setProfile(res.data))
      .catch((err) => {
        setDisplay(AxiosError(err));
      });
    //   }, [eventId]);
  }, []);

  useEffect(() => {
    console.log(profile);
    if (profile) {
      setDisplay(
        <>
          <h2>{profile.username}</h2>
          {profile.isAdmin && (
            <p>
              <small>Admin account</small>
            </p>
          )}
          <p>
            <b>Email:</b> {profile.email || "None provided"}
          </p>
          <p>
            <b>Scheduled date of account deletion:</b>{" "}
            {profile.deletion_date
              ? new Date(profile.deletion_date).toString()
              : "Never"}
          </p>
        </>
      );
    }
  }, [profile]);

  return (
    <main className="d-flex flex-column">
      <Container>{display}</Container>
    </main>
  );
}
