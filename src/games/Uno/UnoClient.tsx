import * as React from 'react';

import { ClientGame } from "../../client/ClientGame";
import { UnoSpec, L1, L2, L3, L4 } from '.';
import Uno from './components/Uno';

const NAME_STORAGE_KEY = 'preferredName';
const PREFERENCES_STORAGE_KEY = 'localPreferences';

export class UnoClient extends ClientGame<UnoSpec> {
  protected createInitialState() {
    return {
      l1: L1.state.initial,
      l2: L2.state.initial,
      l3: L3.state.initial,
      l4: L4.state.initial
    };
  }

  protected setup() {
    const name = localStorage.getItem(NAME_STORAGE_KEY);
    if (name) {
      this.dispatch(L3.actions.setName(name));
    }

    const prefsString = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (prefsString) {
      try {
        const prefs = JSON.parse(prefsString);
        this.dispatch(L4.actions.update(prefs));
      } catch (e) {
        //
      }
    }
  }

  protected reduceL1 = L1.reduce;
  protected reduceL2 = L2.reduce;
  protected reduceL3 = L3.reduce;
  protected reduceL4 = L4.reduce;

  protected processL3(action: L3.actions.All) {
    if (action.type === L3.actions.SET_NAME) {
      localStorage.setItem(NAME_STORAGE_KEY, action.payload);
    }
  }

  protected processL4(action: L4.actions.All) {
    if (action.type === L4.actions.UPDATE) {
      const state = this.getL4State();
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(state));
    }
  }

  protected getRootElement() {
    return <Uno />;
  }
}