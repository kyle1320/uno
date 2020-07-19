import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { state, ClientGameActions } from '../../../types';
import { UnoSpec, Req, L3 } from '..';
import { Card as CardType } from '../common';
import CardWheel from './CardWheel';
import { Card, CardDefs } from './Card';
import Menu from './Menu';

import './Uno.scss';
import Players from './Players';

interface Props {
  connected: boolean;
  upStackSize: number;
  downStackSize: number;
  topCard: CardType | null;

  draw: () => void;
}

class Uno extends React.PureComponent<Props> {
  render() {
    return <div className="uno-game">
      <Menu />
      <div className="banner">{
        !this.props.connected ? "Disconnected" : ""
      }</div>
      <div className="table">
        <CardDefs />
        <div className="stacks">
          <div className="down-stack">
            {this.props.topCard
              ? <Card {...this.props.topCard} />
              : <Card color="gray" value="empty" />}
            <div className="number"> {this.props.downStackSize}</div>
          </div>
          <div className="up-stack" onClick={this.props.draw}>
            <Card turned={true} color="black" value="back" />
            <div className="number"> {this.props.upStackSize}</div>
          </div>
        </div>
        <Players />
      </div>
      <div className="hand">
        <CardWheel />
      </div>
    </div>;
  }
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    connected: state.connected,
    upStackSize: state.l1.upStackSize,
    downStackSize: state.l1.downStackSize,
    topCard: state.l1.topCard
  }),
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
    draw: () => dispatch(Req.actions.drawCard())
  })
)(Uno);