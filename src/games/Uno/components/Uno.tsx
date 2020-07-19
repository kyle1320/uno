import * as React from 'react';
import { connect } from 'react-redux';

import { state } from '../../../types';
import { UnoSpec } from '..';
import { Card as CardType } from '../common';
import CardWheel from './CardWheel';
import { CardDefs } from './Card';
import Menu from './Menu';
import Players from './Players';
import Stacks from './Stacks';

import './Uno.scss';

interface Props {
  connected: boolean;
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
        <Stacks />
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
    connected: state.connected
  })
)(Uno);