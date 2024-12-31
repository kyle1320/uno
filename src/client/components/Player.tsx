import * as React from "react";
import { connect } from "react-redux";
import emojiRegex from "emoji-regex";
import { ClientStoreState } from "redux-mc/util";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faUnlink, faRobot } from "@fortawesome/free-solid-svg-icons";

import * as Uno from "../../spec";
import Card from "./Card";
import TurnTimer from "./TurnTimer";

import "./Player.scss";

type IProps = {
  placement: number;
  isTurn: boolean;
  showTurnTimer: boolean;
  hand?: Uno.Card[];
  fixedPos?: [number, number];
} & Uno.L1.Player;

function getNameClassForEmoji(s: string) {
  const re = emojiRegex();

  const allMatches: string[] = [];
  let match: RegExpMatchArray | null = null;
  while ((match = re.exec(s)) !== null && allMatches.length < 3) {
    allMatches.push(match[0]);
  }

  if (s === allMatches.join("")) {
    if (allMatches.length === 1) {
      return "large";
    } else if (allMatches.length === 2) {
      return "medium";
    } else if (allMatches.length === 3) {
      return "small";
    }
  }

  return "";
}

export function calculatePosition(percent: number, width = 35, height = 30): [number, number] {
  percent *= 100;
  if (percent <= 0 || percent >= 100) return [0, height];
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

export function calculatePositionInverse(x: number, y: number, width = 35, height = 30) {
  if (y > height) {
    y = height;
  }
  let pos = 0;
  if (y >= 0) {
    if (x > 0) {
      pos = 80 + (y / height) * 20;
    } else {
      pos = 20 - (y / height) * 20;
    }
  } else {
    const angle = Math.atan2(-y / height, -x / width);
    pos = (angle * 60) / Math.PI + 20;
  }
  return pos;
}

export function Player(props: IProps) {
  const [x, y] = calculatePosition(props.placement);

  return (
    <div
      className={`player-container${props.isTurn ? " active" : ""}`}
      data-player-id={props.id}
      style={
        props.fixedPos
          ? {
              position: "fixed",
              transition: "none",
              top: `${props.fixedPos[1]}px`,
              left: `${props.fixedPos[0]}px`
            }
          : {
              top: `calc(60% + ${y}vh)`,
              left: `calc(50% + ${x}vw)`
            }
      }
    >
      <div className="arrow">
        <FontAwesomeIcon icon={faArrowDown} />
      </div>
      {props.isTurn && props.showTurnTimer && (
        <div className="turn-timer">
          <TurnTimer />
        </div>
      )}
      <div
        className={`player${props.isTurn ? " active" : ""}${props.isInGame ? "" : " inactive"}${
          props.connected ? "" : " disconnected"
        }`}
      >
        <div className={`player-name ${getNameClassForEmoji(props.name)}`}>
          {props.isAI && <FontAwesomeIcon className="ai-badge" icon={faRobot} />}
          {props.name}
        </div>
        <TransitionGroup className="player-hand">
          {(
            props.hand ||
            new Array<Uno.Card>(props.cards).fill({
              value: "back" as any,
              color: "black",
              id: -1
            })
          ).map((card, i) => (
            <CSSTransition
              key={i}
              classNames="card-slide"
              timeout={{
                enter: 300,
                exit: 0
              }}
            >
              <div className="card-wrapper">
                <Card value={card.value} color={card.color} />
                {!props.hand && i === props.cards - 1 ? <div className="card-count">{props.cards}</div> : null}
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

export default connect((state: ClientStoreState<Uno.Spec>, props: { id: string }) => ({
  ...state.L1.players[props.id],
  isTurn: Uno.clientSelectors.currentPlayer(state) === props.id,
  showTurnTimer: Uno.clientSelectors.turnTimerActive(state),
  hand: state.L1.shownHands?.[props.id]
}))(Player);
