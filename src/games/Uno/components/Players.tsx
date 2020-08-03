import * as React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone } from '@fortawesome/free-solid-svg-icons';

import { UnoSpec } from '..';
import { state } from '../../../types';
import Player from './Player';
import { clientSelectors } from '../common';

import './Players.scss';

interface IProps {
  relativeTurnOrder: string[];
}

function getRoomLink() {
  return `${location.protocol}//${location.hostname}${location.pathname}`;
}

function copyRoomLink() {
  navigator.clipboard.writeText(getRoomLink());
}

export function Players(props: IProps) {
  const [copied, setCopied] = React.useState(false);
  const copy = React.useCallback(() => {
    copyRoomLink();
    setCopied(true);
  }, [setCopied]);

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
            invite others to play using this link{copied ? ' (copied)' : ''}:
          </div>
          <div
            className="no-players-link-wrapper"
            onClick={copy}
            title="Copy Link">
            <div className="no-players-link">{getRoomLink()}</div>
            <FontAwesomeIcon icon={faClone} />
          </div>
        </div>
      )}
    </div>
  );
}

export default connect((state: state.ClientSide<UnoSpec>) => ({
  relativeTurnOrder: clientSelectors.relativeTurnOrder(state)
}))(Players);
