import { AllActions, createL2Action } from "redux-mc/util";

import { Card } from "./common";

export const actions = {
  drawCards: createL2Action("drawCards")<Card[]>(),
  drawCard: createL2Action("drawCard")<Card>(),
  forfeitDraw: createL2Action("forfeitDraw")<Card>(),
  playCard: createL2Action("playCard")<number>(),
  resetGame: createL2Action("resetGame")<void>()
};
export type Action = AllActions<typeof actions>;

export interface State {
  hand: Card[];
  lastDrawnCard: number | null;
}
export const initialState: State = {
  hand: [],
  lastDrawnCard: null
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case actions.drawCards.type:
      return { ...state, hand: [...state.hand, ...action.payload] };
    case actions.drawCard.type:
    case actions.forfeitDraw.type:
      return {
        ...state,
        hand: [...state.hand, action.payload],
        lastDrawnCard: action.payload.id
      };
    case actions.playCard.type: {
      const newHand = state.hand.slice();
      const index = newHand.findIndex((c) => c.id === action.payload);
      newHand.splice(index, 1);
      return { ...state, hand: newHand };
    }
    case actions.resetGame.type:
      return { ...state, hand: [] };
    default:
      return state;
  }
}
