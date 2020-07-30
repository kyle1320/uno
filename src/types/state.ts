import { GameSpec } from ".";

export type ServerSide<G extends GameSpec = GameSpec> = {
  l0: L0<G>;
  l1: L1<G>;
  l2: { [id: string]: L2<G> };
  l3: { [id: string]: L3<G> };
};
export type ClientSide<G extends GameSpec = GameSpec> = {
  connected: boolean;
  error?: any;
  timeOffset: number;
  l1: L1<G>;
  l2: L2<G>;
  l3: L3<G>;
  l4: L4<G>;
};
export type L0<G extends GameSpec = GameSpec> = G["state"]["l0"];
export type L1<G extends GameSpec = GameSpec> = G["state"]["l1"];
export type L2<G extends GameSpec = GameSpec> = G["state"]["l2"];
export type L3<G extends GameSpec = GameSpec> = G["state"]["l3"];
export type L4<G extends GameSpec = GameSpec> = G["state"]["l4"];