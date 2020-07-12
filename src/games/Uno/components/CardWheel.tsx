import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { Card as CardType } from '../common';
import { UnoSpec, Req } from '..';
import { state, ClientGameActions } from '../../../types';
import Card from './Card';

import './CardWheel.scss';

interface IProps {
  cards: CardType[];
  play: (index: number) => void;
}

export function CardWheel(props: IProps) {
  return <div className="card-wheel">{
    props.cards.map((card, i) =>
    <div className="card-wheel-wrapper">
      <Card
        key={i}
        color={card.color}
        value={card.value}
        onClick={props.play.bind(null, i)} />
    </div>
  )}</div>;
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    cards: state.l2.hand
  }),
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
    play: (index: number) => dispatch(Req.actions.playCard(index))
  })
)(CardWheel);
