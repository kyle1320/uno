import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { UnoSpec, L1 } from '..';
import { state, ClientGameActions } from '../../../types';

import './Players.scss';

interface IProps {
  id: string;
  turnOrder: string[];
  players: { [id: string]: L1.state.Player };
}

export function Players(props: IProps) {
  const myIndex = props.turnOrder.indexOf(props.id);
  const relativeTurnOrder = [
    ...props.turnOrder.slice(myIndex + 1),
    ...props.turnOrder.slice(0, myIndex),
  ]

  return <div className="players">
    {relativeTurnOrder.map(id => {
      const player = props.players[id];
      return <div>
        <b>{player.name}:</b> {player.cards} Card{player.cards === 1 ? '' : 's'}
      </div>;
    })}
  </div>;
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    id: state.l2.id,
    turnOrder: state.l1.turnOrder,
    players: state.l1.players
  }),
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
  })
)(Players);
