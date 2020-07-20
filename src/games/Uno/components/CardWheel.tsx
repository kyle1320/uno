import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { Card as CardType, Color } from '../common';
import { UnoSpec, Req } from '..';
import { state, ClientGameActions } from '../../../types';
import PlayableCard from './PlayableCard';
import ColorChooser from './ColorChooser';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import './CardWheel.scss';

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
    return <div className="card-wheel">
      <TransitionGroup className="card-wheel-container">
        {cards.map(card =>
          <CSSTransition
            key={card.id}
            classNames="card-pickup"
            timeout={{
              enter: 3000,
              exit: 0
            }}>
            <PlayableCard
              card={card}
              play={this.play.bind(this, card.id)} />
          </CSSTransition>
        )}
      </TransitionGroup>
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
