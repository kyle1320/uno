import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ClientAppAction, ClientStoreState } from "@redux-mc/util";

import * as Uno from "../../spec";
import Player from "./Player";
import RoomLink from "./RoomLink";

import "./Players.scss";

interface IEmptyRoomProps {
  aiCount: number;
  setAiCount: (count: number) => void;
}
const EmptyRoomHint = connect(
  (state: ClientStoreState<Uno.Spec>) => ({
    aiCount: state.L1.rules.aiCount
  }),
  (dispatch: Dispatch<ClientAppAction<Uno.Spec>>) => ({
    setAiCount: (aiCount: number) => dispatch(Uno.Req.actions.updateRules({ aiCount }))
  })
)(function (props: IEmptyRoomProps) {
  const [copied, setCopied] = React.useReducer(() => true, false);

  return (
    <div className="no-players">
      <div className="no-players-heading">Nobody Else is Here</div>
      <div className="no-players-subheading">
        invite others to play using this link ({copied ? "copied" : "click to copy"}):
      </div>
      <RoomLink onCopy={setCopied} />
      <div className="no-players-subheading">
        Or, play against 1 or more AI players:
        <select value={props.aiCount} onChange={(e) => props.setAiCount(+e.target.value)}>
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
  const allPlayers: Record<string, JSX.Element> = {};

  props.relativeTurnOrder.forEach((id, i) => {
    if (i === 0) {
      return;
    }

    allPlayers[id] = <Player key={id} id={id} placement={i / props.relativeTurnOrder.length} />;
  });

  const sortedPlayers = props.relativeTurnOrder.slice(1).sort();

  return (
    <div className="players">
      {sortedPlayers.length > 0 ? sortedPlayers.map((id) => allPlayers[id]) : <EmptyRoomHint />}
    </div>
  );
}

export default connect((state: ClientStoreState<Uno.Spec>) => ({
  relativeTurnOrder: Uno.clientSelectors.relativeTurnOrder(state)
}))(Players);
