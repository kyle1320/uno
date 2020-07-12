import {
  Store,
  createStore,
  applyMiddleware } from "redux";

import { GameClient } from "./GameClient";
import {
  GameSpec,
  ServerCoreActions,
  state,
  L0Actions,
  L1Actions,
  L2Actions,
  L3Actions,
  ReqActions,
  CoreActions,
  PickSubset } from "../types";

const originatingClientSymbol = Symbol("Originating Client");
function tagWithClient<G extends GameSpec>(
  action: ServerCoreActions<G>,
  client: GameClient<G>
) {
  (action as any)[originatingClientSymbol] = client;
}

function getClient<G extends GameSpec>(
  action: ServerCoreActions<G>
): GameClient<G> {
  return (action as any)[originatingClientSymbol];
}

export abstract class ServerGame<G extends GameSpec = GameSpec> {
  protected clients: GameClient<G>[] = [];
  protected store: Store<state.ServerSide<G>, ServerCoreActions<G>>;

  public constructor() {
    this.store = createStore((
      state: state.ServerSide<G> = null!,
      action: ServerCoreActions<G>
    ): state.ServerSide<G> => {
      switch (action.kind) {
        case "L0": return {...state, l0: this.reduceL0(state.l0, action)};
        case "L1": return {...state, l1: this.reduceL1(state.l1, action)};
        case "L2": return {...state, l2: { ...state.l2,
          [action.id]: this.reduceL2(state.l2[action.id], action)
        }};
        case "L3": return {...state, l3: { ...state.l3,
          [action.id]: this.reduceL3(state.l3[action.id], action)
        }};
        case "Core":
          if (action.type === CoreActions.CLIENT_JOIN) {
            const clientState = this.getInitialClientState(action.payload) as {
              l2?: state.L2<G>,
              l3?: state.L3<G>
            };
            const newState = { ...state };
            if (clientState.l2) {
              newState.l2[action.payload] = clientState.l2;
            }
            if (clientState.l3) {
              newState.l3[action.payload] = clientState.l3;
            }
          }
        default:  return state;
      }
    }, {
      ...this.getInitialState() as any
    }, applyMiddleware(() => next => (action: ServerCoreActions<G>) => {
      // console.log(this.store.getState());
      // console.log(action);
      next(action);
      // console.log(this.store.getState());
      const from = getClient(action);
      switch (action.kind) {
        case "L0":
          this.processL0(action);
          break;

        // send to all clients
        case "L1":
          this.clients.forEach(c => c.send(action));
          break;

        // send to one client
        case "L2":
          this.clients
            .filter(c => c.id === action.id)
            .forEach(c => c.send(action));
          this.processL2(action);
          break;

        // send to one client (if not from that client)
        // react to client L3 action
        case "L3":
          this.clients
            .filter(c => c.id === action.id && c !== from)
            .forEach(c => c.send(action));
          this.processL3(action);
          break;

        // react to client Request action
        case "Req":
          this.processRequest(action);
          break;

        // react to core actions
        case "Core":
          this.processCore(action);
          break;
        default:
          break;
      }
    }));

    setInterval(() => this.clients.forEach(c => c.ping()), 30000);
  }

  // TODO: make the typings here allow omitting unused parts of state
  protected abstract getInitialState(): state.ServerSide<G>;
  protected abstract getInitialClientState(id: string): PickSubset<G["state"], "l2" | "l3">;

  protected reduceL0(state: state.L0<G>, action: L0Actions<G>): state.L0<G> {
    return state;
  }

  protected reduceL1(state: state.L1<G>, action: L1Actions<G>): state.L1<G> {
    return state;
  }

  protected reduceL2(state: state.L2<G>, action: L2Actions<G>): state.L2<G> {
    return state;
  }

  protected reduceL3(state: state.L3<G>, action: L3Actions<G>): state.L3<G> {
    return state;
  }

  public handleMessage(client: GameClient<G>, action: ServerCoreActions<G>) {
    tagWithClient(action, client);
    switch (action.kind) {
      case "L3":
      case "Req":
        action.id = client.id;
        this.store.dispatch(action);
        break;
      default:
        return;
    }
  }

  protected processL0(action: L0Actions<G>) {}
  protected processL2(action: L2Actions<G>) {}
  protected processL3(action: L3Actions<G>) {}
  protected processRequest(action: ReqActions<G>) {}
  protected processCore(action: CoreActions<G>) {}

  public join(client: GameClient<G>) {
    this.clients.push(client);
    // TODO: better way to check if client exists
    if (!(client.id in this.store.getState().l2)) {
      this.dispatch(CoreActions.clientJoin(client.id));
    }
    const { l1, l2, l3 } = this.store.getState();
    const state: Partial<state.ClientSide<G>> = {
      l1,
      l2: l2[client.id],
      l3: l3[client.id]
    };
    client.send(CoreActions.initialState(state));
  }

  public leave(client: GameClient<G>) {
    this.clients = this.clients.filter(x => x !== client);
  }

  protected getClient(action: ServerCoreActions<G>) {
    return getClient(action);
  }

  protected getL2State(id: string | ServerCoreActions<G>) {
    if (typeof id !== 'string') {
      id = this.getClient(id).id;
    }
    return this.store.getState().l2[id];
  }

  protected getL3State(id: string | ServerCoreActions<G>) {
    if (typeof id !== 'string') {
      id = this.getClient(id).id;
    }
    return this.store.getState().l3[id];
  }

  protected dispatch(action: ServerCoreActions<G>) {
    this.store.dispatch(action);
  }
}