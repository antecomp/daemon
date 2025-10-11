import { DamageMultipliers } from "@/core/battlenew/model/battle"
import { MoveSideEffectOutcome } from "@/core/battlenew/model/move"
import { Sides } from "@/core/battlenew/utils/sides.utils"

// Runs side effects like playing animations, sounds, whatever.
type ClashReaction = (mults: DamageMultipliers, outcomes: Sides<MoveSideEffectOutcome>, /* shit needed to run side effects */) => void;

export interface ClashMap {
    [playerMove: string]: {
        [opponentMove: string]: ClashReaction
        // will probably have a "_" default key for reaction to always happen regardless of interaction
    }
}