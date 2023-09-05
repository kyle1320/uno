import { AllActions, createL1Action } from "@redux-mc/util";

import { Card } from "./common";

export const actions = {
  update: createL1Action("update")<Partial<State>>(),
  updateRules: createL1Action("updateRules")<Partial<Rules>>(),
  addPlayer: createL1Action("addPlayer")<Player>(),
  resetScores: createL1Action("resetScores")<void>(),
  resetGame: createL1Action("resetGame")<{
    topCard: Card | null;
    upStackSize: number;
    downStackSize: number;
    startTime: number;
  }>(),
  updatePlayer: createL1Action("updatePlayer")<Partial<Player> & { id: string }>(),
  notice: createL1Action("notice")<NoticeType>(),
  playerWin: createL1Action("playerWin")<{
    id: string;
    score: number;
  }>(),
  gameOver: createL1Action("gameOver")<{
    duration: number;
  }>(),
  callout: createL1Action("callout")<{
    callerId: string;
    targetId: string;
  }>()
};
export type Action = AllActions<typeof actions>;

export enum NoticeType {
  DECK_ADDED = "DECK_ADDED"
}

export interface Rules {
  stackDraw2: boolean;
  stackDraw4: boolean;
  stackDraw4OnDraw2: boolean;
  stackDraw2OnDraw4: boolean;
  drawTillYouPlay: boolean;
  battleRoyale: boolean;
  penaltyCardCount: number;
  aiCount: number;
  lobbyMode: boolean;
  initialCards: number;
  deckCount: number;
  jumpIn: boolean;
}

export interface Score {
  score: number;
  gamesWon: number;
}

export interface Player {
  id: string;
  name: string;
  isAI: boolean;
  cards: number;
  isInGame: boolean;
  didCallUno: boolean;
  connected: boolean;
}

export type RuleState =
  | { type: "normal" }
  | { type: "draw2"; count: number }
  | { type: "draw4"; count: number }
  | { type: "draw"; count: number }
  | { type: "maybePlay" };

export enum GameStatus {
  Pregame = "pregame",
  Started = "started",
  Finished = "finished"
}

export interface State {
  status: GameStatus;
  direction: "CW" | "CCW";
  ruleState: RuleState;

  players: { [id: string]: Player };
  shownHands: { [id: string]: Card[] } | null;

  // players don't appear in here until they've won a game
  scores: { [id: string]: Score | undefined };
  turnOrder: string[];
  currentPlayer: string | null;
  topCard: Card | null;
  lastPlayBy: string | null;
  upStackSize: number;
  downStackSize: number;
  turnTimeout: number;

  rules: Rules;

  startTime: number;
  turnCount: number;

  surveyURL: string;
}

export function initialState(set: Partial<State> = {}): State {
  return {
    status: GameStatus.Pregame,
    direction: "CW",
    ruleState: { type: "normal" },

    players: {},
    scores: {},
    turnOrder: [],
    currentPlayer: null,
    topCard: null,
    lastPlayBy: null,
    upStackSize: 108,
    downStackSize: 0,
    shownHands: null,

    // Used in lobby mode. Contains the time when the current player will time out
    turnTimeout: -1,

    rules: {
      stackDraw2: false,
      stackDraw4: false,
      stackDraw4OnDraw2: false,
      stackDraw2OnDraw4: false,
      drawTillYouPlay: false,
      battleRoyale: false,
      penaltyCardCount: 4,
      aiCount: 0,
      lobbyMode: false,
      initialCards: 7,
      deckCount: 1,
      jumpIn: false
    },

    startTime: -1,
    turnCount: 0,

    surveyURL: "",
    ...set
  };
}

export function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case actions.update.type:
      return { ..._state, ...action.payload };
    case actions.updateRules.type:
      return {
        ..._state,
        rules: {
          ..._state.rules,
          ...action.payload
        }
      };
    case actions.addPlayer.type:
      return {
        ..._state,
        turnOrder: [..._state.turnOrder, action.payload.id],
        players: {
          ..._state.players,
          [action.payload.id]: action.payload
        }
      };
    case actions.resetScores.type:
      return {
        ..._state,
        scores: {}
      };
    case actions.playerWin.type: {
      const player = _state.players[action.payload.id];
      const score = _state.scores[action.payload.id] || { score: 0, gamesWon: 0 };
      return {
        ..._state,
        players: {
          ..._state.players,
          [action.payload.id]: {
            ...player,
            isInGame: false
          }
        },
        scores: {
          ..._state.scores,
          [action.payload.id]: {
            score: score.score + action.payload.score,
            gamesWon: score.gamesWon + 1
          }
        }
      };
    }
    case actions.gameOver.type:
      return {
        ..._state,
        ...removeInactivePlayers(_state),
        status: GameStatus.Finished
      };
    case actions.updatePlayer.type: {
      const { id } = action.payload;
      let didCallUno = _state.players[id]?.didCallUno ?? false;
      if ("cards" in action.payload && action.payload.cards !== 1) {
        didCallUno = false;
      }

      // auto-remove player
      if (
        action.payload.connected === false &&
        (!_state.players[id].isInGame || _state.status !== GameStatus.Started)
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [id]: _, ...otherPlayers } = _state.players;
        return {
          ..._state,
          players: otherPlayers,
          turnOrder: _state.turnOrder.filter((i) => i !== id)
        };
      }

      return {
        ..._state,
        players: {
          ..._state.players,
          [id]: {
            ..._state.players[id],
            didCallUno,
            ...action.payload
          }
        }
      };
    }
    case actions.resetGame.type:
      return {
        ..._state,
        status: GameStatus.Started,
        ruleState: { type: "normal" },
        lastPlayBy: null,
        direction: "CW",
        currentPlayer: null,
        turnCount: 0,
        shownHands: null,
        ...removeInactivePlayers(_state, true),
        ...action.payload
      };
    default:
      return _state;
  }
}

function removeInactivePlayers(l1: State, rotate = false) {
  const players: typeof l1.players = {};

  for (const id in l1.players) {
    const player = l1.players[id];
    if (player.connected) {
      players[id] = player.isInGame
        ? player
        : {
            ...player,
            isInGame: true
          };
    }
  }

  let turnOrder = l1.turnOrder.slice();
  if (rotate) turnOrder.push(turnOrder.shift()!);
  turnOrder = turnOrder.filter((id) => id in players);

  return {
    players,
    turnOrder
  };
}
