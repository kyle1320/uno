import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ClientAppAction, ClientStoreState } from "redux-mc/util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandPointUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";

import * as Uno from "../../spec";
import TurnTimer from "./TurnTimer";

import "./Info.scss";

interface IProps {
  gameStatus: Uno.L1.GameStatus;
  yourTurn: boolean;
  canCallUno: boolean;
  canCalloutUno: boolean;
  canPlayAny: boolean;
  showTurnTimer: boolean;
  canShufflePlayers: boolean;

  resetGame: () => void;
  shufflePlayers: () => void;
  callUno: () => void;
  calloutUno: () => void;
}

export function Info(props: IProps) {
  switch (props.gameStatus) {
    case Uno.L1.GameStatus.Pregame:
      return (
        <div className="info">
          <span className="info-text">Start a New Game to Play</span>
          <div className="buttons">
            <div className="stack">
              <button onClick={props.resetGame}>New Game</button>
              {props.canShufflePlayers && <button onClick={props.shufflePlayers}>Shuffle Players</button>}
            </div>
          </div>
        </div>
      );
    case Uno.L1.GameStatus.Started:
      return (
        <div className="info">
          <span className="info-text">{props.yourTurn && "Your Turn"}</span>
          {props.yourTurn && (
            <div className="center">
              <div className="arrow">
                <FontAwesomeIcon icon={faArrowDown} />
              </div>
              {props.showTurnTimer && <TurnTimer />}
            </div>
          )}
          <div className="buttons">
            <div className="stack">
              <button onClick={props.callUno} disabled={!props.canCallUno}>
                Say Uno!
              </button>
              <button onClick={props.calloutUno} disabled={!props.canCalloutUno}>
                <FontAwesomeIcon icon={faHandPointUp} /> Call Out
              </button>
            </div>
          </div>
        </div>
      );
    case Uno.L1.GameStatus.Finished:
      return (
        <div className="info">
          <span className="info-text">Game Over</span>
          <div className="buttons">
            <div className="stack">
              <button onClick={props.resetGame}>New Game</button>
              {props.canShufflePlayers && <button onClick={props.shufflePlayers}>Shuffle Players</button>}
            </div>
          </div>
        </div>
      );
  }
}

export default connect(
  (state: ClientStoreState<Uno.Spec>) => ({
    gameStatus: state.L1.status,
    yourTurn: Uno.clientSelectors.isYourTurn(state),
    canCallUno: Uno.clientSelectors.canCallUno(state),
    canCalloutUno: Uno.clientSelectors.canCalloutUno(state),
    canPlayAny: Uno.clientSelectors.canPlayAny(state),
    showTurnTimer: Uno.clientSelectors.turnTimerActive(state),
    canShufflePlayers: Uno.clientSelectors.canShufflePlayers(state)
  }),
  (dispatch: Dispatch<ClientAppAction<Uno.Spec>>) => ({
    resetGame: () => dispatch(Uno.Req.actions.resetGame({ shufflePlayers: false })),
    shufflePlayers: () => dispatch(Uno.Req.actions.shufflePlayers()),
    callUno: () => dispatch(Uno.Req.actions.callUno()),
    calloutUno: () => dispatch(Uno.Req.actions.calloutUno())
  })
)(Info);
