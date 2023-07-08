import { actions as actionTypes } from '../../../types';
import { Card } from '../common';

export namespace actions {
  export const UPDATE = 'UPDATE';
  export type UpdateAction = actionTypes.L1<
    typeof UPDATE,
    Partial<state.State>
  >;
  export function update(payload: Partial<state.State>): UpdateAction {
    return {
      kind: 'L1',
      type: UPDATE,
      payload
    };
  }

  export const UPDATE_RULES = 'UPDATE_RULES';
  export type UpdateRulesAction = actionTypes.L1<
    typeof UPDATE_RULES,
    Partial<state.Rules>
  >;
  export function updateRules(
    payload: Partial<state.Rules>
  ): UpdateRulesAction {
    return {
      kind: 'L1',
      type: UPDATE_RULES,
      payload
    };
  }

  export const ADD_PLAYER = 'ADD_PLAYER';
  export type AddPlayerAction = actionTypes.L1<typeof ADD_PLAYER, state.Player>;
  export function addPlayer(payload: state.Player): AddPlayerAction {
    return {
      kind: 'L1',
      type: ADD_PLAYER,
      payload
    };
  }

  export const RESET_SCORES = 'RESET_SCORES';
  export type ResetScoresAction = actionTypes.L1<typeof RESET_SCORES>;
  export function resetScores(): ResetScoresAction {
    return {
      kind: 'L1',
      type: RESET_SCORES
    };
  }

  export const RESET_GAME = 'RESET_GAME';
  export type ResetGamePayload = {
    topCard: Card | null;
    upStackSize: number;
    downStackSize: number;
    startTime: number;
  };
  export type ResetGameAction = actionTypes.L1<
    typeof RESET_GAME,
    ResetGamePayload
  >;
  export function resetGame(payload: ResetGamePayload): ResetGameAction {
    return {
      kind: 'L1',
      type: RESET_GAME,
      payload
    };
  }

  export const UPDATE_PLAYER = 'UPDATE_PLAYER';
  export type UpdatePlayerAction = actionTypes.L1<
    typeof UPDATE_PLAYER,
    Partial<state.Player>
  > & { id: string };
  export function updatePlayer(
    id: string,
    payload: Partial<state.Player>
  ): UpdatePlayerAction {
    return {
      kind: 'L1',
      type: UPDATE_PLAYER,
      payload,
      id
    };
  }

  export const NOTICE = 'NOTICE';
  export enum NoticeType {
    DECK_ADDED = 'DECK_ADDED'
  };
  export type NoticeAction = actionTypes.L1<typeof NOTICE, NoticeType>;
  export function notice(type: NoticeType): NoticeAction {
    return {
      kind: 'L1',
      type: NOTICE,
      payload: type
    };
  }

  export const PLAYER_WIN = 'PLAYER_WIN';
  export type PlayerWinAction = actionTypes.L1<typeof PLAYER_WIN, number> & {
    id: string;
  };
  export function playerWin(id: string, score: number): PlayerWinAction {
    return {
      kind: 'L1',
      type: PLAYER_WIN,
      payload: score,
      id
    };
  }

  export const GAME_OVER = 'GAME_OVER';
  export type GameOverPayload = {
    duration: number;
  };
  export type GameOverAction = actionTypes.L1<
    typeof GAME_OVER,
    GameOverPayload
  >;
  export function gameOver(payload: GameOverPayload): GameOverAction {
    return {
      kind: 'L1',
      type: GAME_OVER,
      payload
    };
  }

  export const CALLOUT = 'CALLOUT';
  export type CalloutPayload = {
    callerId: string;
    targetId: string;
  };
  export type CalloutAction = actionTypes.L1<typeof CALLOUT, CalloutPayload>;
  export function callout(callerId: string, targetId: string): CalloutAction {
    return {
      kind: 'L1',
      type: CALLOUT,
      payload: { callerId, targetId }
    };
  }

  export type All =
    | UpdateAction
    | UpdateRulesAction
    | AddPlayerAction
    | ResetScoresAction
    | UpdatePlayerAction
    | ResetGameAction
    | NoticeAction
    | PlayerWinAction
    | GameOverAction
    | CalloutAction;
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
    cards: number;
    isInGame: boolean;
    didCallUno: boolean;
    connected: boolean;
  }

  export type RuleState =
    | { type: 'normal' }
    | { type: 'draw2'; count: number }
    | { type: 'draw4'; count: number }
    | { type: 'draw'; count: number }
    | { type: 'maybePlay' };

  export enum GameStatus {
    Pregame = 'pregame',
    Started = 'started',
    Finished = 'finished'
  }

  export interface State {
    status: GameStatus;
    direction: 'CW' | 'CCW';
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

  export function initial(set: Partial<State> = {}): State {
    return {
      status: GameStatus.Pregame,
      direction: 'CW',
      ruleState: { type: 'normal' },

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

      surveyURL: '',
      ...set
    };
  }
}

export function reduce(_state: state.State, action: actions.All): state.State {
  switch (action.type) {
    case actions.UPDATE:
      return { ..._state, ...action.payload };
    case actions.UPDATE_RULES:
      return {
        ..._state,
        rules: {
          ..._state.rules,
          ...action.payload
        }
      };
    case actions.ADD_PLAYER:
      return {
        ..._state,
        turnOrder: [..._state.turnOrder, action.payload.id],
        players: {
          ..._state.players,
          [action.payload.id]: action.payload
        }
      };
    case actions.RESET_SCORES:
      return {
        ..._state,
        scores: {}
      };
    case actions.PLAYER_WIN:
      const player = _state.players[action.id];
      const score = _state.scores[action.id] || { score: 0, gamesWon: 0 };
      return {
        ..._state,
        players: {
          ..._state.players,
          [action.id]: {
            ...player,
            isInGame: false
          }
        },
        scores: {
          ..._state.scores,
          [action.id]: {
            score: score.score + action.payload,
            gamesWon: score.gamesWon + 1
          }
        }
      };
    case actions.GAME_OVER:
      return {
        ..._state,
        ...removeInactivePlayers(_state),
        status: state.GameStatus.Finished
      };
    case actions.UPDATE_PLAYER:
      let didCallUno = _state.players[action.id]?.didCallUno ?? false;
      if ('cards' in action.payload && action.payload.cards !== 1) {
        didCallUno = false;
      }

      // auto-remove player
      if (
        action.payload.connected === false &&
        (!_state.players[action.id].isInGame ||
          _state.status !== state.GameStatus.Started)
      ) {
        let { [action.id]: _, ...otherPlayers } = _state.players;
        return {
          ..._state,
          players: otherPlayers,
          turnOrder: _state.turnOrder.filter(id => id !== action.id)
        };
      }

      return {
        ..._state,
        players: {
          ..._state.players,
          [action.id]: {
            ..._state.players[action.id],
            didCallUno,
            ...action.payload
          }
        }
      };
    case actions.RESET_GAME:
      return {
        ..._state,
        status: state.GameStatus.Started,
        ruleState: { type: 'normal' },
        lastPlayBy: null,
        direction: 'CW',
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

function removeInactivePlayers(l1: state.State, rotate = false) {
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
  turnOrder = turnOrder.filter(id => id in players);

  return {
    players,
    turnOrder
  };
}
