import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandPointUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

import { UnoSpec, L1, Req } from '..';
import { state, ClientGameActions } from '../../../types';
import { clientSelectors } from '../common';
import TurnTimer from './TurnTimer';

import './Info.scss';

interface IProps {
  gameStatus: L1.state.GameStatus;
  yourTurn: boolean;
  canCallUno: boolean;
  canCalloutUno: boolean;
  canPlayAny: boolean;
  showTurnTimer: boolean;

  resetGame: () => void;
  callUno: () => void;
  calloutUno: () => void;
}

export function Info(props: IProps) {
  switch (props.gameStatus) {
    case L1.state.GameStatus.Pregame:
      return (
        <div className="info">
          <span className="info-text">Start a New Game to Play</span>
          <div className="buttons">
            <button onClick={props.resetGame}>New Game</button>
          </div>
        </div>
      );
    case L1.state.GameStatus.Started:
      return (
        <div className="info">
          <span className="info-text">{props.yourTurn && 'Your Turn'}</span>
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
                Call Uno!
              </button>
              <button
                onClick={props.calloutUno}
                disabled={!props.canCalloutUno}>
                <FontAwesomeIcon icon={faHandPointUp} /> Call Out
              </button>
            </div>
          </div>
        </div>
      );
    case L1.state.GameStatus.Finished:
      return (
        <div className="info">
          <span className="info-text">Game Over</span>
          <div className="buttons">
            <button onClick={props.resetGame}>New Game</button>
          </div>
        </div>
      );
  }
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    gameStatus: state.l1.status,
    yourTurn: clientSelectors.isYourTurn(state),
    canCallUno: clientSelectors.canCallUno(state),
    canCalloutUno: clientSelectors.canCalloutUno(state),
    canPlayAny: clientSelectors.canPlayAny(state),
    showTurnTimer: clientSelectors.turnTimerActive(state)
  }),
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
    resetGame: () => dispatch(Req.actions.resetGame()),
    callUno: () => dispatch(Req.actions.callUno()),
    calloutUno: () => dispatch(Req.actions.calloutUno())
  })
)(Info);
