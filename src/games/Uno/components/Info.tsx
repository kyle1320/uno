import * as React from 'react';
import { connect } from 'react-redux'

import { UnoSpec, L1 } from '..';
import { state } from '../../../types';
import { clientSelectors } from '../common';

import './Info.scss';

interface IProps {
  ruleState: L1.state.RuleState;
  yourTurn: boolean;
}

function getInfoMessage(ruleState: L1.state.RuleState, yourTurn: boolean) {
  if (!yourTurn) return null;
  switch (ruleState.type) {
    case 'draw2':
    case 'draw4':
    case 'draw':
      return `Draw ${ruleState.count} card${ruleState.count === 1 ? '' : 's'}`;
    default:
      return 'Your Turn';
  }
}

export function Info(props: IProps) {
  return <div className="info">
    {getInfoMessage(props.ruleState, props.yourTurn)}
  </div>;
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    ruleState: state.l1.ruleState,
    yourTurn: clientSelectors.isYourTurn(state)
  })
)(Info);
