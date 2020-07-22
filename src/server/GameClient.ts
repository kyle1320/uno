import WebSocket from 'ws';

import { ServerGame } from './ServerGame';
import { GameSpec, ServerCoreActions, ClientCoreActions, CoreActions } from '../types';

export class GameClient<G extends GameSpec> {
  private hasReceivedInitialState = false;

  public constructor(
    private socket: WebSocket,
    public readonly id: string,
    private readonly room: ServerGame<G>,
  ) {
    // TODO: handle onerror and onclose events
    socket.onmessage = e => {
      const action = JSON.parse(e.data as string) as ServerCoreActions<G>;

      try {
        this.room.handleMessage(this, action);
      } catch (e) {
        console.log(e);
        this.send(CoreActions.error(e));
      }
    };
    room.join(this);
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

  public ping() {
    this.socket.ping();
  }
}