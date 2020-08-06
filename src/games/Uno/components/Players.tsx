import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { UnoSpec, Req } from '..';
import { state, ClientGameActions } from '../../../types';
import Player from './Player';
import { clientSelectors } from '../common';
import RoomLink from './RoomLink';

import './Players.scss';

interface IEmptyRoomProps {
  aiCount: number;
  setAiCount: (count: number) => void;
}
const EmptyRoomHint = connect(
  (state: state.ClientSide<UnoSpec>) => ({
    aiCount: state.l1.rules.aiCount
  }),
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
    setAiCount: (aiCount: number) =>
      dispatch(Req.actions.updateRules({ aiCount }))
  })
)(function (props: IEmptyRoomProps) {
  const [copied, setCopied] = React.useReducer(() => true, false);

  return (
    <div className="no-players">
      <div className="no-players-heading">Nobody Else is Here</div>
      <div className="no-players-subheading">
        invite others to play using this link (
        {copied ? 'copied' : 'click to copy'}):
      </div>
      <RoomLink onCopy={setCopied} />
      <div className="no-players-subheading">
        Or, play against 1 or more AI players:
        <select
          value={props.aiCount}
          onChange={React.useCallback(e => props.setAiCount(+e.target.value), [
            props.setAiCount
          ])}>
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </div>
    </div>
  );
});

interface IProps {
  relativeTurnOrder: string[];
}

export function Players(props: IProps) {
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
        <EmptyRoomHint />
      )}
    </div>
  );
}

export default connect((state: state.ClientSide<UnoSpec>) => ({
  relativeTurnOrder: clientSelectors.relativeTurnOrder(state)
}))(Players);
