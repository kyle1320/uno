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
      case L0.actions.DRAW_CARD:
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
        this.dispatch(L1.actions.update({
          topCard: state.downStack.length
            ? state.downStack[state.downStack.length - 1]
            : null,
          upStackSize: state.upStack.length,
          downStackSize: state.downStack.length
        }))
        for (const id of this.getL1State().turnOrder) {
          this.dispatch(L2.actions.resetGame(id));
        }
        // TODO: make this more efficient
        for (let i = 0; i < 7; i++) {
          for (const id of this.getL1State().turnOrder) {
            this.dispatch(L2.actions.drawCards([this.drawCard(id)!], id));
          }
        }
        break;
    }
  }

  processL2(action: L2.actions.All) {
    const state = this.store.getState();
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
        this.dispatch(L1.actions.updatePlayer(action.id, {
          cards: state.l2[action.id].hand.length
        }));
        this.dispatch(L1.actions.update(
          rules.getStateAfterPlay(action.payload, state.l1)
        ));
        break;
      case L2.actions.RESET_GAME:
        this.dispatch(L1.actions.resetGame());
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
    let card;
    const state = this.store.getState();

    switch (action.type) {
      case Req.actions.DRAW_CARD:
        if (serverSelectors.canDraw(state, action.id)) {
          card = this.drawCard(action.id);
          if (card) this.dispatch(L2.actions.drawCard(card, action.id));
        }
        break;
      case Req.actions.PLAY_CARD:
        if (serverSelectors.canPlay(state, action.id, action.payload.cardId)) {
          card = this.playCard(action.id, action.payload.cardId, action.payload.color);
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
          cards: 0
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

  // TODO: support drawing several cards at once
  private drawCard(id: string) {
    let state = this.store.getState();

    if (!state.l0.upStack.length) {
      this.dispatch(L0.actions.shuffle());
      state = this.store.getState();
    }
    const upStack = state.l0.upStack;
    const card = upStack[upStack.length - 1];

    if (!card) return null;

    this.dispatch(L0.actions.drawCard(id));

    // action is dispatched synchronously, but we are still looking at old state
    if (upStack.length < 2) this.dispatch(L0.actions.shuffle());

    return card;
  }
}