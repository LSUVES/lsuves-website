import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Blog() {
  const [postList, setPostList] = useState([]);

  useEffect(() => {
    axios
      .get("/api/blog/")
      .then((res) => setPostList(res.data))
      .catch((err) => console.log(err));
  }, [postList.length]);

  return (
    <div>
      <ul className="list-group align-items-center">
        {postList.map((item) => (
          <li className="list-group-item" key={item.id}>
            <div className="h1" title={item.title}>
              {item.title}
            </div>
            <div>{item.body}</div>
            <div>
              <img src={item.image} alt="tempalt" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
