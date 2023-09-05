import { IClient, ServerStore } from "redux-mc/server";
import { ServerStoreState } from "redux-mc/util";

import * as Uno from "../spec";
import UnoAIClient from "./UnoAIClient";
import { Timer } from "./util";

export class UnoServer extends ServerStore<Uno.Spec> {
  public version = Uno.version;

  private bots: UnoAIClient[] = [];
  private turnTimer = new Timer();
  private disposeAfter: null | number = null;

  public constructor(public readonly roomName: string) {
    super();
  }

  public shouldDispose() {
    return this.disposeAfter != null && Date.now() >= this.disposeAfter;
  }

  public override getInitialServerState() {
    return {
      L0: Uno.L0.initialState(),
      L1: Uno.L1.initialState()
    };
  }
  public override getInitialClientState(id: string, state: ServerStoreState<Uno.Spec>) {
    return {
      L2: Uno.L2.initialState,
      L3: {
        ...Uno.L3.initialState,
        name: "Player " + (state.L1.turnOrder.length + 1)
      }
    };
  }

  public override reduceL0 = Uno.L0.reducer;
  public override reduceL1 = Uno.L1.reducer;
  public override reduceL2 = Uno.L2.reducer;
  public override reduceL3 = Uno.L3.reducer;

  public override handleL0(action: Uno.L0.Action) {
    const state = this.getL0State();
    switch (action.type) {
      case Uno.L0.actions.shuffle.type:
        this.dispatch(
          Uno.L1.actions.update({
            upStackSize: state.upStack.length,
            downStackSize: state.downStack.length
          })
        );
        break;
      case Uno.L0.actions.drawCards.type:
        this.dispatch(
          Uno.L1.actions.update({
            upStackSize: state.upStack.length,
            lastPlayBy: null
          })
        );
        break;
      case Uno.L0.actions.playCard.type:
        this.dispatch(
          Uno.L1.actions.update({
            topCard: state.downStack[state.downStack.length - 1],
            downStackSize: state.downStack.length,
            lastPlayBy: action.payload.id
          })
        );
        break;
      case Uno.L0.actions.resetGame.type: {
        const topCard = state.downStack.length ? state.downStack[state.downStack.length - 1] : null;
        this.dispatch(
          Uno.L1.actions.resetGame({
            topCard,
            upStackSize: state.upStack.length,
            downStackSize: state.downStack.length,
            startTime: Date.now()
          })
        );

        // Get L1 state after resetting as this will filter out inactive players
        const l1 = this.getL1State();
        let turnOrder = l1.turnOrder;

        if (action.payload.shufflePlayers) {
          turnOrder = Uno.shuffledTurnOrder(turnOrder);
          this.dispatch(Uno.L1.actions.update({ turnOrder }));
        }

        for (const id of turnOrder) {
          this.dispatch(Uno.L2.actions.resetGame(), id);
          this.dispatch(Uno.L2.actions.drawCards(this.drawCards(id, l1.rules.initialCards)), id);
        }
        topCard &&
          this.dispatch(Uno.L1.actions.update(Uno.rules.getStateAfterPlay(topCard.id, this.getL1State(), null)));
        break;
      }
    }
  }

  public override handleL1(action: Uno.L1.Action) {
    switch (action.type) {
      case Uno.L1.actions.updateRules.type:
        if ("aiCount" in action.payload) {
          this.updateBots();
        }

        if ("lobbyMode" in action.payload) {
          if (action.payload.lobbyMode) {
            this.resetTurnTimer();
          } else {
            this.turnTimer.cancel();
          }
        }
        break;
      case Uno.L1.actions.resetGame.type:
        this.resetTurnTimer();
        break;
      case Uno.L1.actions.gameOver.type:
        this.turnTimer.cancel();
        this.dispatch(
          Uno.L1.actions.update({
            shownHands: this.getPlayerHands()
          })
        );
        break;
    }
  }

  public override handleL2(action: Uno.L2.Action, id: string) {
    let l1 = this.getL1State();
    const l2 = this.getL2State(id);
    switch (action.type) {
      case Uno.L2.actions.drawCards.type:
        this.dispatch(
          Uno.L1.actions.updatePlayer({
            id,
            cards: l2.hand.length
          })
        );
        break;
      case Uno.L2.actions.drawCard.type:
        this.dispatch(
          Uno.L1.actions.updatePlayer({
            id,
            cards: l2.hand.length
          })
        );
        this.dispatch(Uno.L1.actions.update(Uno.rules.getStateAfterDraw(action.payload.id, l1)));
        break;
      case Uno.L2.actions.forfeitDraw.type:
        this.dispatch(
          Uno.L1.actions.updatePlayer({
            id,
            cards: l2.hand.length
          })
        );
        this.dispatch(Uno.L1.actions.update(Uno.rules.getStateAfterForfeit(l1)));
        break;
      case Uno.L2.actions.playCard.type: {
        const cards = l2.hand.length;
        this.dispatch(
          Uno.L1.actions.updatePlayer({
            id,
            cards
          })
        );

        let gameOver = false;
        if (cards === 0) {
          gameOver = true;

          this.dispatch(Uno.L1.actions.playerWin({ id, score: Uno.serverSelectors.getScore(this.getState()) }));

          if (l1.rules.battleRoyale) {
            l1 = this.getL1State();
            gameOver = l1.turnOrder.filter((id) => l1.players[id].isInGame).length < 2;
          }
        }

        if (gameOver)
          this.dispatch(
            Uno.L1.actions.gameOver({
              duration: Date.now() - l1.startTime
            })
          );
        else this.dispatch(Uno.L1.actions.update(Uno.rules.getStateAfterPlay(action.payload, l1, id)));
        break;
      }
    }
  }

  public override handleL3(action: Uno.L3.Action, id: string) {
    switch (action.type) {
      case Uno.L3.actions.setName.type:
        this.dispatch(
          Uno.L1.actions.updatePlayer({
            id,
            name: action.payload
          })
        );
        break;
    }
  }

  public override handleReq(action: Uno.Req.Action, id: string) {
    const state = this.getState();

    switch (action.type) {
      case Uno.Req.actions.drawCard.type:
        if (Uno.serverSelectors.canDraw(state, id)) {
          // TODO: make this use drawCards() to draw multiple at once
          do {
            this.dispatch(Uno.L2.actions.drawCard(this.drawCards(id)[0]), id);
          } while (this.getL1State().ruleState.type === "draw");
          this.resetTurnTimer();
        }
        break;
      case Uno.Req.actions.updateRules.type:
        if ("penaltyCardCount" in action.payload) {
          action.payload.penaltyCardCount = Math.min(8, Math.max(1, action.payload.penaltyCardCount!));
        }
        if ("initialCards" in action.payload) {
          action.payload.initialCards = Math.min(20, Math.max(2, action.payload.initialCards!));
        }
        if ("deckCount" in action.payload) {
          action.payload.deckCount = Math.min(5, Math.max(1, action.payload.deckCount!));
        }
        this.dispatch(Uno.L1.actions.updateRules(action.payload));
        break;
      case Uno.Req.actions.playCard.type:
        if (Uno.serverSelectors.canPlay(state, id, action.payload.cardId)) {
          const card = this.playCard(id, action.payload.cardId, action.payload.color);
          if (card) this.dispatch(Uno.L0.actions.playCard({ id, card }));
          this.resetTurnTimer();
        }
        break;
      case Uno.Req.actions.resetScores.type:
        this.dispatch(Uno.L1.actions.resetScores());
        break;
      case Uno.Req.actions.resetGame.type:
        this.dispatch(
          Uno.L0.actions.resetGame({
            shufflePlayers: action.payload.shufflePlayers,
            deckCount: state.L1.rules.deckCount
          })
        );
        break;
      case Uno.Req.actions.callUno.type:
        if (Uno.serverSelectors.canCallUno(state, id)) {
          this.dispatch(Uno.L1.actions.updatePlayer({ id, didCallUno: true }));
        }
        break;
      case Uno.Req.actions.calloutUno.type:
        if (Uno.serverSelectors.canCalloutUno(state, id)) {
          const playerId = state.L1.lastPlayBy;
          const player = playerId && state.L1.players[playerId];
          if (player && player.cards === 1 && !player.didCallUno) {
            this.dispatch(
              Uno.L2.actions.drawCards(this.drawCards(player.id, state.L1.rules.penaltyCardCount)),
              player.id
            );
            this.dispatch(
              Uno.L1.actions.callout({
                callerId: id,
                targetId: player.id
              })
            );
          }
        }
        break;
      case Uno.Req.actions.shufflePlayers.type:
        this.dispatch(
          Uno.L1.actions.update({
            turnOrder: Uno.shuffledTurnOrder(state.L1.turnOrder)
          })
        );
        break;
    }
  }

  public override onClientConnected(client: IClient): void {
    if (!this.isEmpty() && this.disposeAfter) {
      this.disposeAfter = null;
      this.updateBots();
    }

    const id = client.id;
    const state = this.getState();

    if (id in state.L1.players) {
      this.dispatch(Uno.L1.actions.updatePlayer({ id, connected: true }));

      // if it's our turn and we have a turn timer, reset it
      if (Uno.serverSelectors.turnTimerActive(state) && Uno.serverSelectors.currentPlayer(state) === id) {
        this.resetTurnTimer();
      }
    } else {
      this.dispatch(
        Uno.L1.actions.addPlayer({
          id: id,
          name: state.L3[id].name,
          isAI: !client.isHuman,
          cards: 0,
          isInGame: state.L1.rules.lobbyMode || state.L1.status !== Uno.L1.GameStatus.Started,
          didCallUno: false,
          connected: true
        })
      );

      // Deal an initial hand if they are joining mid-game in lobby mode
      if (state.L1.status === Uno.L1.GameStatus.Started && state.L1.rules.lobbyMode) {
        this.dispatch(Uno.L2.actions.drawCards(this.drawCards(id, state.L1.rules.initialCards)), id);
      }
    }
  }

  public override onClientDisconnected(client: IClient): void {
    if (this.isEmpty() && !this.disposeAfter) {
      this.disposeAfter = Date.now() + 24 * 60 * 60 * 1000;
      this.turnTimer.cancel();
      this.updateBots(0);
    }

    this.dispatch(Uno.L1.actions.updatePlayer({ id: client.id, connected: false }));
  }

  private updateBots(count = this.getL1State().rules.aiCount) {
    while (this.bots.length > count) {
      this.bots.pop()!.disconnect();
    }
    while (this.bots.length < count) {
      const bot = new UnoAIClient(this, this.bots.length);
      this.bots.push(bot);
      bot.connect();
    }
  }

  private resetTurnTimer() {
    const state = this.getState();

    if (!Uno.serverSelectors.turnTimerActive(state)) {
      return;
    }

    const time = Date.now() + 15000;
    this.dispatch(
      Uno.L1.actions.update({
        turnTimeout: time
      })
    );

    this.turnTimer.set(time, () => {
      const id = Uno.serverSelectors.currentPlayer(this.getState());
      if (id) {
        // TODO: make this use drawCards() to draw multiple at once
        do {
          this.dispatch(Uno.L2.actions.forfeitDraw(this.drawCards(id)[0]), id);
        } while (this.getL1State().ruleState.type === "draw");
      }
      this.resetTurnTimer();
    });
  }

  private getPlayerHands() {
    const state = this.getState().L2;
    const res: { [id: string]: Uno.Card[] } = {};
    for (const id in state) {
      res[id] = state[id].hand;
    }
    return res;
  }

  private playCard(clientId: string, cardId: number, color?: Uno.Color) {
    const state = this.getL2State(clientId);
    const card = state.hand.find((c) => c.id === cardId);

    if (!card) return null;

    this.dispatch(Uno.L2.actions.playCard(cardId), clientId);

    // apply selected color to wild & draw4 cards
    if (color && (card.value === "draw4" || card.value === "wild")) {
      return { ...card, color } as Uno.Card;
    }

    return card;
  }

  private drawCards(id: string, count = 1) {
    let state = this.getState();

    if (state.L0.upStack.length < count) {
      this.dispatch(Uno.L0.actions.shuffle());
      state = this.getState();
    }
    let upStack = state.L0.upStack;

    // Automatically add a temporary deck to prevent the game from being blocked.
    if (upStack.length < count) {
      this.dispatch(Uno.L0.actions.addDeck());
      this.dispatch(Uno.L1.actions.notice(Uno.L1.NoticeType.DECK_ADDED));
      state = this.getState();
      upStack = state.L0.upStack;
    }

    const cards = upStack.slice(upStack.length - count);

    this.dispatch(Uno.L0.actions.drawCards(count));

    state = this.getState();
    if (state.L0.upStack.length < 1) this.dispatch(Uno.L0.actions.shuffle());

    return cards;
  }
}
