import * as React from 'react';

import { ClientGame } from '../../client/ClientGame';
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
        this.dispatch(L4.actions.updateSettings(prefs));
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
    const state = this.getState();
    switch (action.type) {
      case L1.actions.UPDATE_PLAYER:
        if (action.payload.didCallUno) {
          this.dispatch(
            L4.actions.pushToast(
              `${state.l1.players[action.id].name} called Uno!`
            )
          );
        }
        break;
      case L1.actions.PLAYER_WIN:
        if (action.id === state.l2.id) {
          this.dispatch(
            L4.actions.update({
              didWin: true
            })
          );
        }
        this.dispatch(
          L4.actions.pushToast(
            `${state.l1.players[action.id].name} went out with ${
              action.payload
            } point${action.payload === 1 ? '' : 's'}!`
          )
        );
        break;
      case L1.actions.RESET_GAME:
        this.dispatch(
          L4.actions.update({
            didWin: false
          })
        );
        break;
      case L1.actions.GAME_OVER:
        let duration = action.payload.duration;
        duration = Math.floor(duration / 1000);
        const s = duration % 60;
        const m = Math.floor(duration / 60);

        this.dispatch(
          L4.actions.pushToast(
            `Game over! The game lasted ${m} minute${
              m === 1 ? '' : 's'
            } and ${s} second${s === 1 ? '' : 's'}`
          )
        );
        break;
      case L1.actions.CALLOUT:
        this.dispatch(
          L4.actions.pushToast(
            `${state.l1.players[action.payload.callerId].name} called out ` +
              `${
                state.l1.players[action.payload.targetId].name
              } on not saying Uno!`
          )
        );
        break;
      case L1.actions.RESET_SCORES:
        this.dispatch(L4.actions.pushToast(`Players scores have been reset`));
        break;
      case L1.actions.UPDATE_RULES:
        for (const k in action.payload) {
          const key = k as keyof L1.state.Rules;
          const name = ((): string => {
            switch (key) {
              case 'stackDraw2':
                return 'Stack Draw 2s';
              case 'stackDraw4':
                return 'Stack Draw 4s';
              case 'stackDraw4OnDraw2':
                return 'Stack Draw 4s on Draw 2s';
              case 'stackDraw2OnDraw4':
                return 'Stack Draw 2s on Draw 4s';
              case 'drawTillYouPlay':
                return "Draw 'Till You Play";
              case 'battleRoyale':
                return 'Battle Royale';
              case 'penaltyCardCount':
                return 'Uno Penalty Cards';
              case 'aiCount':
                return 'AI Players';
              case 'initialCards':
                return 'Starting Cards';
              case 'lobbyMode':
                return 'Lobby Mode';
              case 'deckCount':
                return 'Number of Decks';
              case 'jumpIn':
                return 'Jump-In';
            }
          })();
          const value = (() => {
            const val = action.payload[key];
            switch (typeof val) {
              case 'boolean':
                return val ? 'enabled' : 'disabled';
              case 'number':
                return 'set to ' + val;
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
    if (action.type === L4.actions.UPDATE_SETTINGS) {
      const settings = this.getL4State().settings;
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(settings));
    } else if (action.type === L4.actions.PUSH_TOAST) {
      setTimeout(() => this.dispatch(L4.actions.popToast()), 4000);
    }
  }

  protected getRootElement() {
    return <Uno />;
  }
}
