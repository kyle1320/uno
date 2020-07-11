import * as WebSocket from 'ws';

import { ServerGame } from './ServerGame';
import { GameSpec, ServerCoreActions, ClientCoreActions } from '../types';

export class GameClient<G extends GameSpec> {
  public constructor(
    private socket: WebSocket,
    public readonly id: string,
    private readonly room: ServerGame<G>,
  ) {
    // TODO: handle onerror and onclose events
    socket.onmessage = e => {
      const action = JSON.parse(e.data as string) as ServerCoreActions<G>;
      this.room.handleMessage(this, action);
    };
    room.join(this);
  }

  public send(msg: ClientCoreActions<G>) {
    this.socket.send(JSON.stringify(msg));
  }
}