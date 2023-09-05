import { AllActions, createL4Action } from "redux-mc/util";

export const actions = {
  update: createL4Action("update")<Partial<State>>(),
  updateSettings: createL4Action("updateSettings")<Partial<Settings>>(),
  pushToast: createL4Action("pushToast")<string>(),
  popToast: createL4Action("popToast")<void>()
};
export type Action = AllActions<typeof actions>;

export interface Settings {
  sortCards: boolean;
}
export interface State {
  settings: Settings;
  toasts: string[];
  didWin: boolean;
}
export const initialState: State = {
  settings: {
    sortCards: false
  },
  toasts: [],
  didWin: false
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case actions.update.type:
      return { ...state, ...action.payload };
    case actions.updateSettings.type:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
    case actions.pushToast.type:
      return { ...state, toasts: [...state.toasts, action.payload] };
    case actions.popToast.type:
      return { ...state, toasts: state.toasts.slice(1) };
    default:
      return state;
  }
}
