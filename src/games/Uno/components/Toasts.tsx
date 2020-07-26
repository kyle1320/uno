import * as React from 'react';
import { connect } from 'react-redux';

import { UnoSpec } from '..';
import { state } from '../../../types';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import './Toasts.scss';

interface IProps {
  toasts: string[];
}

const Toasts = function(props: IProps) {
  return <TransitionGroup className="toasts">
    {props.toasts.map(msg =>
      <CSSTransition
        key={msg}
        classNames="toast-slide"
        timeout={500}
        onExit={(node: HTMLElement) => {
          node.style.height=node.clientHeight+'px';
        }}
        onExiting={(node: HTMLElement) => {
          node.style.height='';
        }}>
        <div className="toast">
          <div className="toast-wrapper">{msg}</div>
        </div>
      </CSSTransition>
    )}
  </TransitionGroup>;
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    toasts: state.l4.toasts
  })
)(Toasts);
