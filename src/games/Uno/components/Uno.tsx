import * as React from 'react';
import { connect } from 'react-redux';

import { state } from '../../../types';
import { UnoSpec } from '..';
import CardWheel from './CardWheel';
import Menu from './Menu';
import Players from './Players';
import Stacks from './Stacks';
import Info from './Info';
import Toasts from './Toasts';
import Fireworks from './Fireworks';

import './Uno.scss';

interface Props {
  connected: boolean;
  error: any;
  didWin: boolean;
}

class Uno extends React.PureComponent<Props> {
  render() {
    return (
      <div className="uno-game">
        <Menu />
        <div className="banner">
          {!this.props.connected
            ? 'Connecting...'
            : this.props.error
            ? 'An error occured. Try refreshing the page.'
            : ''}
        </div>
        <div className="table">
          <Toasts />
          <Stacks />
          <Players />
          <Info />
          <Fireworks show={this.props.didWin} />
        </div>
        <div className="hand">
          <CardWheel />
        </div>
      </div>
    );
  }
}

export default connect((state: state.ClientSide<UnoSpec>) => ({
  connected: state.connected,
  error: state.error,
  didWin: state.l4.didWin
}))(Uno);
