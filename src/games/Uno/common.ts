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