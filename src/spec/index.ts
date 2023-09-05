import { IApplicationSpec } from "@redux-mc/util";

import * as L0 from "./L0";
import * as L1 from "./L1";
import * as L2 from "./L2";
import * as L3 from "./L3";
import * as L4 from "./L4";
import * as Req from "./Req";

export * from "./common";

export const VERSION_MISMATCH_ERROR = new Error("Version mismatch!");

export interface Spec extends IApplicationSpec {
  state: {
    L0: L0.State;
    L1: L1.State;
    L2: L2.State;
    L3: L3.State;
    L4: L4.State;
  };
  actions: {
    L0: L0.Action;
    L1: L1.Action;
    L2: L2.Action;
    L3: L3.Action;
    L4: L4.Action;
    Req: Req.Action;
  };
}

export { L0, L1, L2, L3, L4, Req };
