import { ServerGame } from '../../server/ServerGame';
import { UnoSpec, L0, L1, L2, L3, Req } from '.';
import { Card, shuffledTurnOrder, Color, serverSelectors, rules } from './common';
import { CoreActions, state } from '../../types';
import UnoAIClient from './UnoAIClient';

class Timer {
  private timeout: NodeJS.Timer | null = null;
  private date: number | null = null;
  private callback: (() => void) | null = null;

  public set(date: number | null, cb: (() => void) | null = null) {
    this.callback = cb;

    if (this.date !== date) {
      this.date = date;
      this.tick();
    }
  }

  public cancel() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.date = null;
    this.callback = null;
  }

  private tick = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.date == null) {
      return;
    }

    const now = Date.now();
    if (now >= this.date) {
      const cb = this.callback;
      this.date = null;
      this.callback = null;
      cb?.();
    } else {
      this.timeout = setTimeout(this.tick, this.date - now);
    }
  };
}

export class UnoServer extends ServerGame<UnoSpec> {
  private bots: UnoAIClient[] = [];
  private turnTimer = new Timer();

  createInitialState() {
    return {
      l0: L0.state.initial(),
      l1: L1.state.initial({
        surveyURL: process.env.UNO_SURVEY_URL || ''
      }),
      l2: {},
      l3: {}
    };
  }

  createInitialClientState(state: state.ServerSide<UnoSpec>, id: string) {
    return {
      l2: {
        ...L2.state.initial,
        id
      },
      l3: {
        ...L3.state.initial,
        name: 'Player ' + (state.l1.turnOrder.length + 1)
      }
    };
  }
  protected reduceL0 = L0.reduce;
  protected reduceL1 = L1.reduce;
  protected reduceL2 = L2.reduce;
  protected reduceL3 = L3.reduce;

  public getL1ClientState(id: string) {
    return this.getL1State();
  }

  public getL2ClientState(id: string) {
    return this.getL2State(id);
  }

  protected onMarkForDeletion() {
    this.turnTimer.cancel();
    this.updateBots(0);
  }

  protected onUnmarkForDeletion() {
    this.updateBots();
  }

  private updateBots(count = this.getL1State().rules.aiCount) {
    while (this.bots.length > count) {
      this.leave(this.bots.pop()!);
    }
    while (this.bots.length < count) {
      const client = new UnoAIClient(this, this.bots.length);
      this.bots.push(client);
      this.join(client);
    }
  }

  processL0(action: L0.actions.All) {
    const state = this.store.getState().l0;
    switch (action.type) {
      case L0.actions.SHUFFLE:
        this.dispatch(
          L1.actions.update({
            upStackSize: state.upStack.length,
            downStackSize: state.downStack.length
          })
        );
        break;
      case L0.actions.DRAW_CARDS:
        this.dispatch(
          L1.actions.update({
            upStackSize: state.upStack.length,
            lastPlayBy: null
          })
        );
        break;
      case L0.actions.PLAY_CARD:
        this.dispatch(
          L1.actions.update({
            topCard: state.downStack[state.downStack.length - 1],
            downStackSize: state.downStack.length,
            lastPlayBy: action.id
          })
        );
        break;
      case L0.actions.RESET_GAME:
        const topCard = state.downStack.length
          ? state.downStack[state.downStack.length - 1]
          : null;
        this.dispatch(
          L1.actions.resetGame({
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
          turnOrder = shuffledTurnOrder(turnOrder);
          this.dispatch(L1.actions.update({ turnOrder }));
        }

        for (const id of turnOrder) {
          this.dispatch(L2.actions.resetGame(id));
          this.dispatch(
            L2.actions.drawCards(
              this.drawCards(id, l1.rules.initialCards),
              id
            )
          );
        }
        topCard &&
          this.dispatch(
            L1.actions.update(
              rules.getStateAfterPlay(topCard.id, this.getL1State(), null)
            )
          );
        break;
    }
  }

  processL1(action: L1.actions.All) {
    switch (action.type) {
      case L1.actions.UPDATE_RULES:
        if ('aiCount' in action.payload) {
          this.updateBots();
        }

        if ('lobbyMode' in action.payload) {
          if (action.payload.lobbyMode) {
            this.resetTurnTimer();
          } else {
            this.turnTimer.cancel();
          }
        }
        break;
      case L1.actions.RESET_GAME:
        this.resetTurnTimer();
        break;
      case L1.actions.GAME_OVER:
        this.turnTimer.cancel();
        this.dispatch(
          L1.actions.update({
            shownHands: this.getPlayerHands()
          })
        );
        break;
    }
  }

  private getPlayerHands() {
    const state = this.store.getState().l2;
    const res: { [id: string]: Card[] } = {};
    for (const id in state) {
      res[id] = state[id].hand;
    }
    return res;
  }

  processL2(action: L2.actions.All) {
    let state = this.store.getState();
    switch (action.type) {
      case L2.actions.DRAW_CARDS:
        this.dispatch(
          L1.actions.updatePlayer(action.id, {
            cards: state.l2[action.id].hand.length
          })
        );
        break;
      case L2.actions.DRAW_CARD:
        this.dispatch(
          L1.actions.updatePlayer(action.id, {
            cards: state.l2[action.id].hand.length
          })
        );
        this.dispatch(
          L1.actions.update(
            rules.getStateAfterDraw(action.payload.id, state.l1)
          )
        );
        break;
      case L2.actions.FORFEIT_DRAW:
        this.dispatch(
          L1.actions.updatePlayer(action.id, {
            cards: state.l2[action.id].hand.length
          })
        );
        this.dispatch(L1.actions.update(rules.getStateAfterForfeit(state.l1)));
        break;
      case L2.actions.PLAY_CARD:
        const cards = state.l2[action.id].hand.length;
        this.dispatch(
          L1.actions.updatePlayer(action.id, {
            cards
          })
        );

        let gameOver = false;
        if (cards === 0) {
          gameOver = true;

          this.dispatch(
            L1.actions.playerWin(action.id, serverSelectors.getScore(state))
          );

          if (state.l1.rules.battleRoyale) {
            state = this.store.getState();
            gameOver =
              state.l1.turnOrder.filter(id => state.l1.players[id].isInGame)
                .length < 2;
          }
        }

        if (gameOver)
          this.dispatch(
            L1.actions.gameOver({
              duration: Date.now() - state.l1.startTime
            })
          );
        else
          this.dispatch(
            L1.actions.update(
              rules.getStateAfterPlay(action.payload, state.l1, action.id)
            )
          );
        break;
    }
  }

  processL3(action: L3.actions.All) {
    switch (action.type) {
      case L3.actions.SET_NAME:
        this.dispatch(
          L1.actions.updatePlayer(action.id, {
            name: action.payload
          })
        );
        break;
    }
  }

  private resetTurnTimer() {
    const state = this.store.getState();

    if (!serverSelectors.turnTimerActive(state)) {
      return;
    }

    const time = Date.now() + 15000;
    this.dispatch(
      L1.actions.update({
        turnTimeout: time
      })
    );

    this.turnTimer.set(time, () => {
      const id = serverSelectors.currentPlayer(this.store.getState());
      if (id) {
        // TODO: make this use drawCards() to draw multiple at once
        do {
          this.dispatch(L2.actions.forfeitDraw(this.drawCards(id)[0], id));
        } while (this.getL1State().ruleState.type === 'draw');
      }
      this.resetTurnTimer();
    });
  }

  processRequest(action: Req.actions.All) {
    const state = this.store.getState();

    switch (action.type) {
      case Req.actions.DRAW_CARD:
        if (serverSelectors.canDraw(state, action.id)) {
          // TODO: make this use drawCards() to draw multiple at once
          do {
            this.dispatch(L2.actions.drawCard(this.drawCards(action.id)[0], action.id));
          } while (this.getL1State().ruleState.type === 'draw');
          this.resetTurnTimer();
        }
        break;
      case Req.actions.UPDATE_RULES:
        if ('penaltyCardCount' in action.payload) {
          action.payload.penaltyCardCount = Math.min(
            8,
            Math.max(1, action.payload.penaltyCardCount!)
          );
        }
        if ('initialCards' in action.payload) {
          action.payload.initialCards = Math.min(
            20,
            Math.max(2, action.payload.initialCards!)
          );
        }
        if ('deckCount' in action.payload) {
          action.payload.deckCount = Math.min(
            5,
            Math.max(1, action.payload.deckCount!)
          );
        }
        this.dispatch(L1.actions.updateRules(action.payload));
        break;
      case Req.actions.PLAY_CARD:
        if (serverSelectors.canPlay(state, action.id, action.payload.cardId)) {
          const card = this.playCard(
            action.id,
            action.payload.cardId,
            action.payload.color
          );
          if (card) this.dispatch(L0.actions.playCard(card, action.id));
          this.resetTurnTimer();
        }
        break;
      case Req.actions.RESET_SCORES:
        this.dispatch(L1.actions.resetScores());
        break;
      case Req.actions.RESET_GAME:
        this.dispatch(
          L0.actions.resetGame({
            shufflePlayers: action.payload.shufflePlayers,
            deckCount: state.l1.rules.deckCount
          })
        );
        break;
      case Req.actions.CALL_UNO:
        if (serverSelectors.canCallUno(state, action.id)) {
          this.dispatch(
            L1.actions.updatePlayer(action.id, { didCallUno: true })
          );
        }
        break;
      case Req.actions.CALLOUT_UNO:
        if (serverSelectors.canCalloutUno(state, action.id)) {
          const playerId = state.l1.lastPlayBy;
          const player = playerId && state.l1.players[playerId];
          if (player && player.cards === 1 && !player.didCallUno) {
            this.dispatch(
              L2.actions.drawCards(
                this.drawCards(player.id, state.l1.rules.penaltyCardCount),
                player.id
              )
            );
            this.dispatch(L1.actions.callout(action.id, player.id));
          }
        }
        break;
      case Req.actions.SHUFFLE_PLAYERS:
        this.dispatch(L1.actions.update({
          turnOrder: shuffledTurnOrder(state.l1.turnOrder)
        }));
        break;
    }
  }

  processCore(action: CoreActions<UnoSpec>) {
    const state = this.store.getState();

    switch (action.type) {
      case CoreActions.DISCONNECTED:
        this.dispatch(L1.actions.updatePlayer(action.id, { connected: false }));
        break;
      case CoreActions.CONNECTED:
        if (action.id in state.l1.players) {
          this.dispatch(
            L1.actions.updatePlayer(action.id, { connected: true })
          );

          // if it's our turn and we have a turn timer, reset it
          if (
            serverSelectors.turnTimerActive(state) &&
            serverSelectors.currentPlayer(state) === action.id
          ) {
            this.resetTurnTimer();
          }
        } else {
          this.dispatch(
            L1.actions.addPlayer({
              id: action.id,
              name: this.store.getState().l3[action.id].name,
              isAI: !this.getClient(action).isHuman,
              cards: 0,
              isInGame:
                state.l1.rules.lobbyMode ||
                state.l1.status !== L1.state.GameStatus.Started,
              didCallUno: false,
              connected: true
            })
          );

          // Deal an initial hand if they are joining mid-game in lobby mode
          if (
            state.l1.status === L1.state.GameStatus.Started &&
            state.l1.rules.lobbyMode
          ) {
            this.dispatch(
              L2.actions.drawCards(
                this.drawCards(action.id, state.l1.rules.initialCards),
                action.id
              )
            );
          }
        }
        break;
    }
  }

  private playCard(clientId: string, cardId: number, color?: Color) {
    const state = this.store.getState().l2[clientId];
    const card = state.hand.find(c => c.id === cardId);

    if (!card) return null;

    this.dispatch(L2.actions.playCard(cardId, clientId));

    // apply selected color to wild & draw4 cards
    if (color && (card.value === 'draw4' || card.value === 'wild')) {
      return { ...card, color } as Card;
    }

    return card;
  }

  private drawCards(id: string, count = 1) {
    let state = this.store.getState();

    if (state.l0.upStack.length < count) {
      this.dispatch(L0.actions.shuffle());
      state = this.store.getState();
    }
    let upStack = state.l0.upStack;

    // Automatically add a temporary deck to prevent the game from being blocked.
    if (upStack.length < count) {
      this.dispatch(L0.actions.addDeck());
      this.dispatch(L1.actions.notice(L1.actions.NoticeType.DECK_ADDED));
      state = this.store.getState();
      upStack = state.l0.upStack;
    }

    const cards = upStack.slice(upStack.length - count);

    this.dispatch(L0.actions.drawCards(count, id));

    state = this.store.getState();
    if (state.l0.upStack.length < 1) this.dispatch(L0.actions.shuffle());

    return cards;
  }
}
