/** 
 * Generic Moves 
*/

import { ApplyOpponentVulnerable, ApplySelfHeal, ApplySelfVulnerable, ExendOpponentVulnerable, RequiresFocus } from "./moves.effects";
import { EvadeCheck, PreparedAttackBonus, SuccessfulEvadeAttackBonus } from "./moves.plsteps";
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