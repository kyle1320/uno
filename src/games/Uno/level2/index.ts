import { actions as actionTypes } from '../../../types';
import { Card } from '../common';

export namespace actions {
  // when cards are dealt automatically
  export const DRAW_CARDS = 'DRAW_CARDS';
  export type DrawCardsAction = actionTypes.L2<typeof DRAW_CARDS, Card[]>;
  export function drawCards(payload: Card[], id: string = ''): DrawCardsAction {
    return {
      kind: 'L2',
      type: DRAW_CARDS,
      payload,
      id
    };
  }

  // when the player picks up a card during the game
  export const DRAW_CARD = 'DRAW_CARD';
  export type DrawCardAction = actionTypes.L2<typeof DRAW_CARD, Card>;
  export function drawCard(payload: Card, id: string = ''): DrawCardAction {
    return {
      kind: 'L2',
      type: DRAW_CARD,
      payload,
      id
    };
  }

  export const FORFEIT_DRAW = 'FORFEIT_DRAW';
  export type ForfeitDrawAction = actionTypes.L2<typeof FORFEIT_DRAW, Card>;
  export function forfeitDraw(
    payload: Card,
    id: string = ''
  ): ForfeitDrawAction {
    return {
      kind: 'L2',
      type: FORFEIT_DRAW,
      payload,
      id
    };
  }

  export const PLAY_CARD = 'PLAY_CARD';
  export type PlayCardAction = actionTypes.L2<typeof PLAY_CARD, number>;
  export function playCard(cardId: number, id: string = ''): PlayCardAction {
    return {
      kind: 'L2',
      type: PLAY_CARD,
      payload: cardId,
      id
    };
  }

  export const RESET_GAME = 'RESET_GAME';
  export type ResetGameAction = actionTypes.L2<typeof RESET_GAME>;
  export function resetGame(id: string = ''): ResetGameAction {
    return {
      kind: 'L2',
      type: RESET_GAME,
      id
    };
  }

  export type All =
    | DrawCardsAction
    | DrawCardAction
    | ForfeitDrawAction
    | PlayCardAction
    | ResetGameAction;
}

export namespace state {
  export interface State {
    id: string;
    hand: Card[];
    lastDrawnCard: number | null;
  }

  export const initial: State = {
    id: '',
    hand: [],
    lastDrawnCard: null
  };
}

export function reduce(state: state.State, action: actions.All): state.State {
  switch (action.type) {
    case actions.DRAW_CARDS:
      return { ...state, hand: [...state.hand, ...action.payload] };
    case actions.DRAW_CARD:
    case actions.FORFEIT_DRAW:
      return {
        ...state,
        hand: [...state.hand, action.payload],
        lastDrawnCard: action.payload.id
      };
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
