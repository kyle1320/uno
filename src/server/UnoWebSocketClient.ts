import { WebSocketClient } from "redux-mc/server";
import * as appInsights from "applicationinsights";

import * as Uno from "../spec";
import { UnoServer } from "./UnoServer";

export class UnoWebSocketClient extends WebSocketClient<Uno.Spec> {
  private roomName: string;

  public constructor(socket: WebSocket, store: UnoServer, id: string) {
    super(socket, store, id);
    this.roomName = store.roomName;
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
