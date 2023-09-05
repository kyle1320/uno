import { AllActions, createL3Action } from "@redux-mc/util";

export const actions = {
  setName: createL3Action("setName")<string>()
};
export type Action = AllActions<typeof actions>;

export interface State {
  name: string;
}
export const initialState: State = {
  name: "Player"
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case actions.setName.type:
      return { ...state, name: action.payload };
    default:
      return state;
  }
}
