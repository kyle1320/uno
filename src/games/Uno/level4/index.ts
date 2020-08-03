import { actions as actionTypes } from '../../../types';

export namespace actions {
  export const UPDATE = 'UPDATE';
  export type UpdateAction = actionTypes.L4<
    typeof UPDATE,
    Partial<state.State>
  >;
  export function update(payload: Partial<state.State>): UpdateAction {
    return {
      kind: 'L4',
      type: UPDATE,
      payload
    };
  }

  export const UPDATE_SETTINGS = '_SETTINGS';
  export type UpdateSettingsAction = actionTypes.L4<
    typeof UPDATE_SETTINGS,
    Partial<state.Settings>
  >;
  export function updateSettings(
    payload: Partial<state.Settings>
  ): UpdateSettingsAction {
    return {
      kind: 'L4',
      type: UPDATE_SETTINGS,
      payload
    };
  }

  export const PUSH_TOAST = 'PUSH_TOAST';
  export type PushToastAction = actionTypes.L4<typeof PUSH_TOAST, string>;
  export function pushToast(message: string): PushToastAction {
    return {
      kind: 'L4',
      type: PUSH_TOAST,
      payload: message
    };
  }

  export const POP_TOAST = 'POP_TOAST';
  export type PopToastAction = actionTypes.L4<typeof POP_TOAST>;
  export function popToast(): PopToastAction {
    return {
      kind: 'L4',
      type: POP_TOAST
    };
  }

  export type All =
    | UpdateAction
    | PushToastAction
    | PopToastAction
    | UpdateSettingsAction;
}

export namespace state {
  export interface Settings {
    sortCards: boolean;
  }

  export interface State {
    settings: Settings;
    toasts: string[];
  }

  export const initial: State = {
    settings: {
      sortCards: false
    },
    toasts: []
  };
}

export function reduce(state: state.State, action: actions.All): state.State {
  switch (action.type) {
    case actions.UPDATE:
      return { ...state, ...action.payload };
    case actions.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
    case actions.PUSH_TOAST:
      return { ...state, toasts: [...state.toasts, action.payload] };
    case actions.POP_TOAST:
      return { ...state, toasts: state.toasts.slice(1) };
    default:
      return state;
  }
}
