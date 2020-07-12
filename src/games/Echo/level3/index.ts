import { actions as coreActions } from "../../../types";

export namespace actions {
  export const TYPE = "TYPE";
  export type TypeAction = coreActions.L3<typeof TYPE, string>;
  export function type(message: string, id: string = ''): TypeAction {
    return {
      kind: 'L3',
      type: TYPE,
      payload: message,
      id
    };
  }

  export type All = TypeAction;
}

export namespace state {
  export interface State {
    message: string;
  }

  export const initial: State = {
    message: ''
  };
}

export function reduce(state: state.State, action: actions.All): state.State {
  switch (action.type) {
    case actions.TYPE:
      return { ...state, message: action.payload };
    default:
      return state;
  }
}