import * as http from 'http';
import * as path from 'path';
import * as url from 'url';

import * as Express from 'express';
import * as WebSocket from 'ws';
import * as cookie from 'cookie';
import * as uuid from 'uuid';

import { GameClient } from './GameClient';
import { ServerGame } from './ServerGame';
import { GameSpec } from '../types';

const CLIENT_ID_COOKIE = 'clientid';

function getRoomName(roomUrl: string) {
  const path = url.parse(roomUrl).pathname || '';
  if (path.startsWith('/')) return path.substring(1);
  return path;
}

function getClientIdCookie(req: http.IncomingMessage) {
  const parsed = cookie.parse(req.headers.cookie || '');
  return parsed[CLIENT_ID_COOKIE];
}

export class GameServer<G extends GameSpec> {
  private server: http.Server;
  private rooms: { [name: string]: ServerGame<G> };

  public constructor(game: new () => ServerGame<G>) {
    this.rooms = {};

    const app = Express();
    this.server = http.createServer(app);
    const wss = new WebSocket.Server({ server: this.server });

    wss.on("headers", (headers, req) => {
      let id = getClientIdCookie(req);
      if (!id) {
        id = uuid.v4();
        headers.push('Set-Cookie: ' + cookie.serialize(CLIENT_ID_COOKIE, id));
      };
      (req as any)._clientid = id;
    })

    wss.on('connection', (ws, req) => {
      const room = getRoomName(req.url || '').toLowerCase();
      const id = (req as any)._clientid as string;

      if (!(room in this.rooms)) {
        this.rooms[room] = new game();
      }
      new GameClient(ws, id, this.rooms[room]);
    });

    app.use(Express.static('public'));
    app.use('*', (req, res) => {
      res.sendFile(path.resolve('./public/gameroom.html'));
    });
  }

  public start() {
    this.server.listen(process.env.PORT || 3000, () => {
      console.log('Server started');
    });
  }
}