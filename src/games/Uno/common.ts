import { state } from "../../types";
import { UnoSpec, L1, L2 } from ".";

export type Color = "red" | "green" | "blue" | "yellow";
export interface Card {
  value: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "reverse" | "skip" | "wild" | "draw2" | "draw4";
  color: Color | "black";
  id: number;
}

export namespace clientSelectors {
  export function relativeTurnOrder(state: state.ClientSide<UnoSpec>) {
    const turnOrder = state.l1.turnOrder;
    const myIndex = turnOrder.indexOf(state.l2.id);
    return [
      ...turnOrder.slice(myIndex),
      ...turnOrder.slice(0, myIndex),
    ];
  }

  export function currentPlayer(state: state.ClientSide<UnoSpec>) {
    return state.l1.turnOrder[state.l1.currentPlayer];
  }

  export function isYourTurn(state: state.ClientSide<UnoSpec>) {
    return state.l1.status === L1.state.GameStatus.Started
      && currentPlayer(state) === state.l2.id;
  }

  export function canDraw(state: state.ClientSide<UnoSpec>) {
    return isYourTurn(state) && rules.canDraw(state.l1, state.l2);
  }

  export function canPlay(state: state.ClientSide<UnoSpec>, cardId: number) {
    return isYourTurn(state) && rules.canPlay(cardId, state.l1, state.l2);
  }

  export function canPlayAny(state: state.ClientSide<UnoSpec>) {
    return isYourTurn(state) && rules.canPlayAny(state.l1, state.l2);
  }

  export function mustDraw(state: state.ClientSide<UnoSpec>) {
    return isYourTurn(state) && !rules.canPlayAny(state.l1, state.l2);
  }

  export function canCallUno(state: state.ClientSide<UnoSpec>) {
    return rules.canCallUno(state.l1, state.l2.id);
  }

  export function canCalloutUno(state: state.ClientSide<UnoSpec>) {
    return rules.canCalloutUno(state.l1, state.l2.id);
  }
}

export namespace serverSelectors {
  export function currentPlayer(state: state.ServerSide<UnoSpec>) {
    return state.l1.turnOrder[state.l1.currentPlayer];
  }

  export function canDraw(state: state.ServerSide<UnoSpec>, id: string) {
    return currentPlayer(state) === id && rules.canDraw(state.l1, state.l2[id]);
  }

  export function canPlay(state: state.ServerSide<UnoSpec>, clientId: string, cardId: number) {
    return currentPlayer(state) === clientId
      && rules.canPlay(cardId, state.l1, state.l2[clientId]);
  }

  export function canCallUno(state: state.ServerSide<UnoSpec>, id: string) {
    return rules.canCallUno(state.l1, id);
  }

  export function canCalloutUno(state: state.ServerSide<UnoSpec>, id: string) {
    return rules.canCalloutUno(state.l1, id);
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
}

export namespace rules {
  export function canDraw(l1: L1.state.State, l2: L2.state.State) {
    if (l1.status !== 'started') return false;

    switch (l1.ruleState.type) {
      case "normal":
        return !l1.rules.drawTillYouPlay || !canPlayAny(l1, l2);
      case "draw":
      case "draw2":
      case "draw4":
        return true;
      case "maybePlay":
        return l1.rules.drawTillYouPlay && !canPlay(l2.lastDrawnCard!, l1, l2);
    }
  }

  export function canPlayAny(l1: L1.state.State, l2: L2.state.State) {
    if (l1.status !== 'started') return false;

    for (const card of l2.hand) {
      if (canPlay(card.id, l1, l2)) return true;
    }
    return false;
  }

  export function canPlay(
    cardId: number,
    l1: L1.state.State,
    l2: L2.state.State
  ) {
    if (l1.status !== 'started') return false;

    const card = getCardFromId(cardId);

    if (!card) return false;

    switch (l1.ruleState.type) {
      case "normal":
        return cardMatches(card, l1.topCard);
      case "draw2":
        return (l1.rules.stackDraw2 && card.value === 'draw2')
          || (l1.rules.stackDraw4OnDraw2 && card.value === 'draw4')
      case "draw4":
        return (l1.rules.stackDraw4 && card.value === 'draw4')
          || (l1.rules.stackDraw2OnDraw4 && card.value === 'draw2' && cardMatches(card, l1.topCard))
      case "draw":
        return false;
      case "maybePlay":
        return cardId === l2.lastDrawnCard && cardMatches(card, l1.topCard);
    }
  }

  export function cardMatches(play: Card, current: Card | null) {
    if (current == null) return true;
    if (play.value === 'wild' || play.value === 'draw4') return true;
    return play.color === current.color || play.value === current.value;
  }

  function getTurnAtDistance(l1: L1.state.State, dist: number) {
    let index = l1.currentPlayer + l1.turnOrder.length;
    for (var i = 0; dist !== 0 && i < l1.turnOrder.length; i++) {
      if (dist > 0) {
        index++;
        if (l1.players[l1.turnOrder[index % l1.turnOrder.length]].isInGame) {
          dist--;
        }
      } else {
        index--;
        if (l1.players[l1.turnOrder[index % l1.turnOrder.length]].isInGame) {
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
    return l1.direction === 'CW' ? 'CCW' : 'CW'
  }

  export function getNextTurnReverse(l1: L1.state.State) {
    if (l1.turnOrder.filter(id => l1.players[id].isInGame).length == 2) {
      return getSkipTurn(l1);
    }

    return getNextTurn(l1, getReverseDirection(l1));
  }

  export function getStateAfterDraw(cardId: number, l1: L1.state.State): Partial<L1.state.State> {
    const card = getCardFromId(cardId);

    if (!card) return {};

    switch (l1.ruleState.type) {
      case "draw2":
      case "draw4":
      case "draw":
        return l1.ruleState.count <= 1
          ? { ruleState: { type: 'normal' }, currentPlayer: getNextTurn(l1) }
          : { ruleState: { type: 'draw', count: l1.ruleState.count - 1 } };
      case "normal":
      case "maybePlay":
        return cardMatches(card, l1.topCard) || l1.rules.drawTillYouPlay
          ? { ruleState: { type: 'maybePlay' } }
          : { ruleState: { type: 'normal' }, currentPlayer: getNextTurn(l1) }
    }
  }

  export function getStateAfterPlay(cardId: number, l1: L1.state.State): Partial<L1.state.State> {
    const card = getCardFromId(cardId);

    if (!card) return {};

    const count = 'count' in l1.ruleState ? l1.ruleState.count : 0;
    switch (card.value) {
      case 'draw2':
        return {
          ruleState: { type: 'draw2', count: count + 2 },
          currentPlayer: getNextTurn(l1)
        };
      case 'draw4':
        return {
          ruleState: { type: 'draw4', count: count + 4 },
          currentPlayer: getNextTurn(l1)
        };
      case 'reverse':
        return {
          ruleState: { type: 'normal' },
          direction: getReverseDirection(l1),
          currentPlayer: getNextTurnReverse(l1)
        };
      case 'skip':
        return {
          ruleState: { type: 'normal' },
          currentPlayer: getSkipTurn(l1)
        };
      default:
        return {
          ruleState: { type: 'normal' },
          currentPlayer: getNextTurn(l1)
        };
    }
  }

  export function canCallUno(l1: L1.state.State, id: string) {
    const player = l1.players[id];
    return player && player.isInGame && !(player.didCallUno);
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
      case "0": return 0;
      case "1": return 1;
      case "2": return 2;
      case "3": return 3;
      case "4": return 4;
      case "5": return 5;
      case "6": return 6;
      case "7": return 7;
      case "8": return 8;
      case "9": return 9;
      case "skip":
      case "reverse":
      case "draw2": return 20;
      case "wild":
      case "draw4": return 50;
    }
  }
}

export const baseDeck: readonly Card[] = (function () {
  const deck: Card[] = [];

  let _cardId = 0;
  function getId() {
    return _cardId++;
  }

  for (const color of (["red", "yellow", "green", "blue"] as const)) {
    for (const value of ([
      "0", "1", "1", "2", "2", "3", "3", "4", "4", "5", "5",
      "6", "6", "7", "7", "8", "8", "9", "9",
      "reverse", "reverse", "skip", "skip", "draw2", "draw2"
    ] as const)) {
      deck.push({ color, value, id: getId() });
    }
  }

  for (const value of ([
    "wild", "wild", "wild", "wild", "draw4", "draw4", "draw4", "draw4"
  ] as const)) {
    deck.push({ color: "black", value, id: getId() });
  }

  return deck;
}());

export function getCardFromId(id: number): Card | null {
  return baseDeck[id] || null;
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