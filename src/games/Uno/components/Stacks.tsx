import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { UnoSpec, Req } from '..';
import { state, ClientGameActions } from '../../../types';
import { Card as CardType, clientSelectors } from '../common';
import { Card } from './Card';
import { calculatePosition } from './Player';

import './Stacks.scss';

interface IProps {
  topCard: CardType | null;
  placement: number | null;
  canDraw: boolean;
  mustDraw: boolean;
  upStackSize: number;
  direction: 'CW' | 'CCW';

  draw: () => void;
}

export function Stacks(props: IProps) {
  const [x, y] =
    props.placement === null ? [0, 0] : calculatePosition(props.placement);
  return (
    <div className="stacks">
      <div className="down-stack">
        <TransitionGroup>
          {[
            <CSSTransition
              key={props.topCard?.id || ''}
              classNames="place-card"
              onEnter={(node: HTMLElement) => {
                node.style.transform = `translate(${x}vw, ${y}vh)`;
              }}
              onEntering={(node: HTMLElement) => {
                node.style.transform = '';
              }}
              timeout={300}>
              {props.topCard ? (
                <Card color={props.topCard.color} value={props.topCard.value} />
              ) : (
                <Card color="gray" value="empty" />
              )}
            </CSSTransition>
          ]}
        </TransitionGroup>
        <div className={`direction ${props.direction.toLowerCase()}`}>
          <svg
            width="18"
            height="62"
            viewBox="0 0 18 62"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16 60C-2.66666 44.6265 -2.66667 16.6747 16 2M16 2V6.5L11.5 2H16Z"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <svg
            width="18"
            height="62"
            viewBox="0 0 18 62"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16 60C-2.66666 44.6265 -2.66667 16.6747 16 2M16 2V6.5L11.5 2H16Z"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
      <div
        className={`up-stack${props.mustDraw ? ' highlight' : ''}`}
        onClick={props.draw}>
        <Card
          color="black"
          value="back"
          className={!props.canDraw ? 'disabled' : ''}
        />
        <div className="counter">{props.upStackSize}</div>
      </div>
    </div>
  );
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    topCard: state.l1.topCard,
    placement: (function () {
      const turnOrder = state.l1.turnOrder;
      const myIndex = turnOrder.indexOf(state.l2.id);
      const placementIndex = turnOrder.indexOf(state.l1.lastPlayBy!);
      if (placementIndex < 0) return null;
      return (
        ((placementIndex - myIndex + turnOrder.length) % turnOrder.length) /
        turnOrder.length
      );
    })(),
    canDraw: clientSelectors.canDraw(state),
    mustDraw: clientSelectors.mustDraw(state),
    upStackSize: state.l1.upStackSize,
    direction: state.l1.direction
  }),
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
    draw: () => dispatch(Req.actions.drawCard())
  })
)(Stacks);
