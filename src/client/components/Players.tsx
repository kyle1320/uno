import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ClientAppAction, ClientStoreState } from "redux-mc/util";

import * as Uno from "../../spec";
import Player, { calculatePositionInverse } from "./Player";
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
  myId: string;
  relativeTurnOrder: string[];
  canMovePlayers: boolean;

  reorder: (order: string[]) => void;
}

interface IDragInfo {
  playerId: string;
  relX: number;
  relY: number;
  pos: [number, number];
  newOrder?: string[];
}

export function Players(props: IProps) {
  const allPlayers: Record<string, JSX.Element> = {};
  const [dragInfo, setDragInfo] = React.useState<IDragInfo | null>(null);

  React.useEffect(() => {
    if (!props.canMovePlayers) {
      return;
    }

    const cancelDrag = () => {
      setDragInfo(null);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (e.isPrimary && e.target instanceof HTMLElement) {
        const playerEl = e.target.closest<HTMLElement>("[data-player-id]");
        const playerId = playerEl?.dataset.playerId;
        if (playerId) {
          e.preventDefault();
          e.stopPropagation();
          const { top, left, width, height } = playerEl.getBoundingClientRect();
          setDragInfo({
            playerId,

            // Players are positioned around their center point. Calculate the offset to the center.
            relX: e.clientX - (left + width * 0.5),
            relY: e.clientY - (top + height * 0.5),
            pos: [e.clientX, e.clientY]
          });
        }
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.isPrimary && e.buttons) {
        setDragInfo((dragInfo) => {
          if (dragInfo) {
            e.preventDefault();
            e.stopPropagation();
            return {
              ...dragInfo,
              pos: [e.clientX, e.clientY]
            };
          }
          return dragInfo;
        });
      }
    };
    const onPointerUp = (e: PointerEvent) => {
      if (e.isPrimary) {
        setDragInfo((dragInfo) => {
          if (dragInfo && dragInfo.newOrder) {
            e.preventDefault();
            e.stopPropagation();
            props.reorder(dragInfo.newOrder);
          }
          return null;
        });
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointerleave", cancelDrag);
    window.addEventListener("pointercancel", cancelDrag);

    return () => {
      setDragInfo(null);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointerleave", cancelDrag);
      window.removeEventListener("pointercancel", cancelDrag);
    };
  }, [setDragInfo, props.canMovePlayers, props.reorder]);

  let turnOrder = props.relativeTurnOrder.slice();
  if (dragInfo) {
    const table = document.querySelector(".table");
    if (table) {
      // Determine the new order based on the drag position.
      // This is closely tied to the positioning logic in Player.tsx.
      // TODO: consolidate this logic into one place.
      const { top, left, width, height } = table.getBoundingClientRect();
      const relX = dragInfo.pos[0] - (left + width * 0.5);
      const relY = dragInfo.pos[1] - (top + height * 0.6);
      const pctX = (relX * 100) / window.innerWidth;
      const pctY = (relY * 100) / window.innerHeight;
      const pos = calculatePositionInverse(pctX, pctY);

      const newIndex = Math.max(1, Math.min(turnOrder.length - 1, Math.round((pos * turnOrder.length) / 100)));
      const playerIndex = turnOrder.indexOf(dragInfo.playerId);
      turnOrder.splice(playerIndex, 1);
      turnOrder.splice(newIndex, 0, dragInfo.playerId);

      // Note that we're modifying the state object here rather than updating it...
      // We don't need a re-render, but need a place to store the new order until the drag ends.
      // This could maybe be stored in a ref, or calculated in the drag events, but this works.
      dragInfo.newOrder = turnOrder;

      // Make sure we're always at the front of the turn order.
      const myIndex = turnOrder.indexOf(props.myId);
      turnOrder = [...turnOrder.slice(myIndex), ...turnOrder.slice(0, myIndex)];
    }
  }

  turnOrder.forEach((id, i) => {
    if (i === 0) {
      return;
    }

    allPlayers[id] = (
      <Player
        key={id}
        id={id}
        fixedPos={
          dragInfo && dragInfo.playerId === id
            ? [dragInfo.pos[0] - dragInfo.relX, dragInfo.pos[1] - dragInfo.relY]
            : undefined
        }
        placement={i / props.relativeTurnOrder.length}
      />
    );
  });

  const sortedPlayers = turnOrder.slice(1).sort();

  return (
    <div className="players">
      {sortedPlayers.length > 0 ? sortedPlayers.map((id) => allPlayers[id]) : <EmptyRoomHint />}
    </div>
  );
}

export default connect(
  (state: ClientStoreState<Uno.Spec>) => ({
    myId: state.meta.id,
    relativeTurnOrder: Uno.clientSelectors.relativeTurnOrder(state),
    canMovePlayers: Uno.rules.canMovePlayers(state.L1)
  }),
  (dispatch: Dispatch<ClientAppAction<Uno.Spec>>) => ({
    reorder: (order: string[]) => dispatch(Uno.L3.actions.requestTurnOrder(order))
  })
)(Players);
