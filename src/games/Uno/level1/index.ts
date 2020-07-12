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

  export const ADD_PLAYER = "ADD_PLAYER";
  export type AddPlayerAction = actionTypes.L1<typeof ADD_PLAYER, state.Player>
  export function addPlayer(payload: state.Player): AddPlayerAction {
    return {
      kind: 'L1',
      type: ADD_PLAYER,
      payload
    };
  }

  export const UPDATE_PLAYER = "UPDATE_PLAYER";
  export type UpdatePlayerAction
    = actionTypes.L1<typeof UPDATE_PLAYER, Partial<state.Player>> & { id: string };
  export function updatePlayer(id: string, payload: Partial<state.Player>): UpdatePlayerAction {
    return {
      kind: 'L1',
      type: UPDATE_PLAYER,
      payload,
      id
    };
  }

  export type All = UpdateAction | AddPlayerAction | UpdatePlayerAction;
}

export namespace state {
  export interface Player {
    id: string;
    name: string;
    cards: number;
  }

  export interface State {
    status: "pregame" | "started" | "finished",
    direction: "CW" | "CCW",
    currentPlayer: number;
    topCard: Card | null;
    upStackSize: number;
    downStackSize: number;
    turnOrder: string[];
    players: { [id: string]: Player}
  }

  export const initial: State = {
    status: "pregame",
    direction: "CW",
    currentPlayer: 0,
    topCard: null,
    upStackSize: 108,
    downStackSize: 0,
    turnOrder: [],
    players: {}
  };
}

export function reduce(state: state.State, action: actions.All): state.State {
  switch (action.type) {
    case actions.UPDATE:
      return { ...state, ...action.payload };
    case actions.ADD_PLAYER:
      return { ...state, turnOrder: [
        ...state.turnOrder, action.payload.id
      ], players: {
        ...state.players,
        [action.payload.id]: action.payload
      }};
    case actions.UPDATE_PLAYER:
      return { ...state, players: {
        ...state.players,
        [action.id]: { ...state.players[action.id], ...action.payload }
      }};
    default:
      return state;
  }
}