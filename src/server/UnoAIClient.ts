import { BaseClient } from "redux-mc/server";
import { ClientAppAction } from "redux-mc/util";

import * as Uno from "../spec";
import { UnoServer } from "./UnoServer";
import { delay } from "./util";

function getPreferredColor(l2: Uno.L2.State) {
  const counts: Map<Uno.Color, number> = new Map();
  for (const card of l2.hand) {
    if (card.color === "black") continue;
    const count = counts.get(card.color) || 0;
    counts.set(card.color, count + 1);
  }
  const colors = [...counts.keys()].sort((a, b) => counts.get(b)! - counts.get(a)!);

  // default to red
  return colors[0] || "red";
}

export default class UnoAIClient extends BaseClient<Uno.Spec> {
  public readonly isHuman = false;

  protected override supportsBatching: boolean = false;

  private turnInProgress = false;
  private oldL1State: Uno.L1.State | null = null;

  // watchdog to be sure that the AI doesn't get stuck by missing its turn
  private watchdog: ReturnType<typeof setInterval>;

  public constructor(
    store: UnoServer,
    public readonly n: number
  ) {
    super(store, "ai-" + n);

    this.watchdog = setInterval(this.takeTurn, 15000);
  }

  public connect() {
    this.store.addClient(this);
    this.startHandshake([Uno.L3.actions.setName("AI " + (this.n + 1))]);
  }

  public disconnect() {
    this.store.removeClient(this);
  }

  public override doSend(action: ClientAppAction<Uno.Spec>): void {
    const l1 = this.store.getL1State();
    const didReset = action.type === Uno.L1.actions.resetGame.type;

    if (!didReset && this.oldL1State && l1.turnCount === this.oldL1State.turnCount) {
      return;
    }
    this.oldL1State = l1;

    if (Uno.rules.canCalloutUno(l1, this.id)) {
      delay(Math.random() * 4000).then(() => {
        const newL1 = this.store.getL1State();

        // ignore callouts from previous turns
        if (newL1.turnCount !== l1.turnCount) return;

        // don't call yourself out :facepalm:
        if (l1.lastPlayBy !== this.id) {
          this.dispatch(Uno.Req.actions.calloutUno());
        }
      });
    }

    this.takeTurn();

    this.oldL1State = l1;
  }

  public override close() {
    clearInterval(this.watchdog);
  }

  private takeTurn = async () => {
    const play = async () => {
      const l1 = this.store.getL1State();
      const l2 = this.store.getL2State(this.id);
      let didPlay = false;

      for (const card of l2.hand) {
        if (Uno.rules.canPlay(card.id, l1, l2, this.isTurn())) {
          await this.playCard(card, l2);
          didPlay = true;
          break;
        }
      }

      if (this.isTurn()) {
        if (!didPlay) {
          await delay(Math.random() * 300 + 300);
          this.dispatch(Uno.Req.actions.drawCard());
        }

        await play();
      }
    };

    if (this.turnInProgress) return;

    this.turnInProgress = true;
    await delay(Math.random() * 300 + 700);
    await play();
    this.turnInProgress = false;
  };

  private async playCard(card: Uno.Card, l2: Uno.L2.State) {
    if (l2.hand.length === 2) {
      // don't wait for this -- it will race against the next timeout
      delay(Math.random() ** 5 * 5000).then(() => this.dispatch(Uno.Req.actions.callUno()));
    }

    await delay(Math.random() * 300 + 700);

    if (card.value === "draw4" || card.value === "wild") {
      const color = getPreferredColor(l2);
      this.dispatch(Uno.Req.actions.playCard({ cardId: card.id, color }));
    } else {
      this.dispatch(Uno.Req.actions.playCard({ cardId: card.id }));
    }
  }

  private isTurn(l1: Uno.L1.State | null = this.store.getL1State()) {
    if (!l1) return false;
    if (l1.status !== Uno.L1.GameStatus.Started) return false;
    return l1.currentPlayer === this.id;
  }
}
