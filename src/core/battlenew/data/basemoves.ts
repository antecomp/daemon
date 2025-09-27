import { Move, MoveType } from "../types/move";
import { applyStatusTo, effectPipeline, extendStatusOf, multiplierPipeline, OnlyDoDamageOnDefensive } from "../utils/movebehavior.utils";
import { EvadeDamageReduction, EvadeRoll, HealSelf, PreparedAttackBonus, ReduceIncomingDamage, RequiresFocus, SuccessfulEvadeBonus } from "./movebehaviors";
import { PreparedStatus, VulnerableStatus } from "./statuses";

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

export const observe: Move = {
    name: 'observe',
    type: MoveType.Passive,
    behaviors: {
        postEffect: effectPipeline(
            // extend before apply.
            extendStatusOf('opponent', VulnerableStatus),
            applyStatusTo('opponent', VulnerableStatus)
        )
    }
}

export const evade: Move = {
    name: 'evade',
    type: MoveType.Aggressive,
    // TODO: Add Negated By Overwhelm
    behaviors: {
        preEffect: EvadeRoll,
        damageMultipliers: EvadeDamageReduction,
        postEffect: SuccessfulEvadeBonus
    }
}

export const heal: Move = {
    name: 'heal',
    type: MoveType.Passive,
    behaviors: {
        preEffect: applyStatusTo('self', VulnerableStatus),
        postEffect: RequiresFocus(HealSelf)
    }
}

export const prepare: Move = {
    name: 'prepare',
    type: MoveType.Passive,
    behaviors: {
        preEffect: applyStatusTo('self', VulnerableStatus),
        postEffect: RequiresFocus(
            effectPipeline(
                extendStatusOf('self', PreparedStatus),
                applyStatusTo('self', PreparedStatus)
            )
        )
    }
}

export const defend: Move = {
    name: 'defend',
    type: MoveType.Defensive,
    // TODO: Add Negated By Overwhelm
    behaviors: {
        damageMultipliers: ReduceIncomingDamage
    }
}

export const idle: Move = {
    name: 'idle',
    type: MoveType.Passive,
    behaviors: {}
}

// Could probably change this to do logic check in pre/post effect so we can have an outcome from this!
export const OverwhelmMove: Move = {
    name: 'overwhelm',
    type: MoveType.Overwhelming,
    behaviors: {
        preEffect: applyStatusTo('self', VulnerableStatus),
        damageMultipliers: multiplierPipeline(
            PreparedAttackBonus, OnlyDoDamageOnDefensive
        )
    }
}