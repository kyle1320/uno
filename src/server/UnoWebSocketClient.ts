import { WebSocketClient } from "@redux-mc/server";
import { Action } from "@redux-mc/util";

import * as appInsights from "applicationinsights";

import * as Uno from "../spec";
import { UnoServer } from "./UnoServer";

export class UnoWebSocketClient extends WebSocketClient<Uno.Spec> {
  private roomName: string;

  public constructor(socket: WebSocket, store: UnoServer, id: string) {
    super(socket, store, id);
    this.roomName = store.roomName;
  }

  protected override dispatch(action: Action) {
    appInsights.defaultClient?.trackEvent({
      name: "WS Request",
      properties: {
        kind: action.kind,
        type: action.type,
        payload: "payload" in action ? action.payload : "",
        clientId: this.id,
        room: this.roomName
      }
    });

    super.dispatch(action);
  }

  protected override sendError(error: unknown): void {
    appInsights.defaultClient?.trackException({
      exception: error as Error
    });

    super.sendError(error);
  }

  protected override connect() {
    appInsights.defaultClient?.trackEvent({
      name: "WS Open",
      properties: {
        clientId: this.id
      }
    });

    super.connect();
  }

  protected override disconnect() {
    appInsights.defaultClient?.trackEvent({
      name: "WS Close",
      properties: {
        clientId: this.id
      }
    });

    super.disconnect();
  }
}
