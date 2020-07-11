import * as React from 'react';
import { render } from 'react-dom';
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
  CoreActions } from '../types';

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

export abstract class ClientGame<G extends GameSpec> {
  private socket: WebSocket;
  private store: Store<state.ClientSide<G>, ClientCoreActions<G>>;

  public constructor() {
    let roomName = location.pathname;
    roomName = roomName.startsWith('/') ? roomName.substring(1) : roomName;
    localStorage.setItem('savedRoomName', roomName);

    this.initSocket();

    this.store = createStore((
      state: state.ClientSide<G>,
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
      console.log(action);
      switch (action.kind) {
        case 'L3':
          if (isFromServer(action)) break;
        case 'Req':
          this.socket.send(JSON.stringify(action));
          break;
        case 'Core':
          if (action.type === CoreActions.DISCONNECTED) {
            this.initSocket();
          }
      }
    }));
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

  protected abstract getRootElement(): React.ReactElement;

  mount(container: Element) {
    render(<Provider store={this.store}>
      {this.getRootElement()}
    </Provider>, container);
  }
}