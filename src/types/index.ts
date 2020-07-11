import * as actions from './actions';
import * as state from './state';

export type PickSubset<O, K> = {
  [key in (K extends keyof O ? K : never)]: O[key]
}

export interface GameSpec {
  state: {
    l0?: object;
    l1?: object;
    l2?: object;
    l3?: object;
    l4?: object;
  },
  actions: {
    l0?: actions.L0;
    l1?: actions.L1;
    l2?: actions.L2;
    l3?: actions.L3;
    l4?: actions.L4;
    req?: actions.Req;
  }
}

type Subset<O, K> = O[K extends keyof O ? K : never]
type ActionSubset<G extends GameSpec, K extends string> = Subset<G["actions"], K>
export type AllActions<G extends GameSpec = GameSpec>
  = ActionSubset<G, "l0" | "l1" | "l2" | "l3" | "l4" | "req">
export type ServerCoreActions<G extends GameSpec = GameSpec>
  = L0Actions<G>
  | L1Actions<G>
  | L2Actions<G>
  | L3Actions<G>
  | ReqActions<G>
  | CoreActions<G>;
export type ServerGameActions<G extends GameSpec = GameSpec>
  = L0Actions<G>
  | L1Actions<G>
  | L2Actions<G>
  | L3Actions<G>;
export type ClientCoreActions<G extends GameSpec = GameSpec>
  = L1Actions<G>
  | L2Actions<G>
  | L3Actions<G>
  | L4Actions<G>
  | ReqActions<G>
  | CoreActions<G>;
export type ClientGameActions<G extends GameSpec = GameSpec>
  = ActionSubset<G, "l3" | "l4" | "req">
export type L0Actions<G extends GameSpec = GameSpec> = G["actions"]["l0"];
export type L1Actions<G extends GameSpec = GameSpec> = G["actions"]["l1"];
export type L2Actions<G extends GameSpec = GameSpec> = G["actions"]["l2"];
export type L3Actions<G extends GameSpec = GameSpec> = G["actions"]["l3"];
export type L4Actions<G extends GameSpec = GameSpec> = G["actions"]["l4"];
export type ReqActions<G extends GameSpec = GameSpec> = G["actions"]["req"];

// TODO: move core actions somewhere else?
export namespace CoreActions {
  export const CLIENT_JOIN = "CLIENT_JOIN";
  export type ClientJoinAction = actions.Core<typeof CLIENT_JOIN, string>;
  export function clientJoin(id: string): ClientJoinAction {
    return {
      kind: "Core",
      type: CLIENT_JOIN,
      payload: id
    };
  }

  export const INITIAL_STATE = "INITIAL_STATE";
  export type InitialStateAction<G extends GameSpec>
    = actions.Core<typeof INITIAL_STATE, Partial<state.ClientSide<G>>>;
  export function initialState<G extends GameSpec>(
    payload: Partial<state.ClientSide<G>>
  ): InitialStateAction<G> {
    return {
      kind: "Core",
      type: INITIAL_STATE,
      payload
    };
  }

  export const CONNECTED = "CONNECTED";
  export type ConnectedAction = actions.Core<typeof CONNECTED>;
  export function connected(): ConnectedAction {
    return {
      kind: "Core",
      type: CONNECTED
    };
  }

  export const DISCONNECTED = "DISCONNECTED";
  export type DisconnectedAction = actions.Core<typeof DISCONNECTED>;
  export function disconnected(): DisconnectedAction {
    return {
      kind: "Core",
      type: DISCONNECTED
    };
  }

  export const ERROR = "ERROR";
  export type ErrorAction = actions.Core<typeof ERROR, unknown>;
  export function error(payload: unknown): ErrorAction {
    return {
      kind: "Core",
      type: ERROR,
      payload
    };
  }
}

export type CoreActions<G extends GameSpec = GameSpec>
  = CoreActions.InitialStateAction<G>
  | CoreActions.ClientJoinAction
  | CoreActions.ConnectedAction
  | CoreActions.DisconnectedAction
  | CoreActions.ErrorAction;

export {
  actions,
  state
};