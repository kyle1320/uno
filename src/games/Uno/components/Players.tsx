import * as React from 'react';
import { connect } from 'react-redux';

import { UnoSpec } from '..';
import { state } from '../../../types';
import Player from './Player';
import { clientSelectors } from '../common';
import RoomLink from './RoomLink';

import './Players.scss';

interface IProps {
  relativeTurnOrder: string[];
}

export function Players(props: IProps) {
  const [copied, setCopied] = React.useReducer(() => true, false);

  return (
    <div className="players">
      {props.relativeTurnOrder.length > 1 ? (
        props.relativeTurnOrder.map((id, i) =>
          i > 0 ? (
            <Player
              key={id}
              id={id}
              placement={i / props.relativeTurnOrder.length}
            />
          ) : null
        )
      ) : (
        <div className="no-players">
          <div className="no-players-heading">Nobody Else is Here</div>
          <div className="no-players-subheading">
            invite others to play using this link (
            {copied ? 'copied' : 'click to copy'}):
          </div>
          <RoomLink onCopy={setCopied} />
        </div>
      )}
    </div>
  );
}

export default connect((state: state.ClientSide<UnoSpec>) => ({
  relativeTurnOrder: clientSelectors.relativeTurnOrder(state)
}))(Players);
