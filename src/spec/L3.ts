import { AllActions, createL3Action } from "redux-mc/util";

export const actions = {
  setName: createL3Action("setName")<string>(),
  requestTurnOrder: createL3Action("requestTurnOrder")<string[] | null>()
};
export type Action = AllActions<typeof actions>;

export interface State {
  name: string;
  requestedTurnOrder: string[] | null;
}
export const initialState: State = {
  name: "Player",
  requestedTurnOrder: null
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case actions.setName.type:
      return { ...state, name: action.payload };
    case actions.requestTurnOrder.type:
      return { ...state, requestedTurnOrder: action.payload };
    default:
      return state;
  }
}
