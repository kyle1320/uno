import { GameSpec } from '../../types';
import * as L0 from './level0';
import * as L1 from './level1';
import * as L2 from './level2';
import * as L3 from './level3';
import * as L4 from './level4';
import * as Req from './request';

export interface UnoSpec extends GameSpec {
  state: {
    l0: L0.state.State;
    l1: L1.state.State;
    l2: L2.state.State;
    l3: L3.state.State;
    l4: L4.state.State;
  };
  actions: {
    l0: L0.actions.All;
    l1: L1.actions.All;
    l2: L2.actions.All;
    l3: L3.actions.All;
    l4: L4.actions.All;
    req: Req.actions.All;
  };
}

export { L0, L1, L2, L3, L4, Req };
