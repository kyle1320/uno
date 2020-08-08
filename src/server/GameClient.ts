import WebSocket from 'ws';
import * as appInsights from 'applicationinsights';

import { ServerGame } from './ServerGame';
import {
  GameSpec,
  ServerCoreActions,
  ClientCoreActions,
  CoreActions
} from '../types';

export interface IClient<G extends GameSpec> {
  readonly id: string;
  readonly isHuman: boolean;
  send(msg: ClientCoreActions<G>): void;
  sync(): void;
}

export class GameClient<G extends GameSpec> implements IClient<G> {
  public readonly isHuman = true;

  private hasReceivedInitialState = false;

  public constructor(
    private socket: WebSocket,
    public readonly id: string,
    private readonly room: ServerGame<G>
  ) {
    socket.onmessage = e => {
      const action = JSON.parse(e.data as string) as ServerCoreActions<G>;

      try {
        this.room.handleMessage(this, action);
      } catch (e) {
        console.log(e);
        this.send(CoreActions.error(e));
      }

      appInsights.defaultClient?.trackEvent({
        name: 'WS Request',
        properties: {
          kind: action.kind,
          type: action.type,
          clientId: this.id
        }
      });
    };
    socket.onclose = () => {
      room.leave(this);

      appInsights.defaultClient?.trackEvent({
        name: 'WS Close',
        properties: {
          clientId: this.id
        }
      });
    };
    room.join(this);

    appInsights.defaultClient?.trackEvent({
      name: 'WS Open',
      properties: {
        clientId: this.id
      }
    });

    this.sync();
  }

  public send(msg: ClientCoreActions<G>) {
    if (msg.kind === 'Core' && msg.type === CoreActions.INITIAL_STATE) {
      this.hasReceivedInitialState = true;
    }

    // don't send any action until the initial state has been received.
    // this way the client isn't updating outdated state.
    if (this.hasReceivedInitialState) {
      this.socket.send(JSON.stringify(msg));
    }
  }

  public sync() {
    this.send(CoreActions.sync(Date.now()));
  }
}
