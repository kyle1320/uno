import { actions as actionTypes } from "../../../types";
import { Card } from "../common";

export namespace actions {
  export const DRAW_CARD = "DRAW_CARD";
  export type DrawCardAction = actionTypes.L2<typeof DRAW_CARD, Card>;
  export function drawCard(payload: Card, id: string = ''): DrawCardAction {
    return {
      kind: "L2",
      type: DRAW_CARD,
      payload,
      id
    };
  }

  export const PLAY_CARD = "PLAY_CARD";
  export type PlayCardAction = actionTypes.L2<typeof PLAY_CARD, number>;
  export function playCard(index: number, id: string = ''): PlayCardAction {
    return {
      kind: "L2",
      type: PLAY_CARD,
      payload: index,
      id
    };
  }

  export type All = DrawCardAction | PlayCardAction;
}

export namespace state {
  export interface State {
    id: string;
    hand: Card[];
  }

  export const initial: State = {
    id: '',
    hand: []
  };
}

export function reduce(state: state.State, action: actions.All): state.State {
  switch (action.type) {
    case actions.DRAW_CARD:
      return { ...state, hand: [...state.hand, action.payload ]};
    case actions.PLAY_CARD:
      const newHand = state.hand.slice();
      newHand.splice(action.payload, 1);
      return { ...state, hand: newHand };
    default:
      return state;
  }
}