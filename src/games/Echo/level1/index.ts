import { actions as coreActions } from '../../../types';

export namespace actions {
  export const MESSAGE = 'MESSAGE';
  export type MessageAction = coreActions.L1<typeof MESSAGE, string>;
  export function message(message: string): MessageAction {
    return {
      kind: 'L1',
      type: MESSAGE,
      payload: message
    };
  }

  export type All = MessageAction;
}

export namespace state {
  export interface State {
    messages: string[];
  }

  export const initial: State = {
    messages: []
  };
}

export function reduce(state: state.State, action: actions.All): state.State {
  switch (action.type) {
    case actions.MESSAGE:
      return { ...state, messages: [...state.messages, action.payload] };
    default:
      return state;
  }
}
