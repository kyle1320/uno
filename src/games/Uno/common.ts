import { state } from '../../types';
import { UnoSpec, L1, L2 } from '.';

export type Color = 'red' | 'green' | 'blue' | 'yellow';
export interface Card {
  value:
    | '0'
    | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | 'reverse'
    | 'skip'
    | 'wild'
    | 'draw2'
    | 'draw4';
  color: Color | 'black';
  id: number;
}

export namespace clientSelectors {
  export function relativeTurnOrder(state: state.ClientSide<UnoSpec>) {
    const turnOrder = state.l1.turnOrder;
    const myIndex = turnOrder.indexOf(state.l2.id);
    return [...turnOrder.slice(myIndex), ...turnOrder.slice(0, myIndex)];
  }

  export function currentPlayer(state: state.ClientSide<UnoSpec>) {
    return state.l1.turnOrder[state.l1.currentPlayer];
  }

  export function inGame(state: state.ClientSide<UnoSpec>) {
    return (
      state.l1.status === L1.state.GameStatus.Started &&
      state.l1.players[state.l2.id].isInGame
    );
  }

  export function isYourTurn(state: state.ClientSide<UnoSpec>) {
    return currentPlayer(state) === state.l2.id;
  }

  export function canDraw(state: state.ClientSide<UnoSpec>) {
    return (
      inGame(state) && rules.canDraw(state.l1, state.l2, isYourTurn(state))
    );
  }

  export function canPlay(state: state.ClientSide<UnoSpec>, cardId: number) {
    return (
      inGame(state) &&
      rules.canPlay(cardId, state.l1, state.l2, isYourTurn(state))
    );
  }

  export function canPlayAny(state: state.ClientSide<UnoSpec>) {
    return (
      inGame(state) && rules.canPlayAny(state.l1, state.l2, isYourTurn(state))
    );
  }

  export function mustDraw(state: state.ClientSide<UnoSpec>) {
    return (
      isYourTurn(state) &&
      !rules.canPlayAny(state.l1, state.l2, isYourTurn(state))
    );
  }

  export function canCallUno(state: state.ClientSide<UnoSpec>) {
    return rules.canCallUno(state.l1, state.l2.id);
  }

  export function canCalloutUno(state: state.ClientSide<UnoSpec>) {
    return rules.canCalloutUno(state.l1, state.l2.id);
  }

  export function turnTimerActive(state: state.ClientSide<UnoSpec>) {
    return rules.turnTimerActive(state.l1);
  }
}

export namespace serverSelectors {
  export function currentPlayer(state: state.ServerSide<UnoSpec>) {
    return state.l1.turnOrder[state.l1.currentPlayer];
  }

  export function inGame(state: state.ServerSide<UnoSpec>, id: string) {
    return state.l1.players[id].isInGame;
  }

  export function isTurn(state: state.ServerSide<UnoSpec>, id: string) {
    return currentPlayer(state) === id;
  }

  export function canDraw(state: state.ServerSide<UnoSpec>, id: string) {
    return (
      inGame(state, id) &&
      rules.canDraw(state.l1, state.l2[id], isTurn(state, id))
    );
  }

  export function canPlay(
    state: state.ServerSide<UnoSpec>,
    clientId: string,
    cardId: number
  ) {
    return (
      inGame(state, clientId) &&
      rules.canPlay(
        cardId,
        state.l1,
        state.l2[clientId],
        isTurn(state, clientId)
      )
    );
  }

  export function canCallUno(state: state.ServerSide<UnoSpec>, id: string) {
    const cards = state.l1.players[id].cards;
    return (
      inGame(state, id) &&
      rules.canCallUno(state.l1, id) &&
      (cards === 1 ||
        (cards === 2 &&
          rules.canPlayAny(state.l1, state.l2[id], isTurn(state, id))))
    );
  }

  export function canCalloutUno(state: state.ServerSide<UnoSpec>, id: string) {
    return inGame(state, id) && rules.canCalloutUno(state.l1, id);
  }

  export function getScore(state: state.ServerSide<UnoSpec>) {
    let score = 0;
    for (const playerId of state.l1.turnOrder) {
      const player = state.l1.players[playerId];
      if (player.isInGame) {
        score += rules.getScore(state.l2[playerId]);
      }
    }
    return score;
  }

  export function turnTimerActive(state: state.ServerSide<UnoSpec>) {
    return rules.turnTimerActive(state.l1);
  }
}

export namespace rules {
  export function canDraw(
    l1: L1.state.State,
    l2: L2.state.State,
    isTurn: boolean
  ) {
    if (l1.status !== 'started') return false;

    if (!isTurn) return false;

    switch (l1.ruleState.type) {
      case 'normal':
        return !l1.rules.drawTillYouPlay || !canPlayAny(l1, l2, isTurn);
      case 'draw':
      case 'draw2':
      case 'draw4':
        return true;
      case 'maybePlay':
        return (
          l1.rules.drawTillYouPlay &&
          !canPlay(l2.lastDrawnCard!, l1, l2, isTurn)
        );
    }
  }

  export function canPlayAny(
    l1: L1.state.State,
    l2: L2.state.State,
    isTurn: boolean
  ) {
    if (l1.status !== 'started') return false;

    for (const card of l2.hand) {
      if (canPlay(card.id, l1, l2, isTurn)) return true;
    }
    return false;
  }

  export function canPlay(
    cardId: number,
    l1: L1.state.State,
    l2: L2.state.State,
    isTurn: boolean
  ) {
    if (l1.status !== 'started') return false;

    const card = getCardFromId(cardId);

    if (!isTurn) {
      if (l1.rules.jumpIn) {
        return (
          (l1.topCard &&
            card &&
            l1.topCard.color === card.color &&
            l1.topCard.value === card.value) ||
          false
        );
      } else {
        return false;
      }
    }

    if (!card) return false;

    switch (l1.ruleState.type) {
      case 'normal':
        return cardMatches(card, l1.topCard);
      case 'draw2':
        return (
          (l1.rules.stackDraw2 && card.value === 'draw2') ||
          (l1.rules.stackDraw4OnDraw2 && card.value === 'draw4')
        );
      case 'draw4':
        return (
          (l1.rules.stackDraw4 && card.value === 'draw4') ||
          (l1.rules.stackDraw2OnDraw4 &&
            card.value === 'draw2' &&
            cardMatches(card, l1.topCard))
        );
      case 'draw':
        return false;
      case 'maybePlay':
        return cardId === l2.lastDrawnCard && cardMatches(card, l1.topCard);
    }
  }

  export function cardMatches(play: Card, current: Card | null) {
    if (current == null) return true;
    if (play.value === 'wild' || play.value === 'draw4') return true;
    return play.color === current.color || play.value === current.value;
  }

  function shouldPlay(l1: L1.state.State, id: string): boolean {
    const player = l1.players[id];
    return player.isInGame && !(l1.rules.lobbyMode && !player.connected);
  }

  function getTurnAtDistance(l1: L1.state.State, dist: number) {
    let index = l1.currentPlayer + l1.turnOrder.length;
    for (var i = 0; dist !== 0 && i < l1.turnOrder.length; i++) {
      if (dist > 0) {
        index++;
        if (shouldPlay(l1, l1.turnOrder[index % l1.turnOrder.length])) {
          dist--;
        }
      } else {
        index--;
        if (shouldPlay(l1, l1.turnOrder[index % l1.turnOrder.length])) {
          dist++;
        }
      }
    }
    return index % l1.turnOrder.length;
  }

  export function getNextTurn(l1: L1.state.State, direction = l1.direction) {
    return getTurnAtDistance(l1, direction === 'CW' ? 1 : -1);
  }

  export function getSkipTurn(l1: L1.state.State, direction = l1.direction) {
    return getTurnAtDistance(l1, direction === 'CW' ? 2 : -2);
  }

  export function getReverseDirection(l1: L1.state.State) {
    return l1.direction === 'CW' ? 'CCW' : 'CW';
  }

  export function getNextTurnReverse(l1: L1.state.State) {
    if (l1.turnOrder.filter(id => shouldPlay(l1, id)).length == 2) {
      return getSkipTurn(l1);
    }

    return getNextTurn(l1, getReverseDirection(l1));
  }

  export function getStateAfterDraw(
    cardId: number,
    l1: L1.state.State
  ): Partial<L1.state.State> {
    const card = getCardFromId(cardId);

    if (!card) return {};

    switch (l1.ruleState.type) {
      case 'draw2':
      case 'draw4':
      case 'draw':
        return l1.ruleState.count <= 1
          ? {
              ruleState: { type: 'normal' },
              currentPlayer: getNextTurn(l1),
              turnCount: l1.turnCount + 1
            }
          : { ruleState: { type: 'draw', count: l1.ruleState.count - 1 } };
      case 'normal':
      case 'maybePlay':
        return cardMatches(card, l1.topCard) || l1.rules.drawTillYouPlay
          ? { ruleState: { type: 'maybePlay' } }
          : {
              ruleState: { type: 'normal' },
              currentPlayer: getNextTurn(l1),
              turnCount: l1.turnCount + 1
            };
    }
  }

  export function getStateAfterPlay(
    cardId: number,
    l1: L1.state.State,
    playerId: string | null
  ): Partial<L1.state.State> {
    const card = getCardFromId(cardId);

    if (!card) return {};

    const tempL1 = playerId
      ? { ...l1, currentPlayer: l1.turnOrder.indexOf(playerId) }
      : l1;

    const count = 'count' in l1.ruleState ? l1.ruleState.count : 0;
    switch (card.value) {
      case 'draw2':
        return {
          ruleState: { type: 'draw2', count: count + 2 },
          currentPlayer: getNextTurn(tempL1),
          turnCount: l1.turnCount + 1
        };
      case 'draw4':
        return {
          ruleState: { type: 'draw4', count: count + 4 },
          currentPlayer: getNextTurn(tempL1),
          turnCount: l1.turnCount + 1
        };
      case 'reverse':
        return {
          ruleState: { type: 'normal' },
          direction: getReverseDirection(tempL1),
          currentPlayer: getNextTurnReverse(tempL1),
          turnCount: l1.turnCount + 1
        };
      case 'skip':
        return {
          ruleState: { type: 'normal' },
          currentPlayer: getSkipTurn(tempL1),
          turnCount: l1.turnCount + 1
        };
      default:
        return {
          ruleState: { type: 'normal' },
          currentPlayer: getNextTurn(tempL1),
          turnCount: l1.turnCount + 1
        };
    }
  }

  // the player forfeits their turn (by timing out)
  export function getStateAfterForfeit(
    l1: L1.state.State
  ): Partial<L1.state.State> {
    switch (l1.ruleState.type) {
      case 'draw2':
      case 'draw4':
      case 'draw':
        return l1.ruleState.count <= 1
          ? {
              ruleState: { type: 'normal' },
              currentPlayer: getNextTurn(l1),
              turnCount: l1.turnCount + 1
            }
          : { ruleState: { type: 'draw', count: l1.ruleState.count - 1 } };
      case 'normal':
      case 'maybePlay':
        return {
          ruleState: { type: 'normal' },
          currentPlayer: getNextTurn(l1),
          turnCount: l1.turnCount + 1
        };
    }
  }

  export function canCallUno(l1: L1.state.State, id: string) {
    const player = l1.players[id];
    return player && player.isInGame && !player.didCallUno;
  }

  export function canCalloutUno(l1: L1.state.State, id: string) {
    const player = l1.players[id];
    return player && player.isInGame;
  }

  export function getScore(l2: L2.state.State) {
    return l2.hand.reduce((acc, c) => acc + getCardScore(c), 0);
  }

  export function getCardScore(card: Card) {
    switch (card.value) {
      case '0':
        return 0;
      case '1':
        return 1;
      case '2':
        return 2;
      case '3':
        return 3;
      case '4':
        return 4;
      case '5':
        return 5;
      case '6':
        return 6;
      case '7':
        return 7;
      case '8':
        return 8;
      case '9':
        return 9;
      case 'skip':
      case 'reverse':
      case 'draw2':
        return 20;
      case 'wild':
      case 'draw4':
        return 50;
    }
  }

  export function turnTimerActive(l1: L1.state.State) {
    return l1.rules.lobbyMode && l1.status === L1.state.GameStatus.Started;
  }
}

let _globalCardId = 0;
export function getNewDeck() {
  const deck: Card[] = [];
  let cardId = 0;

  const remainder = _globalCardId % 108;
  if (remainder !== 0) {
    // this shouldn't happen, but just in case
    _globalCardId += 108 - remainder;
  }

  for (const color of ['red', 'yellow', 'green', 'blue'] as const) {
    for (const value of [
      '0',
      '1',
      '1',
      '2',
      '2',
      '3',
      '3',
      '4',
      '4',
      '5',
      '5',
      '6',
      '6',
      '7',
      '7',
      '8',
      '8',
      '9',
      '9',
      'reverse',
      'reverse',
      'skip',
      'skip',
      'draw2',
      'draw2'
    ] as const) {
      deck.push({ color, value, id: _globalCardId++ });
    }
  }

  for (const value of [
    'wild',
    'wild',
    'wild',
    'wild',
    'draw4',
    'draw4',
    'draw4',
    'draw4'
  ] as const) {
    deck.push({ color: 'black', value, id: _globalCardId++ });
  }

  return deck;
}
const baseDeck: readonly Card[] = getNewDeck();

export function getCardFromId(id: number): Card | null {
  return baseDeck[id % 108] || null;
}

function shuffle(arr: unknown[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}

export function shuffled(arr: readonly Card[]): Card[] {
  const copy = arr.map(c => {
    if (c.value === 'draw4' || c.value === 'wild') {
      return { ...c, color: 'black' } as Card;
    }
    return c;
  });
  shuffle(copy);
  return copy;
}

export function repeat<T>(
  arr: readonly T[] | (() => readonly T[]),
  times: number
): T[] {
  let arrays;
  if (typeof arr === 'function') {
    arrays = [];
    for (let i = 0; i < times; i++) {
      arrays.push(arr());
    }
  } else {
    arrays = new Array(times).fill(arr);
  }
  return [].concat(...arrays);
}
