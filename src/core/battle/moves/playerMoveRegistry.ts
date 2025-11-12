import pick from "@/shared/utils/pick";
import { mirrorPlan, PLANNED_MOVE_REGISTRY, repeatPlan } from "./plannedMoves";

// This will eventually be in some global store of equipted moves or similar.
// The weird order is because of how I want the moves arranged in the UI.
//   there's probably a better way to do that but... eh.
export const PLAYER_RUNE_REGISTRY = {
    repeat: repeatPlan,
    ...pick(PLANNED_MOVE_REGISTRY, ['evade', 'defend', 'overwhelm', 'attack']),
    mirror: mirrorPlan,
    ...pick(PLANNED_MOVE_REGISTRY, ['heal', 'prepare']),
}

export type PlayerRuneName = keyof typeof PLAYER_RUNE_REGISTRY;

export const playerRuneNames = Object.keys(PLAYER_RUNE_REGISTRY) as PlayerRuneName[];