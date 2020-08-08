import * as React from 'react';
import { connect } from 'react-redux';

import { UnoSpec, L1, L3, L4, Req } from '..';
import { state, ClientGameActions } from '../../../types';
import { clientSelectors } from '../common';

import './Info.scss';
import { Dispatch } from 'redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandPointUp } from '@fortawesome/free-solid-svg-icons';

interface IProps {
  gameStatus: L1.state.GameStatus;
  yourTurn: boolean;
  canCallUno: boolean;
  canCalloutUno: boolean;
  canPlayAny: boolean;

  resetGame: () => void;
  callUno: () => void;
  calloutUno: () => void;
}

export function Info(props: IProps) {
  switch (props.gameStatus) {
    case L1.state.GameStatus.Pregame:
      return (
        <div className="info">
          <span>Start a New Game to Play</span>
          <button onClick={props.resetGame}>New Game</button>
        </div>
      );
    case L1.state.GameStatus.Started:
      return (
        <div className="info">
          <span>{props.yourTurn && 'Your Turn'}</span>
          <div className="buttons">
            <button onClick={props.callUno} disabled={!props.canCallUno}>
              Call Uno!
            </button>
            <button onClick={props.calloutUno} disabled={!props.canCalloutUno}>
              <FontAwesomeIcon icon={faHandPointUp} /> Call Out
            </button>
          </div>
        </div>
      );
    case L1.state.GameStatus.Finished:
      return (
        <div className="info">
          <span>Game Over</span>
          <button onClick={props.resetGame}>New Game</button>
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
    canPlayAny: clientSelectors.canPlayAny(state)
  }),
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
    resetGame: () => dispatch(Req.actions.resetGame()),
    callUno: () => dispatch(Req.actions.callUno()),
    calloutUno: () => dispatch(Req.actions.calloutUno())
  })
)(Info);
