import { IClient } from '../../server/GameClient';
import { UnoSpec, L1, L2, L3, Req } from '.';
import { ClientCoreActions, ServerCoreActions, CoreActions } from '../../types';
import { UnoServer } from './UnoServer';
import { rules, Color, Card } from './common';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getPreferredColor(l2: L2.state.State) {
  const counts: Map<Color, number> = new Map();
  for (const card of l2.hand) {
    if (card.color === 'black') continue;
    const count = counts.get(card.color) || 0;
    counts.set(card.color, count + 1);
  }
  const colors = [...counts.keys()].sort(
    (a, b) => counts.get(b)! - counts.get(a)!
  );
  return colors[0];
}

export default class UnoAIClient implements IClient<UnoSpec> {
  public readonly id: string;
  public readonly isHuman = false;

  private turnInProgress = false;
  private oldL1State: L1.state.State | null = null;

  // watchdog to be sure that the AI doesn't get stuck by missing its turn
  private watchdog: NodeJS.Timer;

  public constructor(
    private readonly server: UnoServer,
    public readonly n: number
  ) {
    this.id = 'ai-' + n;
    this.sendServer(
      CoreActions.clientJoin([L3.actions.setName('AI ' + (n + 1))])
    );
    this.watchdog = setInterval(this.takeTurn, 15000);
  }

  public send(msg: ClientCoreActions<UnoSpec>): void {
    const l1 = this.server.getL1ClientState(this.id);
    if (this.oldL1State && l1.turnCount === this.oldL1State.turnCount) {
      return;
    }
    this.oldL1State = l1;

    if (rules.canCalloutUno(l1, this.id)) {
      delay(Math.random() * 4000).then(() => {
        const newL1 = this.server.getL1ClientState(this.id);

        // ignore callouts from previous turns
        if (newL1.turnCount !== l1.turnCount) return;

        // don't call yourself out :facepalm:
        if (l1.lastPlayBy !== this.id) {
          this.sendServer(Req.actions.calloutUno());
        }
      });
    }

    if (this.isTurn(l1)) {
      this.takeTurn();
    }

    this.oldL1State = l1;
  }

  public sync(): void {}

  public close() {
    clearInterval(this.watchdog);
  }

  private takeTurn = async () => {
    const l1 = this.server.getL1ClientState(this.id);
    if (!this.isTurn(l1)) return;

    const play = async () => {
      const l1 = this.server.getL1ClientState(this.id);
      const l2 = this.server.getL2ClientState(this.id);
      let didPlay = false;

      if (!this.isTurn(l1)) return;

      for (const card of l2.hand) {
        if (rules.canPlay(card.id, l1, l2)) {
          await this.playCard(card, l2);
          didPlay = true;
          break;
        }
      }

      if (!didPlay) {
        await delay(Math.random() * 300 + 300);
        this.sendServer(Req.actions.drawCard());
      }

      await play();
    };

    if (this.turnInProgress) return;

    this.turnInProgress = true;
    await delay(Math.random() * 300 + 700);
    await play();
    this.turnInProgress = false;
  };

  private async playCard(card: Card, l2: L2.state.State) {
    if (l2.hand.length === 2) {
      // don't wait for this -- it will race against the next timeout
      delay(Math.random() ** 5 * 5000).then(() =>
        this.sendServer(Req.actions.callUno())
      );
    }

    await delay(Math.random() * 300 + 700);

    if (card.value === 'draw4' || card.value === 'wild') {
      const color = getPreferredColor(l2);
      this.sendServer(Req.actions.playCard(card.id, color));
    } else {
      this.sendServer(Req.actions.playCard(card.id));
    }
  }

  private sendServer(action: ServerCoreActions<UnoSpec>) {
    this.server.handleMessage(this, action);
  }

  private isTurn(
    l1: L1.state.State | null = this.server.getL1ClientState(this.id)
  ) {
    if (!l1) return false;
    if (l1.status !== L1.state.GameStatus.Started) return false;
    return l1.turnOrder[l1.currentPlayer] === this.id;
  }
}
