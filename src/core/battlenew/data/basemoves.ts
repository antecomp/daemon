import { Move, MoveType } from "../types/move";
import { PreparedAttackBonus } from "./movebehaviors";

export const attack: Move = {
    name: 'attack',
    type: MoveType.Aggressive,
    behaviors: {
        damageMultipliers: PreparedAttackBonus
    }
}