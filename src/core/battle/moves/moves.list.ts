/** 
 * Generic Moves 
*/

import { ApplyOpponentVulnerable, ApplySelfHeal, ApplySelfPrepared, ApplySelfVulnerable, ExendOpponentVulnerable, ExtendSelfPrepared, RepeatPostEffect, RepeatPreEffect, RequiresFocus } from "./moves.effects";
import { EvadeCheck, PreparedAttackBonus, ReduceIncomingDamage, RepeatStep, SuccessfulEvadeAttackBonus } from "./moves.plsteps";
import { Move } from "./moves.types";

export const Observe: Move = {
    name: "observe",
    type: "Passive",
    behaviors: {
        preEffects: [ExendOpponentVulnerable],
        postEffects: [ApplyOpponentVulnerable]
    }
}

export const Attack: Move = {
    name: "attack",
    type: "Aggressive",
    behaviors: {
        multpipeline: [PreparedAttackBonus, SuccessfulEvadeAttackBonus]
    }
}

export const Evade: Move = {
    name: "evade",
    type: "Passive",
    behaviors: {
        multpipeline: [EvadeCheck]
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

export const Repeat: Move = {
    name: "repeat",
    type: "Passive", // This is a fucking problem. Repeat may change it's move type and we need to react to that!!
    behaviors: {
        preEffects: [RepeatPreEffect],
        multpipeline: [RepeatStep],
        postEffects: [RepeatPostEffect]
    }
}

export const Prepare: Move = {
    name: "prepare",
    type: "Passive",
    behaviors: {
        preEffects: [ApplySelfVulnerable, RequiresFocus(ExtendSelfPrepared)],
        postEffects: [RequiresFocus(ApplySelfPrepared)]
    }
}

export const Defend: Move = {
    name: "defend",
    type: "Passive",
    behaviors: {
        multpipeline: [ReduceIncomingDamage]
    }
}

export const NothingMove: Move = {
    name: "nothing",
    type: "Passive",
    behaviors: {}
}

// TODO: Determine Mage/8th Move Idea