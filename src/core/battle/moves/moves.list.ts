/** 
 * Generic Moves 
*/

import { requestOverlayAnimation } from "../animation/requestOverlayAnim";
import { ApplyOpponentVulnerable, ApplySelfHeal, ApplySelfPrepared, ApplySelfVulnerable, EvadePostEffect, ExtendOpponentVulnerable, ExtendSelfPrepared, RequiresFocus } from "./moves.effects";
import { NegatedByOverwhelm, EvadeCheck, OnlyDoDamageOnDefensive, PreparedAttackBonus, ReduceIncomingDamage } from "./moves.plsteps";
import { Move, MoveType } from "./moves.types";

export const Observe: Move = {
    name: "observe",
    type: MoveType.Passive,
    behaviors: {
        immediatePostEffects: [ExtendOpponentVulnerable],
        postEffects: [ApplyOpponentVulnerable]
    }
}

export const Attack: Move = {
    name: "attack",
    type: MoveType.Aggressive,
    behaviors: {
        multpipeline: [PreparedAttackBonus]
    }
}

export const Evade: Move = {
    name: "evade",
    type: MoveType.Defensive,
    behaviors: {
        multpipeline: [NegatedByOverwhelm(EvadeCheck)],
        postEffects: [EvadePostEffect]
    }
}

export const Heal: Move = {
    name: "heal",
    type: MoveType.Passive,
    behaviors: {
        preEffects: [ApplySelfVulnerable],
        immediatePostEffects: [RequiresFocus(ApplySelfHeal)]
    }
}

// REPEAT IS **NOT** A MOVE. IT IS A ABSTRACTION CREATED IN MOVEMETA!

export const Prepare: Move = {
    name: "prepare",
    type: MoveType.Passive,
    behaviors: {
        preEffects: [ApplySelfVulnerable],
        immediatePostEffects: [RequiresFocus(ExtendSelfPrepared)],
        postEffects: [RequiresFocus(ApplySelfPrepared)]
    }
}

export const Defend: Move = {
    name: "defend",
    type: MoveType.Defensive,
    behaviors: {
        multpipeline: [NegatedByOverwhelm(ReduceIncomingDamage)]
    }
}

export const NothingMove: Move = {
    name: "nothing",
    type: MoveType.Passive,
    behaviors: {}
}

// TODO: Determine Mage/8th Move Idea

export const OverwhelmMove: Move = {
    name: "Overwhelm",
    type: MoveType.Overwhelming,
    behaviors: {
        preEffects: [ApplySelfVulnerable],
        multpipeline: [OnlyDoDamageOnDefensive, PreparedAttackBonus]
    }
}