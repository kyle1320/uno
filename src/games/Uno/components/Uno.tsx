import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { state, ClientGameActions } from '../../../types';
import { UnoSpec, Req, L3 } from '..';
import { Card as CardType } from '../common';
import CardWheel from './CardWheel';
import { Card, CardDefs } from './Card';

import './Uno.scss';
import Players from './Players';

interface Props {
  connected: boolean;
  upStackSize: number;
  downStackSize: number;
  topCard: CardType | null;
  name: string;

  setName: (name: string) => void;
  draw: () => void;
  resetGame: () => void;
}

class Uno extends React.PureComponent<Props> {
  private setName = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.setName(e.target.value);
  }

  render() {
    return <div className="uno-game">
      <div className="banner">{
        !this.props.connected ? "Disconnected" : ""
      }</div>
      <div className="infobar">
        <div>
          Your Name: <input type="text" value={this.props.name} onChange={this.setName} />
        </div>
        <button onClick={this.props.resetGame}>Reset Game</button>
      </div>
      <CardDefs />
      <div className="stacks">
        <div className="up-stack" onClick={this.props.draw}>
          <Card turned={true} color="black" value="back" />
          <div className="number"> {this.props.upStackSize}</div>
        </div>
        <div className="down-stack">
          {this.props.topCard
            ? <Card {...this.props.topCard} />
            : <Card color="gray" value="empty" />}
          <div className="number"> {this.props.downStackSize}</div>
        </div>
      </div>
      <Players />
      <CardWheel />
    </div>;
  }
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    connected: state.connected,
    upStackSize: state.l1.upStackSize,
    downStackSize: state.l1.downStackSize,
    topCard: state.l1.topCard,
    name: state.l3.name
  }),
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
    setName: (name: string) => dispatch(L3.actions.setName(name)),
    draw: () => dispatch(Req.actions.drawCard()),
    resetGame: () => dispatch(Req.actions.resetGame())
  })
)(Uno);