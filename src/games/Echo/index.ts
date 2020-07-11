import { GameSpec } from "../../types";
import * as L1 from './level1';
import * as L3 from './level3';
import * as Req from './request';

export interface EchoSpec extends GameSpec {
  state: {
    l1: L1.state.State,
    l3: L3.state.State
  },
  actions: {
    l1: L1.actions.All;
    l3: L3.actions.All;
    req: Req.actions.All;
  }
}

export { L1, L3, Req };