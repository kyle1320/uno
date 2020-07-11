import { actions as actionTypes } from "../../../types";

export namespace actions {
  export const DRAW_CARD = "DRAW_CARD";
  export type DrawCardAction = actionTypes.Req<typeof DRAW_CARD>;
  export function drawCard(id?: string): DrawCardAction {
    return {
      kind: 'Req',
      type: DRAW_CARD,
      id
    };
  }

  export const PLAY_CARD = "PLAY_CARD";
  export type PlayCardAction = actionTypes.Req<typeof PLAY_CARD, number>;
  export function playCard(index: number, id?: string): PlayCardAction {
    return {
      kind: 'Req',
      type: PLAY_CARD,
      payload: index,
      id
    };
  }

  export type All = DrawCardAction | PlayCardAction;
}