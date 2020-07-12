import { ServerGame } from "../../server/ServerGame";
import { UnoSpec, L0, L1, L2, L3, Req, shuffle } from ".";
import { Card } from "./common";
import { CoreActions } from "../../types";

export class UnoServer extends ServerGame<UnoSpec> {
  getInitialState() {
    const state = {
      l0: L0.state.initial,
      l1: L1.state.initial,
      l2: {},
      l3: {},
    }
    const deck = state.l0.upStack.slice();
    shuffle(deck);
    state.l0.upStack = deck;
    return state;
  }

  getInitialClientState(id: string) {
    return {
      l2: {
        ...L2.state.initial,
        id
      },
      l3: L3.state.initial
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
          downStackSize: state.downStack.length
        }))
        break;
    }
  }

  processL2(action: L2.actions.All) {
    const state = this.store.getState().l2;
    switch (action.type) {
      case L2.actions.DRAW_CARD:
      case L2.actions.PLAY_CARD:
        this.dispatch(L1.actions.updatePlayer(action.id, {
          cards: state[action.id].hand.length
        }));
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
    switch (action.type) {
      case Req.actions.DRAW_CARD:
        this.dispatch(L2.actions.drawCard(this.drawCard(), action.id));
        break;
      case Req.actions.PLAY_CARD:
        this.dispatch(L0.actions.playCard(this.playCard(action.id, action.payload)));
    }
  }

  processCore(action: CoreActions<UnoSpec>) {
    switch (action.type) {
      case CoreActions.CLIENT_JOIN:
        this.dispatch(L1.actions.addPlayer({
          id: action.payload,
          name: 'Player', // TODO: get the name from somewhere here?
          cards: 0
        }));
        break;
    }
  }

  private playCard(clientId: string, index: number): Card {
    const state = this.store.getState().l2[clientId];
    const card = state.hand[index];

    this.dispatch(L2.actions.playCard(index, clientId));

    // TODO: update card counts

    return card;
  }

  private drawCard(): Card {
    let state = this.store.getState();

    if (!state.l0.upStack.length) {
      this.dispatch(L0.actions.shuffle());
      state = this.store.getState();
    }
    const upStack = state.l0.upStack;
    const card = upStack[upStack.length - 1];

    this.dispatch(L0.actions.drawCard());

    // action is dispatched synchronously, but we are still looking at old state
    if (upStack.length < 2) this.dispatch(L0.actions.shuffle());

    return card;
  }
}