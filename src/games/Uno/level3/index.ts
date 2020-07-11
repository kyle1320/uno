import { actions as actionTypes } from "../../../types";

export namespace actions {
  export const NAME = "NAME";
  export type NameAction = actionTypes.L3<typeof NAME, string>;
  export function name(name: string, id?: string): NameAction {
    return {
      kind: 'L3',
      type: NAME,
      payload: name,
      id
    };
  }

  export type All = NameAction;
}

export namespace state {
  export interface State {
    name: string;
  }

  export const initial: State = {
    name: 'Player'
  };
}

export function reduce(state: state.State, action: actions.All): state.State {
  switch (action.type) {
    case actions.NAME:
      return { ...state, name: action.payload };
    default:
      return state;
  }
}