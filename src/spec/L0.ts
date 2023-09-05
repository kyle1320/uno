import { AllActions, createL0Action } from "redux-mc/util";

import { Card, shuffledDeck, getNewDeck, repeat } from "./common";

export const actions = {
  drawCards: createL0Action("drawCards")<number>(),
  playCard: createL0Action("playCard")<{
    id: string;
    card: Card;
  }>(),
  shuffle: createL0Action("shuffle")<void>(),
  addDeck: createL0Action("addDeck")<void>(),
  resetGame: createL0Action("resetGame")<{
    shufflePlayers: boolean;
    deckCount: number;
  }>()
};
export type Action = AllActions<typeof actions>;

export interface State {
  upStack: readonly Card[];
  downStack: readonly Card[];
}
export function initialState(): State {
  return {
    upStack: shuffledDeck(getNewDeck()),
    downStack: []
  };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case actions.shuffle.type:
      return {
        ...state,
        downStack: state.downStack.slice(state.downStack.length - 1),
        upStack: [...shuffledDeck(state.downStack.slice(0, state.downStack.length - 1)), ...state.upStack]
      };
    case actions.addDeck.type:
      return {
        ...state,
        upStack: [...shuffledDeck(getNewDeck()), ...state.upStack]
      };
    case actions.drawCards.type:
      return {
        ...state,
        upStack: state.upStack.slice(0, state.upStack.length - action.payload)
      };
    case actions.playCard.type:
      return {
        ...state,
        downStack: [...state.downStack, action.payload.card]
      };
    case actions.resetGame.type: {
      const newStack = shuffledDeck(repeat(getNewDeck, action.payload.deckCount));
      let firstCard = newStack.pop()!;
      while (firstCard.value === "wild" || firstCard.value === "draw4") {
        newStack.splice(Math.floor(Math.random() * newStack.length), 0, firstCard);
        firstCard = newStack.pop()!;
      }
      return {
        ...state,
        downStack: [firstCard],
        upStack: newStack
      };
    }
    default:
      return state;
  }
}
