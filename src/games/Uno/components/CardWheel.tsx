import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { Card as CardType, Color } from '../common';
import { UnoSpec, Req } from '..';
import { state, ClientGameActions } from '../../../types';
import PlayableCard from './PlayableCard';

import './CardWheel.scss';
import ColorChooser from './ColorChooser';

interface IProps {
  cards: CardType[];
  sort: boolean;
  play: (cardId: number, color?: Color) => void;
}

interface IState {
  colorChooserId: number | null;
}

export class CardWheel extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      colorChooserId: null
    };
  }

  play = (id: number) => {
    const card = this.props.cards.find(c => c.id === id);
    if (!card) return;

    if (card.value === 'wild' || card.value === 'draw4') {
      this.setState({ colorChooserId: id });
    } else {
      this.props.play(id);
    }
  }

  playColor = (color: Color) => {
    this.props.play(this.state.colorChooserId as number, color);
    this.setState({ colorChooserId: null });
  }

  render() {
    const cards = this.props.sort
      ? this.props.cards.slice().sort((a, b) => a.id - b.id)
      : this.props.cards;
    console.log(cards);
    return <div className="card-wheel">
      <div className="card-wheel-container">
      {cards.map(card =>
        <PlayableCard
          key={card.id}
          card={card}
          play={this.play.bind(this, card.id)} />
      )}
      </div>
      { this.state.colorChooserId !== null
        ? <ColorChooser onSelect={this.playColor} />
        : null
      }
    </div>;
  }
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    cards: state.l2.hand,
    sort: state.l4.sortCards
  }),
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
    play: (cardId: number, color?: Color) => dispatch(Req.actions.playCard(cardId, color))
  })
)(CardWheel);
