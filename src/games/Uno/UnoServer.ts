import { ServerGame } from "../../server/ServerGame";
import { UnoSpec, L0, L1, L2, L3, Req } from ".";
import { Card, shuffled, Color, serverSelectors, rules } from "./common";
import { CoreActions, state } from "../../types";

export class UnoServer extends ServerGame<UnoSpec> {
  createInitialState() {
    return {
      l0: {
        ...L0.state.initial,
        upStack: shuffled(L0.state.initial.upStack)
      },
      l1: L1.state.initial,
      l2: {},
      l3: {},
    };
  }

  createInitialClientState(state: state.ServerSide<UnoSpec>, id: string) {
    return {
      l2: {
        ...L2.state.initial,
        id,
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

  processL0(action: L0.actions.All) {
    const state = this.store.getState().l0;
    switch (action.type) {
      case L0.actions.SHUFFLE:
        this.dispatch(L1.actions.update({
          upStackSize: state.upStack.length,
          downStackSize: state.downStack.length
        }))
        break;
      case L0.actions.DRAW_CARDS:
        this.dispatch(L1.actions.update({
          upStackSize: state.upStack.length
        }))
        break;
      case L0.actions.PLAY_CARD:
        this.dispatch(L1.actions.update({
          topCard: state.downStack[state.downStack.length - 1],
          downStackSize: state.downStack.length,
          lastPlayBy: action.id
        }))
        break;
      case L0.actions.RESET_GAME:
        const topCard = state.downStack.length
          ? state.downStack[state.downStack.length - 1]
          : null;
        const turnOrder = this.getL1State().turnOrder.slice();
        turnOrder.push(turnOrder.shift()!);
        this.dispatch(L1.actions.resetGame());
        this.dispatch(L1.actions.update({
          topCard,
          upStackSize: state.upStack.length,
          downStackSize: state.downStack.length,
          turnOrder
        }));
        for (const id of this.getL1State().turnOrder) {
          this.dispatch(L2.actions.resetGame(id));
          this.dispatch(L2.actions.drawCards(this.drawCards(id, 2) || [], id));
        }
        topCard && this.dispatch(L1.actions.update(
          rules.getStateAfterPlay(topCard.id, this.getL1State())
        ));
        break;
    }
  }

  processL2(action: L2.actions.All) {
    let state = this.store.getState();
    switch (action.type) {
      case L2.actions.DRAW_CARDS:
        this.dispatch(L1.actions.updatePlayer(action.id, {
          cards: state.l2[action.id].hand.length
        }));
        break;
      case L2.actions.DRAW_CARD:
        this.dispatch(L1.actions.updatePlayer(action.id, {
          cards: state.l2[action.id].hand.length
        }));
        this.dispatch(L1.actions.update(
          rules.getStateAfterDraw(action.payload.id, state.l1)
        ));
        break;
      case L2.actions.PLAY_CARD:
        const cards = state.l2[action.id].hand.length;
        this.dispatch(L1.actions.updatePlayer(action.id, {
          cards,
          isInGame: cards > 0
        }));

        let gameOver = false;
        if (cards === 0) {
          gameOver = true;

          if (state.l1.rules.battleRoyale) {
            state = this.store.getState();
            gameOver = state.l1.turnOrder
              .filter(id => state.l1.players[id].isInGame)
              .length < 2;
          }
        }

        if (gameOver) this.dispatch(L1.actions.update({
          status: L1.state.GameStatus.Finished
        }));
        else this.dispatch(L1.actions.update(
          rules.getStateAfterPlay(action.payload, state.l1)
        ));
        break;
    }
  }

  processL3(action: L3.actions.All) {
    switch (action.type) {
      case L3.actions.SET_NAME:
        this.dispatch(L1.actions.updatePlayer(action.id, {
          name: action.payload
        }));
        break;
    }
  }

  processRequest(action: Req.actions.All) {
    const state = this.store.getState();

    switch (action.type) {
      case Req.actions.DRAW_CARD:
        if (serverSelectors.canDraw(state, action.id)) {
          // TODO: make this use drawCards() to draw multiple at once
          do {
            const cards = this.drawCards(action.id);
            if (cards) this.dispatch(L2.actions.drawCard(cards[0], action.id));
          } while (this.getL1State().ruleState.type === 'draw');
        }
        break;
      case Req.actions.UPDATE_RULES:
        this.dispatch(L1.actions.updateRules(action.payload));
        break;
      case Req.actions.PLAY_CARD:
        if (serverSelectors.canPlay(state, action.id, action.payload.cardId)) {
          const card = this.playCard(action.id, action.payload.cardId, action.payload.color);
          if (card) this.dispatch(L0.actions.playCard(card, action.id));
        }
        break;
      case Req.actions.RESET_GAME:
        this.dispatch(L0.actions.resetGame());
    }
  }

  processCore(action: CoreActions<UnoSpec>) {
    switch (action.type) {
      case CoreActions.NEW_CLIENT:
        this.dispatch(L1.actions.addPlayer({
          id: action.id,
          name: this.store.getState().l3[action.id].name,
          cards: 0,
          isInGame: this.getL1State().status !== L1.state.GameStatus.Started
        }));
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
    const upStack = state.l0.upStack;
    const cards = upStack.slice(upStack.length - count);

    if (cards.length < count) return null;

    this.dispatch(L0.actions.drawCards(count, id));

    state = this.store.getState();
    if (state.l0.upStack.length < 1) this.dispatch(L0.actions.shuffle());

    return cards;
  }
}