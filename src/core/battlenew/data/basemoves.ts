import { behavior } from "lume";
import { Move, MoveType } from "../types/move";
import { PreparedAttackBonus } from "./movebehaviors";

export const nothingMove: Move = {
    name: 'idle',
    type: MoveType.Passive,
    behaviors: {}
}

export const attack: Move = {
    name: 'attack',
    type: MoveType.Aggressive,
    behaviors: {
        damageMultipliers: PreparedAttackBonus
    }
}