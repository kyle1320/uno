import { GameServer } from "./GameServer";
import { UnoServer } from "../games/Uno/UnoServer";

new GameServer(UnoServer).start();