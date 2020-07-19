import * as React from 'react';

import { Card as CardType } from '../common';
import Card from './Card';

interface IProps {
  card: CardType;
  play: () => void;
}

interface IState {
  focused: boolean;
}

export default class PlayableCard extends React.PureComponent<IProps, IState> {
  private ref = React.createRef<HTMLDivElement>();

  public constructor(props: IProps) {
    super(props);
    this.state = {
      focused: false
    };
  }

  private play = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.play();
  }

  componentDidMount() {
    this.ref.current?.scrollIntoView({
      behavior: "smooth",
      inline: "nearest"
    });
  }

  render() {
    return <div
      ref={this.ref}
      className={`playable-card${this.state.focused ? ' focus' : ''}`}
      onClick={this.play}>
      <Card {...this.props.card} onClick={this.play} />
    </div>;
  }
}
