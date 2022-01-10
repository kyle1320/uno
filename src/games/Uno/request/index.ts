import { actions as actionTypes } from '../../../types';
import { Color } from '../common';
import { L1 } from '..';

export namespace actions {
  export const DRAW_CARD = 'DRAW_CARD';
  export type DrawCardAction = actionTypes.Req<typeof DRAW_CARD>;
  export function drawCard(id: string = ''): DrawCardAction {
    return {
      kind: 'Req',
      type: DRAW_CARD,
      id
    };
  }

  export const UPDATE_RULES = 'UPDATE_RULES';
  export type UpdateRulesAction = actionTypes.Req<
    typeof UPDATE_RULES,
    Partial<L1.state.Rules>
  >;
  export function updateRules(
    payload: Partial<L1.state.Rules>,
    id: string = ''
  ): UpdateRulesAction {
    return {
      kind: 'Req',
      type: UPDATE_RULES,
      payload,
      id
    };
  }

  export const PLAY_CARD = 'PLAY_CARD';
  export type PlayCardPayload = {
    cardId: number;
    color?: Color;
  };
  export type PlayCardAction = actionTypes.Req<
    typeof PLAY_CARD,
    PlayCardPayload
  >;
  export function playCard(
    cardId: number,
    color?: Color,
    id: string = ''
  ): PlayCardAction {
    return {
      kind: 'Req',
      type: PLAY_CARD,
      payload: { cardId, color },
      id
    };
  }

  export const RESET_SCORES = 'RESET_SCORES';
  export type ResetScoresAction = actionTypes.Req<typeof RESET_SCORES>;
  export function resetScores(id: string = ''): ResetScoresAction {
    return {
      kind: 'Req',
      type: RESET_SCORES,
      id
    };
  }

  export const RESET_GAME = 'RESET_GAME';
  export type ResetGamePayload = {
    shufflePlayers: boolean;
  };
  export type ResetGameAction = actionTypes.Req<typeof RESET_GAME, ResetGamePayload>;
  export function resetGame(shufflePlayers: boolean, id: string = ''): ResetGameAction {
    return {
      kind: 'Req',
      type: RESET_GAME,
      payload: { shufflePlayers },
      id
    };
  }

  export const CALL_UNO = 'CALL_UNO';
  export type CallUnoAction = actionTypes.Req<typeof CALL_UNO>;
  export function callUno(id: string = ''): CallUnoAction {
    return {
      kind: 'Req',
      type: CALL_UNO,
      id
    };
  }

  export const CALLOUT_UNO = 'CALLOUT_UNO';
  export type CalloutUnoAction = actionTypes.Req<typeof CALLOUT_UNO>;
  export function calloutUno(id: string = ''): CalloutUnoAction {
    return {
      kind: 'Req',
      type: CALLOUT_UNO,
      id
    };
  }

  export const SHUFFLE_PLAYERS = 'SHUFFLE_PLAYERS';
  export type ShufflePlayersAction = actionTypes.Req<typeof SHUFFLE_PLAYERS>;
  export function shufflePlayers(id: string = ''): ShufflePlayersAction {
    return {
      kind: 'Req',
      type: SHUFFLE_PLAYERS,
      id
    };
  }

  export type All =
    | DrawCardAction
    | UpdateRulesAction
    | PlayCardAction
    | ResetScoresAction
    | ResetGameAction
    | CallUnoAction
    | CalloutUnoAction
    | ShufflePlayersAction;
}
