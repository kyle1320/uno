import { actions as actionTypes } from '../../../types';
import { Card, shuffled, baseDeck, repeat } from '../common';

export namespace actions {
  export const DRAW_CARDS = 'DRAW_CARDS';
  export type DrawCardsAction = actionTypes.L0<typeof DRAW_CARDS, number>;
  export function drawCards(count: number, id: string): DrawCardsAction {
    return {
      kind: 'L0',
      type: DRAW_CARDS,
      payload: count
    };
  }

  export const PLAY_CARD = 'PLAY_CARD';
  export type PlayCardAction = actionTypes.L0<typeof PLAY_CARD, Card> & {
    id: string;
  };
  export function playCard(payload: Card, id: string): PlayCardAction {
    return {
      kind: 'L0',
      type: PLAY_CARD,
      payload,
      id
    };
  }

  export const SHUFFLE = 'SHUFFLE';
  export type ShuffleAction = actionTypes.L0<typeof SHUFFLE>;
  export function shuffle(): ShuffleAction {
    return {
      kind: 'L0',
      type: SHUFFLE
    };
  }

  export const RESET_GAME = 'RESET_GAME';
  export type ResetGamePayload = {
    deckCount: number;
  };
  export type ResetGameAction = actionTypes.L0<
    typeof RESET_GAME,
    ResetGamePayload
  >;
  export function resetGame(payload: ResetGamePayload): ResetGameAction {
    return {
      kind: 'L0',
      type: RESET_GAME,
      payload
    };
  }

  export type All =
    | ShuffleAction
    | DrawCardsAction
    | PlayCardAction
    | ResetGameAction;
}

export namespace state {
  export interface State {
    upStack: readonly Card[];
    downStack: readonly Card[];
  }

  export const initial: State = {
    upStack: baseDeck,
    downStack: []
  };
}

export function reduce(state: state.State, action: actions.All): state.State {
  switch (action.type) {
    case actions.SHUFFLE:
      return {
        ...state,
        downStack: state.downStack.slice(state.downStack.length - 1),
        upStack: [
          ...shuffled(state.downStack.slice(0, state.downStack.length - 1)),
          ...state.upStack
        ]
      };
    case actions.DRAW_CARDS:
      return {
        ...state,
        upStack: state.upStack.slice(0, state.upStack.length - action.payload)
      };
    case actions.PLAY_CARD:
      return {
        ...state,
        downStack: [...state.downStack, action.payload]
      };
    case actions.RESET_GAME:
      const newStack = shuffled(repeat(baseDeck, action.payload.deckCount));
      let firstCard = newStack.pop()!;
      while (firstCard.value === 'wild' || firstCard.value === 'draw4') {
        newStack.splice(
          Math.floor(Math.random() * newStack.length),
          0,
          firstCard
        );
        firstCard = newStack.pop()!;
      }
      return {
        ...state,
        downStack: [firstCard],
        upStack: newStack
      };
    default:
      return state;
  }
}
