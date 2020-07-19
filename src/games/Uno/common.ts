import { state } from "../../types";
import { UnoSpec } from ".";

export interface Card {
  value: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "reverse" | "skip" | "wild" | "draw2" | "draw4";
  color: "red" | "green" | "blue" | "yellow" | "black";
  id: string;
}

export namespace selectors {
  export function relativeTurnOrder(state: state.ClientSide<UnoSpec>) {
    const turnOrder = state.l1.turnOrder;
    const myIndex = turnOrder.indexOf(state.l2.id);
    return [
      ...turnOrder.slice(myIndex),
      ...turnOrder.slice(0, myIndex),
    ];
  }
}

function shuffle(arr: unknown[]) {
  for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
  }
}

export function shuffled(arr: Card[]): Card[] {
  const copy = arr.map(c => {
    if (c.value === 'draw4' || c.value === 'wild') {
      return { ...c, color: 'black' } as Card;
    }
    return c;
  });
  shuffle(copy);
  return copy;
}