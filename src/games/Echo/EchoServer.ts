import { ServerGame } from '../../server/ServerGame';
import { EchoSpec, L1, L3, Req } from '.';

export class EchoServer extends ServerGame<EchoSpec> {
  createInitialState() {
    return {
      l0: {},
      l1: L1.state.initial,
      l2: {},
      l3: {}
    };
  }

  createInitialClientState() {
    return {
      l2: {},
      l3: L3.state.initial
    };
  }

  protected reduceL1 = L1.reduce;
  protected reduceL3 = L3.reduce;

  processRequest(action: Req.actions.All) {
    if (action.type === Req.actions.SEND) {
      const state = this.getL3State(action);
      this.store.dispatch(L1.actions.message(state.message));
      this.store.dispatch(L3.actions.type('', this.getClient(action).id));
    }
  }
}
