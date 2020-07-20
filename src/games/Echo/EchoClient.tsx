import * as React from 'react';

import { ClientGame } from "../../client/ClientGame";
import { EchoSpec, L1, L3 } from '.';
import Echo from './components/Echo';

export class EchoClient extends ClientGame<EchoSpec> {
  protected createInitialState() {
    return {
      l1: L1.state.initial,
      l2: {},
      l3: L3.state.initial,
      l4: {}
    };
  }

  protected reduceL1 = L1.reduce;
  protected reduceL3 = L3.reduce;

  protected getRootElement() {
    return <Echo />;
  }
}