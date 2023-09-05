import * as React from "react";
import { connect } from "react-redux";
import { ClientStoreState } from "@redux-mc/util";

import * as Uno from "../../spec";
import Card from "./Card";

interface IProps {
  card: Uno.Card;
  play: () => void;
  canPlay: boolean;
}

interface IState {
  focused: boolean;
}

export class PlayableCard extends React.PureComponent<IProps, IState> {
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
    if (this.props.canPlay) {
      this.props.play();
    }
  };

  componentDidMount() {
    this.ref.current?.scrollIntoView({
      behavior: "smooth",
      inline: "nearest"
    });
  }

  render() {
    return (
      <div
        ref={this.ref}
        className={`playable-card${this.state.focused ? " focus" : ""}${this.props.canPlay ? " enabled" : ""}`}
        data-card-id={String(this.props.card.id)}
        onClick={this.play}
      >
        <Card
          color={this.props.card.color}
          value={this.props.card.value}
          className={this.props.canPlay ? "" : "disabled"}
          onClick={this.play}
        />
      </div>
    );
  }
}

export default connect((state: ClientStoreState<Uno.Spec>, props: { card: Uno.Card }) => ({
  canPlay: Uno.clientSelectors.canPlay(state, props.card.id)
}))(PlayableCard);
