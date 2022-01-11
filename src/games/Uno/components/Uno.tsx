import * as React from 'react';
import { connect } from 'react-redux';

import { state, UNSUPPORTED_VERSION_ERROR } from '../../../types';
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

function getBannerMessage(connected: boolean, error: unknown) {
  if (!connected) {
    return 'Connecting...';
  }

  if (error === UNSUPPORTED_VERSION_ERROR) {
    return 'Client is out of date. Refreshing...';
  }

  if (error) {
    return 'An error occured. Try refreshing the page.';
  }

  return '';
}

class Uno extends React.PureComponent<Props> {
  render() {
    return (
      <div className="uno-game">
        <Menu />
        <div className="banner">
          {getBannerMessage(this.props.connected, this.props.error)}
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
