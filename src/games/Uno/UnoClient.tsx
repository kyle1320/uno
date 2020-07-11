import * as React from 'react';

import { ClientGame } from "../../client/ClientGame";
import { UnoSpec, L1, L2, L3 } from '.';
import Uno from './components/Uno';

export class UnoClient extends ClientGame<UnoSpec> {
  protected getInitialState() {
    return {
      l1: L1.state.initial,
      l2: L2.state.initial,
      l3: L3.state.initial
    };
  }

  protected reduceL1 = L1.reduce;
  protected reduceL2 = L2.reduce;
  protected reduceL3 = L3.reduce;

  protected getRootElement() {
    return <Uno />;
  }
}