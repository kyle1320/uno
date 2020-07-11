import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { state, ClientGameActions } from '../../../types';
import { UnoSpec, L3, Req } from '..';
import { Card as CardType } from '../common';
import CardWheel from './CardWheel';
import Card from './Card';
import CardDefs from './CardDefs';

import './Uno.scss';

interface Props {
  cards: CardType[];
  upStackSize: number;
  downStackSize: number;
  topCard: CardType | null;
  draw: () => void;
  play: (index: number) => void;
}

class Uno extends React.PureComponent<Props> {
  render() {
    return <div className="uno-game">
      <CardDefs />
      <div className="up-stack" onClick={this.props.draw}>
        <Card color="black" value="back" />
        <div className="number"> {this.props.upStackSize}</div>
      </div>
      <div className="down-stack">
        {this.props.topCard
          ? <Card {...this.props.topCard} />
          : <Card color="black" value="back" />}
        <div className="number"> {this.props.downStackSize}</div>
      </div>
      <CardWheel>
        {this.props.cards.map((card, i) =>
          <Card key={i} color={card.color} value={card.value} onClick={this.props.play.bind(null, i)} />
        )}
      </CardWheel>
    </div>;
  }
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    upStackSize: state.l1.upStackSize,
    downStackSize: state.l1.downStackSize,
    topCard: state.l1.topCard,
    cards: state.l2.hand
  }),
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
    draw: () => dispatch(Req.actions.drawCard()),
    play: (index: number) => dispatch(Req.actions.playCard(index))
  })
)(Uno);