import { actions as actionTypes } from "../../../types";
import { Card, rules } from "../common";

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

  export const RESET_GAME = "RESET_GAME";
  export type ResetGameAction = actionTypes.L1<typeof RESET_GAME>
  export function resetGame(): ResetGameAction {
    return {
      kind: 'L1',
      type: RESET_GAME
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

  export type All = UpdateAction | AddPlayerAction | UpdatePlayerAction | ResetGameAction;
}

export namespace state {
  export interface Rules {
    stackDraw2: boolean;
    stackDraw4: boolean;
    stackDraw4OnDraw2: boolean;
    stackDraw2OnDraw4: boolean;
    drawTillYouPlay: boolean;
  }

  export interface Player {
    id: string;
    name: string;
    cards: number;
  }

  export type RuleState
    = { type: "normal" }
    | { type: "draw2"; count: number }
    | { type: "draw4"; count: number }
    | { type: "draw"; count: number }
    | { type: "maybePlay" }

  export interface State {
    status: "pregame" | "started" | "finished",
    direction: "CW" | "CCW",
    currentPlayer: number;
    ruleState: RuleState;
    rules: Rules;
    topCard: Card | null;
    lastPlayBy: string | null;
    upStackSize: number;
    downStackSize: number;
    turnOrder: string[];
    players: { [id: string]: Player}
  }

  export const initial: State = {
    status: "pregame",
    direction: "CW",
    currentPlayer: 0,
    ruleState: { type: "normal" },
    rules: {
      stackDraw2: false,
      stackDraw4: false,
      stackDraw4OnDraw2: false,
      stackDraw2OnDraw4: false,
      drawTillYouPlay: false,
    },
    topCard: null,
    lastPlayBy: null,
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
    case actions.RESET_GAME:
      return { ...state,
        lastPlayBy: null
      };
    default:
      return state;
  }
}