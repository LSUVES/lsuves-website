import React, { Component } from "react";
import axios from "axios";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      postList: [],
    };
  }

  componentDidMount() {
    this.refreshList();
  }

  refreshList = () => {
    axios
      .get("/api/blog/")
      .then((res) => this.setState({ postList: res.data }))
      .catch((err) => console.log(err));
  };

  renderItems = () => {
    const { postList } = this.state;
    return postList.map((item) => (
      <li className="list-group-item" key={item.id}>
        <div className="h1" title={item.title}>
          {item.title}
        </div>
        <div>{item.body}</div>
        <div>
          <img src={item.image} alt="tempalt" />
        </div>
      </li>
    ));
  };

  render() {
    return (
      <main className="container">
        <h1 className="display-1 text-center text-primary">AVGS homepage</h1>
        <div>
          <ul className="list-group">{this.renderItems()}</ul>
        </div>
      </main>
    );
  }
}

export default App;
// wut
