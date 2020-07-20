import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { UnoSpec, Req } from '..';
import { state, ClientGameActions } from '../../../types';
import { Card as CardType } from '../common';
import { Card } from './Card';

import './Stacks.scss';

interface IProps {
  upStackSize: number;
  downStackSize: number;
  topCard: CardType | null;
  placementAngle: number | null;

  draw: () => void;
}

export function Stacks(props: IProps) {
  const x = props.placementAngle === null ? 0 : -25 * Math.sin(props.placementAngle);
  const y = props.placementAngle === null ? 0 : 25 * Math.cos(props.placementAngle);
  return <div className="stacks">
    <div className="down-stack">
      <TransitionGroup>
        {[
          <CSSTransition
            key={props.topCard?.id || ''}
            classNames="place-card"
            onEnter={(node: HTMLElement) => {
              node.style.transform=`translate(${x}vw, ${y}vh)`;
            }}
            onEntering={(node: HTMLElement) => {
              node.style.transform='';
            }}
            timeout={300}>
            {props.topCard
              ? <Card color={props.topCard.color} value={props.topCard.value} />
              : <Card color="gray" value="empty" />}
          </CSSTransition>
        ]}
      </TransitionGroup>
      <div className="number"> {props.downStackSize}</div>
    </div>
    <div className="up-stack" onClick={props.draw}>
      <Card turned={true} color="black" value="back" />
      <div className="number"> {props.upStackSize}</div>
    </div>
  </div>;
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    upStackSize: state.l1.upStackSize,
    downStackSize: state.l1.downStackSize,
    topCard: state.l1.topCard,
    placementAngle: (function () {
      const turnOrder = state.l1.turnOrder;
      const myIndex = turnOrder.indexOf(state.l2.id);
      const placementIndex = turnOrder.indexOf(state.l1.lastPlayBy!);
      if (placementIndex < 0) return null;
      return Math.PI * 2
        * ((placementIndex - myIndex + turnOrder.length) % turnOrder.length)
        / turnOrder.length;
    }())
  }),
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
    draw: () => dispatch(Req.actions.drawCard())
  })
)(Stacks);
