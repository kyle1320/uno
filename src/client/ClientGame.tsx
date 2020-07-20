import * as React from 'react';
import { createStore, Store, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

import {
  state,
  GameSpec,
  L1Actions,
  L2Actions,
  L3Actions,
  L4Actions,
  ClientCoreActions,
  PickSubset,
  CoreActions,
  ClientPreActions,
  ClientGameActions} from '../types';

function getWebSocketUrl(): string {
  var loc = window.location, new_uri;
  if (loc.protocol === "https:") {
      new_uri = "wss:";
  } else {
      new_uri = "ws:";
  }
  new_uri += "//" + loc.host;
  new_uri += loc.pathname;
  return new_uri;
}

const serverTagSymbol = Symbol("From Server");
function tagFromServer(action: any) {
  action[serverTagSymbol] = true;
}

function isFromServer(action: any) {
  return !!action[serverTagSymbol];
}

export abstract class ClientGame<G extends GameSpec> extends React.PureComponent {
  private socket!: WebSocket;
  private store: Store<state.ClientSide<G>, ClientCoreActions<G>>;
  private actionQueue: ClientPreActions<G>[] = [];

  public constructor(props: {}) {
    super(props);

    let roomName = location.pathname;
    roomName = roomName.startsWith('/') ? roomName.substring(1) : roomName;
    localStorage.setItem('savedRoomName', roomName);

    this.store = createStore((
      state: state.ClientSide<G> = null!,
      action: ClientCoreActions<G>
    ): state.ClientSide<G> => {
      switch (action.kind) {
        case "L1": return {...state, l1: this.reduceL1(state.l1, action)};
        case "L2": return {...state, l2: this.reduceL2(state.l2, action)};
        case "L3": return {...state, l3: this.reduceL3(state.l3, action)};
        case "L4": return {...state, l4: this.reduceL4(state.l4, action)};
        case "Core": return this.reduceCore(state, action);
        default:  return state;
      }
    }, {
      connected: false,
      ...this.getInitialState() as any
    }, applyMiddleware(() => next => (action: ClientCoreActions<G>) => {
      next(action);
      switch (action.kind) {
        case 'L1':
          this.processL1(action);
          break;
        case 'L2':
          this.processL2(action);
          break;
        case 'L4':
          this.processL4(action);
          break;
        case 'L3':
          this.processL3(action);
          if (isFromServer(action)) break;
        case 'Req':
          if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(action));
          } else {
            this.actionQueue.push(action);
          }
          break;
        case 'Core':
          if (action.type === CoreActions.DISCONNECTED) {
            this.initSocket();
          } else if (action.type === CoreActions.CONNECTED) {
            const actions = this.actionQueue;
            this.actionQueue = [];
            this.socket.send(JSON.stringify(CoreActions.clientJoin(actions)));
          }
          this.processCore(action);
      }
    }));
  }

  protected setup() {
    // any preliminary work like setting default state values should happen here
  }

  private initSocket() {
    this.socket = new WebSocket(getWebSocketUrl());
    this.socket.onopen = () => this.store.dispatch(CoreActions.connected());
    this.socket.onclose = () => this.store.dispatch(CoreActions.disconnected());
    this.socket.onerror = e => this.store.dispatch(CoreActions.error(e));
    this.socket.onmessage = e => {
      const action = JSON.parse(e.data);
      tagFromServer(action);
      this.store.dispatch(action);
    };
  }

  protected abstract getInitialState(): PickSubset<G["state"], "l1" | "l2" | "l3" | "l4">;

  protected reduceCore(
    state: state.ClientSide<G>,
    action: CoreActions<G>
  ): state.ClientSide<G> {
    switch (action.type) {
      case CoreActions.INITIAL_STATE:
        return { ...state, ...action.payload };
      case CoreActions.CONNECTED:
        return { ...state, connected: true };
      case CoreActions.DISCONNECTED:
        return { ...state, connected: false };
      case CoreActions.ERROR:
        return { ...state, error: action.payload };
      default:
        return state;
    }
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

  protected reduceL4(state: state.L4<G>, action: L4Actions<G>): state.L4<G> {
    return state;
  }

  protected processL1(action: L1Actions<G>) {}
  protected processL2(action: L2Actions<G>) {}
  protected processL3(action: L3Actions<G>) {}
  protected processL4(action: L4Actions<G>) {}
  protected processCore(action: CoreActions<G>) {}

  protected abstract getRootElement(): React.ReactElement;

  protected getL4State(): state.L4<G> {
    return this.store.getState().l4;
  }

  protected dispatch(action: ClientGameActions<G>) {
    this.store.dispatch(action);
  }

  componentDidMount() {
    this.setup();
    this.initSocket();
  }

  render() {
    return <Provider store={this.store}>
      {this.getRootElement()}
    </Provider>;
  }
}