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

  export const UPDATE_RULES = "UPDATE_RULES";
  export type UpdateRulesAction = actionTypes.L1<typeof UPDATE_RULES, Partial<state.Rules>>;
  export function updateRules(payload: Partial<state.Rules>): UpdateRulesAction {
    return {
      kind: 'L1',
      type: UPDATE_RULES,
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

  export const PLAYER_WIN = "PLAYER_WIN";
  export type PlayerWinAction = actionTypes.L1<typeof PLAYER_WIN, number> & { id: string }
  export function playerWin(id: string, score: number): PlayerWinAction {
    return {
      kind: 'L1',
      type: PLAYER_WIN,
      payload: score,
      id
    };
  }

  export const CALLOUT = "CALLOUT";
  export type CalloutPayload = {
    callerId: string;
    targetId: string;
  }
  export type CalloutAction = actionTypes.L1<typeof CALLOUT, CalloutPayload>
  export function callout(callerId: string, targetId: string): CalloutAction {
    return {
      kind: 'L1',
      type: CALLOUT,
      payload: { callerId, targetId }
    };
  }

  export type All = UpdateAction | UpdateRulesAction | AddPlayerAction
    | UpdatePlayerAction | ResetGameAction | PlayerWinAction | CalloutAction;
}

export namespace state {
  export interface Rules {
    stackDraw2: boolean;
    stackDraw4: boolean;
    stackDraw4OnDraw2: boolean;
    stackDraw2OnDraw4: boolean;
    drawTillYouPlay: boolean;
    battleRoyale: boolean;
    penaltyCardCount: number;
  }

  export interface Player {
    id: string;
    name: string;
    cards: number;
    isInGame: boolean;
    didCallUno: boolean;
    connected: boolean;
    score: number;
    gamesWon: number;
  }

  export type RuleState
    = { type: "normal" }
    | { type: "draw2"; count: number }
    | { type: "draw4"; count: number }
    | { type: "draw"; count: number }
    | { type: "maybePlay" }

  export enum GameStatus {
    Pregame = "pregame",
    Started = "started",
    Finished = "finished"
  }

  export interface State {
    status: GameStatus;
    direction: "CW" | "CCW",
    currentPlayer: number;
    ruleState: RuleState;
    rules: Rules;
    topCard: Card | null;
    lastPlayBy: string | null;
    upStackSize: number;
    downStackSize: number;
    turnOrder: string[];
    players: { [id: string]: Player }
  }

  export const initial: State = {
    status: GameStatus.Pregame,
    direction: "CW",
    currentPlayer: -1,
    ruleState: { type: "normal" },
    rules: {
      stackDraw2: false,
      stackDraw4: false,
      stackDraw4OnDraw2: false,
      stackDraw2OnDraw4: false,
      drawTillYouPlay: false,
      battleRoyale: false,
      penaltyCardCount: 4
    },
    topCard: null,
    lastPlayBy: null,
    upStackSize: 108,
    downStackSize: 0,
    turnOrder: [],
    players: {}
  };
}

export function reduce(_state: state.State, action: actions.All): state.State {
  switch (action.type) {
    case actions.UPDATE:
      return { ..._state, ...action.payload };
    case actions.UPDATE_RULES:
      return { ..._state, rules: {
        ..._state.rules,
        ...action.payload
      } };
    case actions.ADD_PLAYER:
      return { ..._state, turnOrder: [
        ..._state.turnOrder, action.payload.id
      ], players: {
        ..._state.players,
        [action.payload.id]: action.payload
      }};
    case actions.PLAYER_WIN:
      const player = _state.players[action.id];
      return { ..._state, players: {
        ..._state.players,
        [action.id]: {
          ...player,
          isInGame: false,
          gamesWon: player.gamesWon + 1,
          score: player.score + action.payload
        }
      }};
    case actions.UPDATE_PLAYER:
      let didCallUno = _state.players[action.id]?.didCallUno ?? false;
      if ('cards' in action.payload && action.payload.cards !== 1) {
        didCallUno = false;
      }
      return { ..._state, players: {
        ..._state.players,
        [action.id]: {
          ..._state.players[action.id],
          didCallUno,
          ...action.payload,
        }
      }};
    case actions.RESET_GAME:
      const players = getPlayersInGame(_state.players);
      let turnOrder = _state.turnOrder.slice();
      turnOrder.push(turnOrder.shift()!);
      turnOrder = turnOrder.filter(id => id in players);
      return { ..._state,
        status: state.GameStatus.Started,
        lastPlayBy: null,
        direction: 'CW',
        currentPlayer: -1,
        players,
        turnOrder
      };
    default:
      return _state;
  }
}

function getPlayersInGame(players: { [id: string]: state.Player }) {
  const newPlayers: typeof players = {};

  for (const id in players) {
    const player = players[id];
    if (player.connected) {
      newPlayers[id] = player.isInGame ? player : {
        ...player, isInGame: true
      };
    }
  }

  return newPlayers;
}