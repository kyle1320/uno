import { actions as actionTypes } from "../../../types";
import { Card } from "../common";

export namespace actions {
  export const UPDATE = "UPDATE";
  export type UpdateAction = actionTypes.L1<typeof UPDATE, Partial<state.State>>;
  export function update(payload: Partial<state.State>): UpdateAction {
    return {
      kind: 'L1',
      type: UPDATE,
      payload
    };
  }

  export type All = UpdateAction;
}

export namespace state {
  export interface State {
    status: "pregame" | "started" | "finished",
    direction: "CW" | "CCW",
    currentPlayer: number;
    topCard: Card | null;
    upStackSize: number;
    downStackSize: number;
    players: {
      id: string;
      name: string;
      cards: number;
    }[]
  }

  export const initial: State = {
    status: "pregame",
    direction: "CW",
    currentPlayer: 0,
    topCard: null,
    upStackSize: 108,
    downStackSize: 0,
    players: []
  };
}

export function reduce(state: state.State, action: actions.All): state.State {
  switch (action.type) {
    case actions.UPDATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}