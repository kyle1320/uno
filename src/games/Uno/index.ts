import { GameSpec } from "../../types";
import * as L0 from './level0';
import * as L1 from './level1';
import * as L2 from './level2';
import * as L3 from './level3';
import * as Req from './request';

export interface UnoSpec extends GameSpec {
  state: {
    l0: L0.state.State,
    l1: L1.state.State,
    l2: L2.state.State,
    l3: L3.state.State
  },
  actions: {
    l0: L0.actions.All;
    l1: L1.actions.All;
    l2: L2.actions.All;
    l3: L3.actions.All;
    req: Req.actions.All;
  }
}

export function shuffle(arr: unknown[]) {
  for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
  }
}

export { L0, L1, L2, L3, Req };