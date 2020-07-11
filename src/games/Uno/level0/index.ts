import { actions as actionTypes } from "../../../types";
import { Card } from "../common";
import { shuffle } from "..";

export namespace actions {
  export const DRAW_CARD = "DRAW_CARD";
  export type DrawCardAction = actionTypes.L0<typeof DRAW_CARD>;
  export function drawCard(): DrawCardAction {
    return {
      kind: "L0",
      type: DRAW_CARD
    };
  }

  export const PLAY_CARD = "PLAY_CARD";
  export type PlayCardAction = actionTypes.L0<typeof PLAY_CARD, Card>;
  export function playCard(payload: Card): PlayCardAction {
    return {
      kind: "L0",
      type: PLAY_CARD,
      payload
    };
  }

  export const SHUFFLE = "SHUFFLE";
  export type ShuffleAction = actionTypes.L0<typeof SHUFFLE>;
  export function shuffle(): ShuffleAction {
    return {
      kind: "L0",
      type: SHUFFLE
    };
  }

  export type All = ShuffleAction | DrawCardAction | PlayCardAction;
}

export namespace state {
  export interface State {
    upStack: Card[],
    downStack: Card[]
  }

  export const initial: State = {
    upStack: [
      { color: 'red', value: '2' },
      { color: 'yellow', value: 'skip' },
      { color: 'black', value: 'draw4' },
      { color: 'blue', value: 'draw2' },
      { color: 'red', value: '7' },
      { color: 'green', value: 'reverse' },
      { color: 'black', value: 'wild' }
    ],
    downStack: []
  };

  for (const color of (["red", "yellow", "green", "blue"] as const)) {
    for (const value of (["0", "1", "1", "2", "2", "3", "3", "4", "4", "5", "5", "6", "6", "7", "7", "8", "8", "9", "9", "reverse", "reverse", "skip", "skip", "draw2", "draw2"] as const)) {
      initial.upStack.push({ color, value });
    }
  }
  for (const value of (["wild", "wild", "wild", "wild", "draw4", "draw4", "draw4", "draw4"] as const)) {
    initial.upStack.push({ color: "black", value });
  }
}

export function reduce(state: state.State, action: actions.All): state.State {
  switch (action.type) {
    case actions.SHUFFLE:
      const extras = state.downStack.slice(0, state.downStack.length - 1);
      shuffle(extras);
      return {
        ...state,
        downStack: state.downStack.slice(state.downStack.length - 1),
        upStack: [...extras, ...state.upStack]
      };
    case actions.DRAW_CARD:
      return {
        ...state,
        upStack: state.upStack.slice(0, state.upStack.length - 1)
      };
    case actions.PLAY_CARD:
      return {
        ...state,
        downStack: [...state.downStack, action.payload]
      };
    default:
      return state;
  }
}