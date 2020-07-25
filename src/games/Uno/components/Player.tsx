import * as React from 'react';
import { connect } from 'react-redux';
import emojiRegex from 'emoji-regex';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';

import { UnoSpec, L1 } from '..';
import { state } from '../../../types';
import Card from './Card';
import { clientSelectors } from '../common';

import './Player.scss';

type IProps = {
  angle: number;
  isTurn: boolean;
} & L1.state.Player

function isSingleEmoji(s: string) {
  const match = s.match(emojiRegex());
  return match && match[0] === s;
}

export function Player(props: IProps) {
  // angles are relative to bottom, clockwise
  const x = 30 * Math.sin(props.angle);
  const y = 30 * Math.cos(props.angle);
  return <div className={`player${props.isTurn ? ' active' : ''}${props.isInGame ? '' : ' inactive'}`} style={{
    top: `calc(60% + ${y}vh)`,
    left: `calc(50% - ${x}vw)`
  }}>
    <div className="arrow"><FontAwesomeIcon icon={faArrowDown} /></div>
    <div className={`player-name${isSingleEmoji(props.name) ? ' large' : ''}`}>
      {props.name}
    </div>
    <TransitionGroup className="player-hand">
      {new Array(props.cards).fill(
        <CSSTransition
          classNames="card-slide"
          timeout={{
            enter: 300,
            exit: 0
          }}>
          <div className="card-wrapper"><Card value="back" color="black" /></div>
        </CSSTransition>
      )}
    </TransitionGroup>
  </div>;
}

export default connect(
  (state: state.ClientSide<UnoSpec>, props: { id: string }) => ({
    ...state.l1.players[props.id],
    isTurn: clientSelectors.currentPlayer(state) === props.id
  })
)(Player);
