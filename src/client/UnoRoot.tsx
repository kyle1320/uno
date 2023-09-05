import * as React from "react";
import { Provider } from "react-redux";

import { UnoClient } from "./UnoClient";
import Uno from "./components/Uno";

export class UnoRoot extends React.PureComponent {
  private client: UnoClient;

  constructor() {
    super({});

    let roomName = window.location.pathname;
    roomName = roomName.startsWith("/") ? roomName.substring(1) : roomName;
    localStorage.setItem("savedRoomName", roomName);

    this.client = new UnoClient(roomName);
    (window as any).uno = this.client;
    this.client.connect();
  }

  componentWillUnmount() {
    delete (window as any).uno;
    this.client.dispose();
  }

  render() {
    if (!this.client) {
      return null;
    }

    return (
      <Provider store={this.client.store}>
        <Uno />
      </Provider>
    );
  }
}
