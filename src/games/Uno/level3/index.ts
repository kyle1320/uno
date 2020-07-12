import { actions as actionTypes } from "../../../types";

export namespace actions {
  export const SET_NAME = "NAME";
  export type SetNameAction = actionTypes.L3<typeof SET_NAME, string>;
  export function setName(name: string, id: string = ''): SetNameAction {
    return {
      kind: 'L3',
      type: SET_NAME,
      payload: name,
      id
    };
  }

  export type All = SetNameAction;
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
    case actions.SET_NAME:
      return { ...state, name: action.payload };
    default:
      return state;
  }
}