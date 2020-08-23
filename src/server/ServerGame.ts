import { Store, createStore, applyMiddleware } from 'redux';

import { IClient } from './GameClient';
import {
  GameSpec,
  ServerCoreActions,
  ServerSentActions,
  state,
  L0Actions,
  L1Actions,
  L2Actions,
  L3Actions,
  ReqActions,
  CoreActions,
  PickSubset
} from '../types';

const originatingClientSymbol = Symbol('Originating Client');
function tagWithClient<G extends GameSpec>(
  action: ServerCoreActions<G>,
  client: IClient<G>
) {
  (action as any)[originatingClientSymbol] = client;
}

function getClient<G extends GameSpec>(
  action: ServerCoreActions<G>
): IClient<G> {
  return (action as any)[originatingClientSymbol];
}

export abstract class ServerGame<G extends GameSpec = GameSpec> {
  protected clients: IClient<G>[] = [];
  protected uniqueClients: Set<string> = new Set();

  protected store: Store<state.ServerSide<G>, ServerCoreActions<G>>;

  private deleteCallbacks: (() => void)[] = [];
  private deleteTimeout: NodeJS.Timer | null = null;

  public constructor() {
    let depth = 0;
    const actions: Map<IClient<G>, ServerSentActions<G>[]> = new Map();

    function pushAction(client: IClient<G>, action: ServerSentActions<G>) {
      if (actions.has(client)) actions.get(client)!.push(action);
      else actions.set(client, [action]);
    }

    this.store = createStore(
      (
        state: state.ServerSide<G> = null!,
        action: ServerCoreActions<G>
      ): state.ServerSide<G> => {
        switch (action.kind) {
          case 'L0':
            return { ...state, l0: this.reduceL0(state.l0, action) };
          case 'L1':
            return { ...state, l1: this.reduceL1(state.l1, action) };
          case 'L2':
            return {
              ...state,
              l2: {
                ...state.l2,
                [action.id]: this.reduceL2(state.l2[action.id], action)
              }
            };
          case 'L3':
            return {
              ...state,
              l3: {
                ...state.l3,
                [action.id]: this.reduceL3(state.l3[action.id], action)
              }
            };
          case 'Core':
            if (action.type === CoreActions.CONNECTED) {
              if (action.id in state.l2 && action.id in state.l3) return state;

              const clientState = this.createInitialClientState(
                state,
                action.id
              ) as {
                l2?: state.L2<G>;
                l3?: state.L3<G>;
              };
              const newState = { ...state };
              if (clientState.l2) {
                newState.l2 = { ...newState.l2, [action.id]: clientState.l2 };
              }
              if (clientState.l3) {
                newState.l3 = { ...newState.l3, [action.id]: clientState.l3 };
              }
              return newState;
            }
          default:
            return state;
        }
      },
      {
        ...(this.createInitialState() as any)
      },
      applyMiddleware(() => next => (action: ServerCoreActions<G>) => {
        depth++;
        const from = getClient(action);
        switch (action.kind) {
          case 'L1': // send to all clients
            this.clients.forEach(c => pushAction(c, action));
            break;
          case 'L2': // send to one client
            this.clients
              .filter(c => c.id === action.id)
              .forEach(c => pushAction(c, action));
            break;
          case 'L3': // send to one client (if not from that client)
            this.clients
              .filter(c => c.id === action.id && c !== from)
              .forEach(c => pushAction(c, action));
            break;
          default:
            break;
        }

        // console.log(this.store.getState());
        // console.log(action);
        next(action);
        // console.log(this.store.getState());

        switch (action.kind) {
          case 'L0':
            this.processL0(action);
            break;
          case 'L1':
            this.processL1(action);
            break;
          case 'L2':
            this.processL2(action);
            break;
          case 'L3':
            this.processL3(action);
            break;
          case 'Req':
            this.processRequest(action);
            break;
          case 'Core':
            if (action.type === CoreActions.CLIENT_JOIN) {
              let state = this.store.getState();

              this.store.dispatch(CoreActions.connected(action.id));

              for (const act of action.payload) {
                const client = getClient(action);
                this.handleMessage(client, act);
              }

              // when we send the initial state, clear any queued actions
              const client = getClient(action);
              actions.delete(client);

              state = this.store.getState();
              client.send(
                CoreActions.initialState({
                  l1: state.l1,
                  l2: state.l2[action.id],
                  l3: state.l3[action.id]
                })
              );
            }
            this.processCore(action);
            break;
          default:
            break;
        }

        depth--;
        if (depth == 0) {
          for (const client of actions.keys()) {
            client.send(CoreActions.multiAction(actions.get(client)!));
          }
          actions.clear();
        }
      })
    );

    setInterval(() => this.clients.forEach(c => c.sync()), 30000);
  }

  public onDelete(cb: () => void) {
    this.deleteCallbacks.push(cb);
  }

  private delete = () => {
    this.deleteTimeout = null;
    for (const client of this.clients) {
      client.close();
    }
    this.clients = [];
    this.deleteCallbacks.forEach(cb => cb());
  };

  protected onMarkForDeletion() {
    // can be overridden by subclasses
  }

  // TODO: make the typings here allow omitting unused parts of state
  protected abstract createInitialState(): state.ServerSide<G>;
  protected abstract createInitialClientState(
    state: state.ServerSide<G>,
    id: string
  ): PickSubset<G['state'], 'l2' | 'l3'>;

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

  public handleMessage(client: IClient<G>, action: ServerCoreActions<G>) {
    tagWithClient(action, client);
    switch (action.kind) {
      case 'L3':
      case 'Req':
      case 'Core':
        (action as any).id = client.id;
        this.store.dispatch(action);
        break;
      default:
        return;
    }
  }

  protected processL0(action: L0Actions<G>) {}
  protected processL1(action: L1Actions<G>) {}
  protected processL2(action: L2Actions<G>) {}
  protected processL3(action: L3Actions<G>) {}
  protected processRequest(action: ReqActions<G>) {}
  protected processCore(action: CoreActions<G>) {}

  public join(client: IClient<G>) {
    this.clients.push(client);
    this.uniqueClients.add(client.id);
    if (this.deleteTimeout && client.isHuman) {
      clearTimeout(this.deleteTimeout);
      this.deleteTimeout = null;
    }
  }

  public leave(client: IClient<G>) {
    this.clients = this.clients.filter(x => x !== client);
    if (!this.clients.some(c => c.id === client.id)) {
      this.uniqueClients.delete(client.id);
      this.handleMessage(client, CoreActions.disconnected());
    }
    if (!this.clients.some(c => c.isHuman) && !this.deleteTimeout) {
      this.onMarkForDeletion();
      this.deleteTimeout = setTimeout(this.delete, 60000);
    }
  }

  protected getClient(action: ServerCoreActions<G>) {
    return getClient(action);
  }

  protected getL1State() {
    return this.store.getState().l1;
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
