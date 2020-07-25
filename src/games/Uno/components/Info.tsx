import * as React from 'react';
import { connect } from 'react-redux'

import { UnoSpec, L1, L3, L4, Req } from '..';
import { state, ClientGameActions } from '../../../types';
import { clientSelectors } from '../common';

import './Info.scss';
import { Dispatch } from 'redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandPointUp } from '@fortawesome/free-solid-svg-icons';

interface IProps {
  gameStatus: L1.state.GameStatus;
  ruleState: L1.state.RuleState;
  yourTurn: boolean;
  resetGame: () => void;
  callUno: () => void;
  calloutUno: () => void;
}

export function Info(props: IProps) {
  switch (props.gameStatus) {
    case L1.state.GameStatus.Pregame:
      return <div className="info">
        <span>Start a New Game to Play</span>
        <button onClick={props.resetGame}>New Game</button>
      </div>;
    case L1.state.GameStatus.Started:
      return <div className="info">
        <span>{(() => {
          if (!props.yourTurn) return null;
          switch (props.ruleState.type) {
            case 'draw2':
            case 'draw4':
            case 'draw':
              return `Draw ${props.ruleState.count} card${props.ruleState.count === 1 ? '' : 's'}`;
            default:
              return 'Your Turn';
          }
        })()}</span>
        <button onClick={props.callUno}>Call Uno!</button>
        <button onClick={props.calloutUno}><FontAwesomeIcon icon={faHandPointUp} /> Call Out</button>
      </div>;
    case L1.state.GameStatus.Finished:
      return <div className="info">
        <span>Game Over</span>
        <button onClick={props.resetGame}>New Game</button>
      </div>;
  }
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    gameStatus: state.l1.status,
    ruleState: state.l1.ruleState,
    yourTurn: clientSelectors.isYourTurn(state)
  }),
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
    resetGame: () => dispatch(Req.actions.resetGame()),
    callUno: () => dispatch(Req.actions.callUno()),
    calloutUno: () => dispatch(Req.actions.calloutUno())
  })
)(Info);
