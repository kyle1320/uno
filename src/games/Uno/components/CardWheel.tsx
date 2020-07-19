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
  play: (index: number, color?: Color) => void;
}

interface IState {
  colorChooserIndex: number | null;
}

export class CardWheel extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      colorChooserIndex: null
    };
  }

  play = (index: number) => {
    const card = this.props.cards[index];
    if (card.value === 'wild' || card.value === 'draw4') {
      this.setState({ colorChooserIndex: index });
    } else {
      this.props.play(index);
    }
  }

  playColor = (color: Color) => {
    this.props.play(this.state.colorChooserIndex as number, color);
    this.setState({ colorChooserIndex: null });
  }

  render() {
    return <div className="card-wheel">
      <div className="card-wheel-container">
      {this.props.cards.map((card, i) =>
        <PlayableCard
          key={card.id}
          card={card}
          play={this.play.bind(this, i)} />
      )}
      </div>
      { this.state.colorChooserIndex !== null
        ? <ColorChooser onSelect={this.playColor} />
        : null
      }
    </div>;
  }
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    cards: state.l2.hand
  }),
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
    play: (index: number, color?: Color) => dispatch(Req.actions.playCard(index, color))
  })
)(CardWheel);
