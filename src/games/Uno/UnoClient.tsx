import * as React from 'react';

import { ClientGame } from "../../client/ClientGame";
import { UnoSpec, L1, L2, L3 } from '.';
import Uno from './components/Uno';

const NAME_STORAGE_KEY = 'preferredName';

export class UnoClient extends ClientGame<UnoSpec> {
  public constructor() {
    super();

    // document.addEventListener("touchmove", e => {
    //   e.preventDefault();
    // }, { passive: false });
  }

  protected getInitialState() {
    return {
      l1: L1.state.initial,
      l2: L2.state.initial,
      l3: L3.state.initial,
      l4: {}
    };
  }

  protected setup() {
    const name = localStorage.getItem(NAME_STORAGE_KEY);
    if (name) {
      this.dispatch(L3.actions.setName(name));
    }
  }

  protected reduceL1 = L1.reduce;
  protected reduceL2 = L2.reduce;
  protected reduceL3 = L3.reduce;

  protected processL3(action: L3.actions.All) {
    if (action.type === L3.actions.SET_NAME) {
      localStorage.setItem(NAME_STORAGE_KEY, action.payload);
    }
  }

  protected getRootElement() {
    return <Uno />;
  }
}