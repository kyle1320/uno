import * as React from "react";
import { connect } from "react-redux";
import { ClientStoreState } from "redux-mc/util";
import { TransitionGroup, CSSTransition } from "react-transition-group";

import * as Uno from "../../spec";

import "./Toasts.scss";

interface IProps {
  toasts: string[];
}

const Toasts = function (props: IProps) {
  return (
    <TransitionGroup className="toasts">
      {props.toasts.map((msg) => (
        <CSSTransition
          key={msg}
          classNames="toast-slide"
          timeout={500}
          onExit={(node: HTMLElement) => {
            node.style.height = node.clientHeight + "px";
          }}
          onExiting={(node: HTMLElement) => {
            node.style.height = "";
          }}
        >
          <div className="toast">
            <div className="toast-wrapper">{msg}</div>
          </div>
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
};

export default connect((state: ClientStoreState<Uno.Spec>) => ({
  toasts: state.L4.toasts
}))(Toasts);
