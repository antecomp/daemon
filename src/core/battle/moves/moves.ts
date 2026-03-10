import { Move, MoveType, reportMoveOutcome } from "../model/move.types";
import { applyStatusTo, effectPipeline, extendStatusOf, FailOnOverwhelm, multiplierPipeline } from "./behaviors";
import { NegatedByOverwhelm } from "./behaviors";
import { OnlyDoDamageOnDefensive } from "./behaviors";
import { EvadeDamageReduction, EvadeRoll, HealSelf, PreparedAttackBonus, ReduceIncomingDamage, RequiresFocus, SuccessfulEvadeBonus } from "./behaviors";
import { PreparedStatus } from "../statuses/statuses";
import { VulnerableStatus } from "../statuses/statuses";

/** Fallback/Error move. For example when mirror fails. */
export const nothingMove: Move = {
    name: 'nothingMove',
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
            extendStatusOf('them', VulnerableStatus),
            (ctx) => {applyStatusTo('them', VulnerableStatus, 1 + ctx.self.getStatusLevelIncludingExpired('prepared'))(ctx)}, 
        )
    }
}

export const evade: Move = {
    name: 'evade',
    type: MoveType.Defensive,
    behaviors: {
        preEffect: FailOnOverwhelm(EvadeRoll),
        damageMultipliers: NegatedByOverwhelm(EvadeDamageReduction),
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
                applyStatusTo('self', PreparedStatus),
            )
        )
    }
}

export const defend: Move = {
    name: 'defend',
    type: MoveType.Defensive,
    behaviors: {
        damageMultipliers: NegatedByOverwhelm(ReduceIncomingDamage),
        postEffect: FailOnOverwhelm(() => reportMoveOutcome('success', 'clash'))
    }
}

/* Purposefully absent move.  */
export const idle: Move = {
    name: 'idle',
    type: MoveType.Passive,
    behaviors: {}
}

export const overwhelm: Move = {
    name: 'overwhelm',
    type: MoveType.Overwhelming,
    behaviors: {
        preEffect: applyStatusTo('self', VulnerableStatus),
        damageMultipliers: multiplierPipeline(
            PreparedAttackBonus, OnlyDoDamageOnDefensive
        )
    }
}