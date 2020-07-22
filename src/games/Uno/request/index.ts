import { actions as actionTypes } from "../../../types";
import { Color } from "../common";
import { L1 } from "..";

export namespace actions {
  export const DRAW_CARD = "DRAW_CARD";
  export type DrawCardAction = actionTypes.Req<typeof DRAW_CARD>;
  export function drawCard(id: string = ''): DrawCardAction {
    return {
      kind: 'Req',
      type: DRAW_CARD,
      id
    };
  }

  export const UPDATE_RULES = "UPDATE_RULES";
  export type UpdateRulesAction = actionTypes.Req<typeof UPDATE_RULES, Partial<L1.state.Rules>>;
  export function updateRules(payload: Partial<L1.state.Rules>, id: string = ''): UpdateRulesAction {
    return {
      kind: 'Req',
      type: UPDATE_RULES,
      payload,
      id
    };
  }

  export const PLAY_CARD = "PLAY_CARD";
  export type PlayCardPayload = {
    cardId: number;
    color?: Color;
  }
  export type PlayCardAction = actionTypes.Req<typeof PLAY_CARD, PlayCardPayload>;
  export function playCard(cardId: number, color?: Color, id: string = ''): PlayCardAction {
    return {
      kind: 'Req',
      type: PLAY_CARD,
      payload: { cardId, color },
      id
    };
  }

  export const RESET_GAME = "RESET_GAME";
  export type ResetGameAction = actionTypes.Req<typeof RESET_GAME>;
  export function resetGame(id: string = ''): ResetGameAction {
    return {
      kind: 'Req',
      type: RESET_GAME,
      id
    };
  }

  export type All = DrawCardAction | UpdateRulesAction | PlayCardAction | ResetGameAction;
}