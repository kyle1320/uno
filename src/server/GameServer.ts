import * as http from 'http';
import * as path from 'path';
import * as url from 'url';
import * as crypto from 'crypto';

import Express from 'express';
import WebSocket from 'ws';
import * as cookie from 'cookie';
import * as uuid from 'uuid';

import { GameClient } from './GameClient';
import { ServerGame } from './ServerGame';
import { GameSpec } from '../types';
import nouns from './nounlist.json';

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
      let id = getClientIdCookie(req) || uuid.v4();
      headers.push('Set-Cookie: ' + cookie.serialize(CLIENT_ID_COOKIE, id, { maxAge: 2592000 }));
      (req as any)._clientid = id;
    })

    wss.on('connection', (ws, req) => {
      const room = getRoomName(req.url || '').toLowerCase();
      const privateId = (req as any)._clientid as string;

      if (!(room in this.rooms)) {
        this.rooms[room] = new game();
      }

      // don't leak the private client id as it could be used by anyone
      const publicId = crypto.createHash('md5').update(privateId).digest("hex");
      new GameClient(ws, publicId, this.rooms[room]);
    });

    app.use((req, res, next) => {
      let id = getClientIdCookie(req) || uuid.v4();
      res.setHeader('Set-Cookie', cookie.serialize(CLIENT_ID_COOKIE, id, { maxAge: 2592000 }));
      next();
    });

    app.use(Express.static('public'));
    app.post('/newroom', (_, res) => res.end(this.getRandomRoom()));
    app.use('*', (req, res) => {
      res.sendFile(path.resolve('./public/index.html'));
    });
  }

  public start() {
    this.server.listen(process.env.PORT || 3000, () => {
      console.log('Server started');
    });
  }

  private getRandomRoom() {
    let room: string;
    do {
      room = nouns[Math.floor(Math.random() * nouns.length)]
    } while (room in this.rooms);
    return room;
  }
}