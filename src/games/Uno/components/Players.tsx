import * as React from 'react';
import { connect } from 'react-redux'

import { UnoSpec } from '..';
import { state } from '../../../types';
import Player from './Player';

import './Players.scss';

interface IProps {
  id: string;
  turnOrder: string[];
}

export function Players(props: IProps) {
  const myIndex = props.turnOrder.indexOf(props.id);
  const relativeTurnOrder = [
    ...props.turnOrder.slice(myIndex + 1),
    ...props.turnOrder.slice(0, myIndex),
  ]

  return <div className="players">
    {relativeTurnOrder.map((id, i) =>
      <Player id={id} angle={Math.PI * 2 * (i+1) / props.turnOrder.length} />
    )}
  </div>;
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    id: state.l2.id,
    turnOrder: state.l1.turnOrder
  })
)(Players);
