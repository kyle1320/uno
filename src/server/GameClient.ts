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
  close(): void;
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
      let action: ServerCoreActions<G> | null = null;

      const start = Date.now();
      try {
        action = JSON.parse(e.data as string) as ServerCoreActions<G>;
        this.room.handleMessage(this, action);
      } catch (e) {
        appInsights.defaultClient?.trackException({
          exception: e as Error
        });
        this.send(CoreActions.error(e));
      }
      const duration = Date.now() - start;

      appInsights.defaultClient?.trackMetric({
        name: 'WS Request Duration',
        value: duration
      });
    };
    socket.onclose = () => {
      try {
        room.leave(this);
      } catch (e) {
        appInsights.defaultClient?.trackException({
          exception: e as Error
        });
        this.send(CoreActions.error(e));
      }

      appInsights.defaultClient?.trackEvent({
        name: 'WS Close',
        properties: {
          clientId: this.id
        }
      });
    };

    try {
      room.join(this);
    } catch (e) {
      appInsights.defaultClient?.trackException({
        exception: e as Error
      });
      this.send(CoreActions.error(e));
    }

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
      (msg as any)._time = Date.now();
      this.socket.send(JSON.stringify(msg));
    }
  }

  public sync() {
    this.send(CoreActions.sync());
  }

  public close() {
    this.socket.close();
  }
}
