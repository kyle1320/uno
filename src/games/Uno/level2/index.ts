import { actions as actionTypes } from "../../../types";
import { Card } from "../common";

export namespace actions {
  export const DRAW_CARDS = "DRAW_CARDS";
  export type DrawCardsAction = actionTypes.L2<typeof DRAW_CARDS, Card[]>;
  export function drawCards(payload: Card[], id: string = ''): DrawCardsAction {
    return {
      kind: "L2",
      type: DRAW_CARDS,
      payload,
      id
    };
  }

  export const PLAY_CARD = "PLAY_CARD";
  export type PlayCardAction = actionTypes.L2<typeof PLAY_CARD, number>;
  export function playCard(cardId: number, id: string = ''): PlayCardAction {
    return {
      kind: "L2",
      type: PLAY_CARD,
      payload: cardId,
      id
    };
  }

  export const RESET_GAME = "RESET_GAME";
  export type ResetGameAction = actionTypes.L2<typeof RESET_GAME>;
  export function resetGame(id: string = ''): ResetGameAction {
    return {
      kind: "L2",
      type: RESET_GAME,
      id
    };
  }

  export type All = DrawCardsAction | PlayCardAction | ResetGameAction;
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
    case actions.DRAW_CARDS:
      return { ...state, hand: [...state.hand, ...action.payload ]};
    case actions.PLAY_CARD:
      const newHand = state.hand.slice();
      const index = newHand.findIndex(c => c.id === action.payload);
      newHand.splice(index, 1);
      return { ...state, hand: newHand };
    case actions.RESET_GAME:
      return { ...state, hand: [] };
    default:
      return state;
  }
}