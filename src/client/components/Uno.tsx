import * as React from "react";
import { connect } from "react-redux";

import * as Uno from "../../spec";
import CardWheel from "./CardWheel";
import Menu from "./Menu";
import Players from "./Players";
import Stacks from "./Stacks";
import Info from "./Info";
import Toasts from "./Toasts";
import Fireworks from "./Fireworks";

import "./Uno.scss";
import { ClientStoreState } from "redux-mc/util";

interface Props {
  connected: boolean;
  error: any;
  didWin: boolean;
}

function getBannerMessage(connected: boolean, error: unknown) {
  if (!connected) {
    return "Connecting...";
  }

  if (error === Uno.VERSION_MISMATCH_ERROR) {
    return "Client is out of date. Refreshing...";
  }

  if (error) {
    return "An error occured. Try refreshing the page.";
  }

  return "";
}

class UnoRoot extends React.PureComponent<Props> {
  render() {
    return (
      <div className="uno-game">
        <Menu />
        <div className="banner">{getBannerMessage(this.props.connected, this.props.error)}</div>
        <div className="table">
          <Toasts />
          <Stacks />
          <Players />
          <Info />
          <Fireworks show={this.props.didWin} />
        </div>
        <div className="hand">
          <CardWheel />
        </div>
      </div>
    );
  }
}

export default connect((state: ClientStoreState<Uno.Spec>) => ({
  connected: state.meta.connected,
  error: state.meta.error,
  didWin: state.L4.didWin
}))(UnoRoot);
