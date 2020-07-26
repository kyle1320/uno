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

  protected processL1(action: L1.actions.All) {
    const state = this.getL1State();
    switch (action.type) {
      case L1.actions.UPDATE_PLAYER:
        if (action.payload.didCallUno) {
          this.dispatch(L4.actions.pushToast(
            `${state.players[action.id].name} called Uno!`
          ));
        }
        break;
      case L1.actions.PLAYER_WIN:
        this.dispatch(L4.actions.pushToast(
          `${state.players[action.id].name} went out with ${action.payload} points!`
        ));
        break;
      case L1.actions.UPDATE_RULES:
        for (const k in action.payload) {
          const key = k as keyof L1.state.Rules;
          const name = (() => {
            switch (key) {
              case 'stackDraw2': return "Stack Draw 2s";
              case 'stackDraw4': return "Stack Draw 4s";
              case 'stackDraw4OnDraw2': return "Stack Draw 4s on Draw 2s";
              case 'stackDraw2OnDraw4': return "Stack Draw 2s on Draw 4s";
              case 'drawTillYouPlay': return "Draw 'Till You Play";
              case 'battleRoyale': return "Battle Royale";
              case 'penaltyCardCount': return "Uno Penalty Cards";
            }
          })();
          const value = (() => {
            const val = action.payload[key];
            switch (typeof val) {
              case 'boolean': return val ? 'enabled' : 'disabled';
              case 'number': return 'set to ' + val;
            }
          })();
          this.dispatch(L4.actions.pushToast(`Rule Changed: ${name} ${value}`));
        }
        break;
    }
  }

  protected processL3(action: L3.actions.All) {
    if (action.type === L3.actions.SET_NAME) {
      localStorage.setItem(NAME_STORAGE_KEY, action.payload);
    }
  }

  protected processL4(action: L4.actions.All) {
    if (action.type === L4.actions.UPDATE) {
      const state = this.getL4State();
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(state));
    } else if (action.type === L4.actions.PUSH_TOAST) {
      setTimeout(() => this.dispatch(L4.actions.popToast()), 2000);
    }
  }

  protected getRootElement() {
    return <Uno />;
  }
}