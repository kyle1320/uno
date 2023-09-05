import { AllActions, createReqAction } from "@redux-mc/util";
import { Color } from "./common";
import * as L1 from "./L1";

export const actions = {
  drawCard: createReqAction("drawCard")<void>(),
  updateRules: createReqAction("updateRules")<Partial<L1.Rules>>(),
  playCard: createReqAction("playCard")<{
    cardId: number;
    color?: Color;
  }>(),
  resetScores: createReqAction("resetScores")<void>(),
  resetGame: createReqAction("resetGame")<{
    shufflePlayers: boolean;
  }>(),
  callUno: createReqAction("callUno")<void>(),
  calloutUno: createReqAction("calloutUno")<void>(),
  shufflePlayers: createReqAction("shufflePlayers")<void>()
};
export type Action = AllActions<typeof actions>;
