import * as React from 'react';
import { connect } from 'react-redux'

import { UnoSpec } from '..';
import { state } from '../../../types';
import Player from './Player';
import { selectors } from '../common';

import './Players.scss';

interface IProps {
  relativeTurnOrder: string[];
}

export function Players(props: IProps) {
  return <div className="players">
    {props.relativeTurnOrder.map((id, i) =>
      i > 0
        ? <Player
            key={id}
            id={id}
            angle={Math.PI * 2 * i / props.relativeTurnOrder.length} />
        : null
    )}
  </div>;
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    relativeTurnOrder: selectors.relativeTurnOrder(state)
  })
)(Players);
