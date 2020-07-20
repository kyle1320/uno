import { actions as actionTypes } from "../../../types";

export namespace actions {
  export const UPDATE = "UPDATE";
  export type UpdateAction = actionTypes.L4<typeof UPDATE, Partial<state.State>>;
  export function update(payload: Partial<state.State>): UpdateAction {
    return {
      kind: 'L4',
      type: UPDATE,
      payload
    };
  }

  export type All = UpdateAction;
}

export namespace state {
  export interface State {
    sortCards: boolean;
  }

  export const initial: State = {
    sortCards: false
  };
}

export function reduce(state: state.State, action: actions.All): state.State {
  switch (action.type) {
    case actions.UPDATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}