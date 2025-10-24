import { attack, defend, evade, heal, overwhelm, prepare } from "./moves";
import { mirrorPlan, planMove, repeatPlan } from "./plannedMoves";

// This will eventually be in some global store of equipted moves or similar.
export const PLAYER_RUNE_REGISTRY = {
    repeat: repeatPlan,
    evade: planMove(evade),
    defend: planMove(defend),
    overwhelm: planMove(overwhelm),
    attack: planMove(attack),
    mirror: mirrorPlan,
    heal: planMove(heal),
    prepare: planMove(prepare),
}

export type PlayerRuneName = keyof typeof PLAYER_RUNE_REGISTRY;

export const playerRuneNames = Object.keys(PLAYER_RUNE_REGISTRY) as PlayerRuneName[];