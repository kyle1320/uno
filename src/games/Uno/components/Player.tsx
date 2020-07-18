import * as React from 'react';
import { connect } from 'react-redux';

import { UnoSpec } from '..';
import { state } from '../../../types';

import './Player.scss';
import Card from './Card';

interface IProps {
  id: string;
  angle: number;
  name: string;
  cards: number;
}

export function Player(props: IProps) {
  // angles are relative to bottom, clockwise
  const x = 30 * Math.sin(props.angle);
  const y = 30 * Math.cos(props.angle);
  return <div className="player" style={{
    top: `calc(60% + ${y}vh)`,
    left: `calc(50% - ${x}vw)`
  }}>
    <b>{props.name}</b>
    <div className="player-hand">
      {new Array(props.cards).fill(<div className="card-wrapper"><Card value="back" color="black" /></div>)}
    </div>
  </div>;
}

export default connect(
  (state: state.ClientSide<UnoSpec>, props: { id: string }) => ({
    name: state.l1.players[props.id].name,
    cards: state.l1.players[props.id].cards
  })
)(Player);
