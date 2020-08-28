import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { Card as CardType, Color, clientSelectors } from '../common';
import { UnoSpec, Req } from '..';
import { state, ClientGameActions } from '../../../types';
import PlayableCard from './PlayableCard';
import ColorChooser from './ColorChooser';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import './CardWheel.scss';

interface IProps {
  cards: CardType[];
  sort: boolean;
  yourTurn: boolean;
  play: (cardId: number, color?: Color) => void;
}

interface IState {
  colorChooserId: number | null;
}

function toNum(value: any, def: number) {
  const num = +value;
  if (num !== num) return def;
  return num;
}
function order(card: CardType) {
  const color = (() => {
    switch (card.color) {
      case 'red':
        return 0;
      case 'yellow':
        return 1;
      case 'green':
        return 2;
      case 'blue':
        return 3;
      default:
        return 4;
    }
  })();
  const value = (() => {
    switch (card.value) {
      case 'reverse':
        return 10;
      case 'skip':
        return 11;
      case 'draw2':
        return 12;
      case 'wild':
        return 13;
      case 'draw4':
        return 14;
      default:
        return toNum(card.value, 15);
    }
  })();
  return color * 16 + value;
}

export class CardWheel extends React.PureComponent<IProps, IState> {
  private container: React.RefObject<HTMLDivElement>;

  constructor(props: IProps) {
    super(props);
    this.container = React.createRef();
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
  };

  playColor = (color: Color) => {
    this.props.play(this.state.colorChooserId as number, color);
    this.setState({ colorChooserId: null });
  };

  closeChooser = () => {
    this.setState({ colorChooserId: null });
  };

  static getDerivedStateFromProps(props: IProps, state: IState) {
    const id = state.colorChooserId;
    if (id && !props.cards.some(c => c.id === id)) {
      return { colorChooserId: null };
    }
    return null;
  }

  componentDidUpdate(prevProps: IProps) {
    const container = this.container.current;
    if (this.props.yourTurn && !prevProps.yourTurn && container) {
      const bounds = container.getBoundingClientRect();

      let minDist: number = Infinity;
      let closestCard: Element | null = null;
      for (const card of this.props.cards) {
        const el = container.querySelector(
          `.enabled[data-card-id="${card.id}"]`
        );

        if (el) {
          const dimens = el.getBoundingClientRect();
          const dist = Math.max(
            bounds.left - dimens.right,
            dimens.left - bounds.right
          );

          if (dist < minDist) {
            minDist = dist;
            closestCard = el;
          }
        }
      }

      if (closestCard && minDist >= 0) {
        closestCard.scrollIntoView({
          behavior: 'smooth',
          inline: 'center'
        });
      }
    }
  }

  render() {
    const cards = this.props.sort
      ? this.props.cards.slice().sort((a, b) => order(a) - order(b))
      : this.props.cards;
    return (
      <div className={`card-wheel${this.props.yourTurn ? ' active' : ''}`}>
        <div className="card-wheel-container" ref={this.container}>
          <TransitionGroup component={null}>
            {cards.map(card => (
              <CSSTransition
                key={card.id}
                classNames="card-pickup"
                timeout={{
                  enter: 3000,
                  exit: 0
                }}>
                <PlayableCard
                  card={card}
                  play={this.play.bind(this, card.id)}
                />
              </CSSTransition>
            ))}
          </TransitionGroup>
        </div>
        <div className="counter">{cards.length}</div>
        {this.state.colorChooserId !== null ? (
          <ColorChooser onSelect={this.playColor} onClose={this.closeChooser} />
        ) : null}
      </div>
    );
  }
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    cards: state.l2.hand,
    sort: state.l4.settings.sortCards,
    yourTurn: clientSelectors.isYourTurn(state)
  }),
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
    play: (cardId: number, color?: Color) =>
      dispatch(Req.actions.playCard(cardId, color))
  })
)(CardWheel);
