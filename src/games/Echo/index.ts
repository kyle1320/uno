import { GameSpec } from "../../types";
import * as L1 from './level1';
import * as L3 from './level3';
import * as Req from './request';

export interface EchoSpec extends GameSpec {
  state: {
    l0: {};
    l1: L1.state.State;
    l2: {};
    l3: L3.state.State;
    l4: {};
  };
  actions: {
    l0: never;
    l1: L1.actions.All;
    l2: never;
    l3: L3.actions.All;
    l4: never;
    req: Req.actions.All;
  };
}

export { L1, L3, Req };