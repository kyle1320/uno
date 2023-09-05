import { ClientStore, WebSocketConnection } from "redux-mc/client";

import * as Uno from "../spec";

const NAME_STORAGE_KEY = "preferredName";
const PREFERENCES_STORAGE_KEY = "localPreferences";

function getWebSocketUrl(roomName: string): string {
  const loc = window.location;
  let new_uri;
  if (loc.protocol === "https:") {
    new_uri = "wss:";
  } else {
    new_uri = "ws:";
  }
  new_uri += "//" + loc.host;
  new_uri += "/" + roomName;
  return new_uri;
}

export class UnoClient extends ClientStore<Uno.Spec> {
  public version = Uno.version;

  public constructor(private readonly roomName: string) {
    super();

    const name = localStorage.getItem(NAME_STORAGE_KEY);
    if (name) {
      this.dispatch(Uno.L3.actions.setName(name));
    }

    const prefsString = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (prefsString) {
      try {
        const prefs = JSON.parse(prefsString);
        this.dispatch(Uno.L4.actions.updateSettings(prefs));
      } catch (e) {
        //
      }
    }
  }

  public override connect() {
    super.connect(new WebSocketConnection(getWebSocketUrl(this.roomName)));
  }

  public override getInitialState() {
    return {
      L1: Uno.L1.initialState(),
      L2: Uno.L2.initialState,
      L3: Uno.L3.initialState,
      L4: Uno.L4.initialState
    };
  }

  public override onVersionMismatch(): void {
    this.dispatchError(Uno.VERSION_MISMATCH_ERROR);
    setTimeout(() => location.reload(), 1000);
  }

  public override reduceL1 = Uno.L1.reducer;
  public override reduceL2 = Uno.L2.reducer;
  public override reduceL3 = Uno.L3.reducer;
  public override reduceL4 = Uno.L4.reducer;

  public override handleL1(action: Uno.L1.Action) {
    const state = this.store.getState();
    switch (action.type) {
      case Uno.L1.actions.updatePlayer.type:
        if (action.payload.didCallUno) {
          this.dispatch(Uno.L4.actions.pushToast(`${state.L1.players[action.payload.id].name} called Uno!`));
        }
        break;
      case Uno.L1.actions.playerWin.type:
        if (action.payload.id === state.meta.id) {
          this.dispatch(
            Uno.L4.actions.update({
              didWin: true
            })
          );
        }
        this.dispatch(
          Uno.L4.actions.pushToast(
            `${state.L1.players[action.payload.id].name} went out with ${action.payload.score} point${
              action.payload.score === 1 ? "" : "s"
            }!`
          )
        );
        break;
      case Uno.L1.actions.resetGame.type:
        this.dispatch(
          Uno.L4.actions.update({
            didWin: false
          })
        );
        break;
      case Uno.L1.actions.gameOver.type: {
        let duration = action.payload.duration;
        duration = Math.floor(duration / 1000);
        const s = duration % 60;
        const m = Math.floor(duration / 60);

        this.dispatch(
          Uno.L4.actions.pushToast(
            `Game over! The game lasted ${m} minute${m === 1 ? "" : "s"} and ${s} second${s === 1 ? "" : "s"}`
          )
        );
        break;
      }
      case Uno.L1.actions.callout.type:
        this.dispatch(
          Uno.L4.actions.pushToast(
            `${state.L1.players[action.payload.callerId].name} called out ` +
              `${state.L1.players[action.payload.targetId].name} on not saying Uno!`
          )
        );
        break;
      case Uno.L1.actions.resetScores.type:
        this.dispatch(Uno.L4.actions.pushToast(`Players scores have been reset`));
        break;
      case Uno.L1.actions.notice.type:
        switch (action.payload) {
          case Uno.L1.NoticeType.DECK_ADDED:
            this.dispatch(Uno.L4.actions.pushToast(`An additional deck has been added to allow the game to continue.`));
        }
        break;
      case Uno.L1.actions.updateRules.type:
        for (const k in action.payload) {
          const key = k as keyof Uno.L1.Rules;
          const name = ((): string => {
            switch (key) {
              case "stackDraw2":
                return "Stack Draw 2s";
              case "stackDraw4":
                return "Stack Draw 4s";
              case "stackDraw4OnDraw2":
                return "Stack Draw 4s on Draw 2s";
              case "stackDraw2OnDraw4":
                return "Stack Draw 2s on Draw 4s";
              case "drawTillYouPlay":
                return "Draw 'Till You Play";
              case "battleRoyale":
                return "Battle Royale";
              case "penaltyCardCount":
                return "Uno Penalty Cards";
              case "aiCount":
                return "AI Players";
              case "initialCards":
                return "Starting Cards";
              case "lobbyMode":
                return "Lobby Mode";
              case "deckCount":
                return "Number of Decks";
              case "jumpIn":
                return "Jump-In";
            }
          })();
          const value = (() => {
            const val = action.payload[key];
            switch (typeof val) {
              case "boolean":
                return val ? "enabled" : "disabled";
              case "number":
                return "set to " + val;
            }
          })();
          this.dispatch(Uno.L4.actions.pushToast(`Rule Changed: ${name} ${value}`));
        }
        break;
    }
  }

  public override handleL3(action: Uno.L3.Action) {
    if (action.type === Uno.L3.actions.setName.type) {
      localStorage.setItem(NAME_STORAGE_KEY, action.payload);
    }
  }

  public override handleL4(action: Uno.L4.Action) {
    if (action.type === Uno.L4.actions.updateSettings.type) {
      const settings = this.store.getState().L4.settings;
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(settings));
    } else if (action.type === Uno.L4.actions.pushToast.type) {
      setTimeout(() => this.dispatch(Uno.L4.actions.popToast()), 4000);
    }
  }
}
