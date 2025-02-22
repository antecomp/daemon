/** 
 * Generic Moves 
*/

import { ApplyOpponentVulnerable, ApplySelfHeal, ApplySelfPrepared, ApplySelfVulnerable, EvadePostEffect, ExtendOpponentVulnerable, ExtendSelfPrepared, RequiresFocus } from "./moves.effects";
import { NegatedByOverwhelm, EvadeCheck, OnlyDoDamageOnDefensive, PreparedAttackBonus, ReduceIncomingDamage } from "./moves.plsteps";
import { Move } from "./moves.types";

export const Observe: Move = {
    name: "observe",
    type: "Passive",
    behaviors: {
        immediatePostEffects: [ExtendOpponentVulnerable],
        postEffects: [ApplyOpponentVulnerable]
    }
}

export const Attack: Move = {
    name: "attack",
    type: "Aggressive",
    behaviors: {
        multpipeline: [PreparedAttackBonus]
    }
}

export const Evade: Move = {
    name: "evade",
    type: "Passive",
    behaviors: {
        multpipeline: [NegatedByOverwhelm(EvadeCheck)],
        postEffects: [EvadePostEffect]
    }
}

export const Heal: Move = {
    name: "heal",
    type: "Passive",
    behaviors: {
        preEffects: [ApplySelfVulnerable],
        postEffects: [RequiresFocus(ApplySelfHeal)]
    }
}

// REPEAT IS **NOT** A MOVE. IT IS A ABSTRACTION CREATED IN MOVEMETA!

export const Prepare: Move = {
    name: "prepare",
    type: "Passive",
    behaviors: {
        preEffects: [ApplySelfVulnerable],
        immediatePostEffects: [RequiresFocus(ExtendSelfPrepared)],
        postEffects: [RequiresFocus(ApplySelfPrepared)]
    }
}

export const Defend: Move = {
    name: "defend",
    type: "Passive",
    behaviors: {
        multpipeline: [NegatedByOverwhelm(ReduceIncomingDamage)]
    }
}

export const NothingMove: Move = {
    name: "nothing",
    type: "Passive",
    behaviors: {}
}

// TODO: Determine Mage/8th Move Idea

export const OverwhelmMove: Move = {
    name: "Overwhelm",
    type: "Overwhelming",
    behaviors: {
        preEffects: [ApplySelfVulnerable],
        multpipeline: [OnlyDoDamageOnDefensive, PreparedAttackBonus]
    }
}