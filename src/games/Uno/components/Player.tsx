import * as React from 'react';
import { connect } from 'react-redux';
import emojiRegex from 'emoji-regex';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faUnlink, faRobot } from '@fortawesome/free-solid-svg-icons';

import { UnoSpec, L1 } from '..';
import { state } from '../../../types';
import Card from './Card';
import { clientSelectors, Card as CardType } from '../common';
import TurnTimer from './TurnTimer';

import './Player.scss';

type IProps = {
  placement: number;
  isTurn: boolean;
  showTurnTimer: boolean;
  hand?: CardType[];
} & L1.state.Player;

function isSingleEmoji(s: string) {
  const match = s.match(emojiRegex());
  return match && match[0] === s;
}

export function calculatePosition(
  percent: number,
  width = 35,
  height = 30
): [number, number] {
  percent *= 100;
  if (percent === 0 || percent === 100) return [0, height];
  if (percent < 20) {
    return [-width, -(percent - 20) * (height / 20)];
  } else if (percent < 80) {
    const angle = (Math.PI * (percent - 20)) / 60;
    const x = -width * Math.cos(angle);
    const y = -height * Math.sin(angle);
    return [x, y];
  } else {
    return [width, (percent - 80) * (height / 20)];
  }
}

export function Player(props: IProps) {
  const [x, y] = calculatePosition(props.placement);

  return (
    <div
      className={`player-container${props.isTurn ? ' active' : ''}`}
      style={{
        top: `calc(60% + ${y}vh)`,
        left: `calc(50% + ${x}vw)`
      }}>
      <div className="arrow">
        <FontAwesomeIcon icon={faArrowDown} />
      </div>
      {props.isTurn && props.showTurnTimer && (
        <div className="turn-timer">
          <TurnTimer />
        </div>
      )}
      <div
        className={`player${props.isTurn ? ' active' : ''}${props.isInGame ? '' : ' inactive'
          }${props.connected ? '' : ' disconnected'}`}>
        <div
          className={`player-name${isSingleEmoji(props.name) ? ' large' : ''}`}>
          {props.isAI && <FontAwesomeIcon className="ai-badge" icon={faRobot} />}
          {props.name}
        </div>
        <TransitionGroup className="player-hand">
          {(
            props.hand ||
            new Array<CardType>(props.cards).fill({
              value: 'back' as any,
              color: 'black',
              id: -1
            })
          ).map((card, i) => (
            <CSSTransition
              key={i}
              classNames="card-slide"
              timeout={{
                enter: 300,
                exit: 0
              }}>
              <div className="card-wrapper">
                <Card value={card.value} color={card.color} />
                {!props.hand && i === props.cards - 1 ? (
                  <div className="card-count">{props.cards}</div>
                ) : null}
              </div>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>
      {!props.connected && (
        <div className="disconnected-icon">
          <FontAwesomeIcon icon={faUnlink} />
        </div>
      )}
    </div>
  );
}

export default connect(
  (state: state.ClientSide<UnoSpec>, props: { id: string }) => ({
    ...state.l1.players[props.id],
    isTurn: clientSelectors.currentPlayer(state) === props.id,
    showTurnTimer: clientSelectors.turnTimerActive(state),
    hand: state.l1.shownHands?.[props.id]
  })
)(Player);
