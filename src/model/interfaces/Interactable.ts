import PlayerModel from "../Player";
import GameController from "../../controller/GameController";

export interface Interactable {
  mapChar: string;
  color: (text: string) => string; // e.g., kleur.yellow
  onInteract(player: PlayerModel, gameController: GameController): string; // Returns interaction message
  isReusable: boolean;
  id?: string; // For tracking state if not reusable
}