import { DamageMultiplierFunction, MoveSideEffectOutcome, MoveMultiplierConditionalWrapper, MoveSideEffectConditionalWrapper, MoveType, PostMoveSideEffect, PreMoveSideEffect } from "../model/move";
import { PASSTHROUGH_MULTPLIERS } from "../model/battle";
import { ManiaStatus } from "../statuses/statuses";
import { getBaseMultipliers } from "../utils/engine.utils";

export const PreparedAttackBonus: DamageMultiplierFunction = ({self}) => {
    return {
        incoming: 1,
        outgoing: 2 ** self.getStatusLevel('prepared')
    }
}

export const EvadeRoll: PreMoveSideEffect = ({self}) => {
    const chance = 0.5 + (0.25 * self.getStatusLevel('prepared'));

    const success = Math.random() <= chance;

    // This result will be added to the context of subsequent operations (damage mults, post effect)
    return [MoveSideEffectOutcome.Failure, MoveSideEffectOutcome.Success][Number(success)]
}

export const EvadeDamageReduction: DamageMultiplierFunction = ({preEffectOutcome}) => {
    if(preEffectOutcome == MoveSideEffectOutcome.Success) {
        return {incoming: 0, outgoing: 1}
    } else {
        return PASSTHROUGH_MULTPLIERS
    }
}

export const SuccessfulEvadeBonus: PostMoveSideEffect = ({self, damageTaken, preEffectOutcome, theirMults}) => {
    if(preEffectOutcome == MoveSideEffectOutcome.Success) {
        if(damageTaken === 0 && theirMults.outgoing > 0) {
            self.addStatus(new ManiaStatus)
            return MoveSideEffectOutcome.Success
        }
    }
    return MoveSideEffectOutcome.Failure
}

export const RequiresFocus: MoveSideEffectConditionalWrapper<PostMoveSideEffect> = (effect) => {
    return (ctx) => {
        if(ctx.damageTaken <= 0) {
            return effect(ctx) ?? MoveSideEffectOutcome.Success; // get outcome from effect or default to success.
        } else {
            // We want to change to some sort of EMIT system (dep injected). UIBridge has the handler for that
            // emit -- and it will do the action message stuff
            // Because this wont work without overreaching into UI state (bad!)
            ctx.deps.logger('Focus Shattered! Cannot ' + ctx.moves.ours.name);
            return MoveSideEffectOutcome.Failure
        }
    }
}

export const HealSelf: PostMoveSideEffect = ({self}) => {
    const healAmount = 2 * (1 + self.getStatusLevelIncludingExpired('prepared'));
    self.heal(healAmount);
}

export const ReduceIncomingDamage: DamageMultiplierFunction = ({self}) => {
    return {
        incoming: 0.5 ** (self.getStatusLevel('prepared') + 1),
        outgoing: 1
    }
};

export const OnlyDoDamageOnDefensive: DamageMultiplierFunction = ({ moves }) => {
    return {
        incoming: 1,
        outgoing: Number(moves.theirs.type == MoveType.Defensive)
    };
};

export const NegatedByOverwhelm: MoveMultiplierConditionalWrapper = (mul) => {
    return (ctx) => {
        if (ctx.moves.theirs.type == MoveType.Overwhelming) {
            return getBaseMultipliers(MoveType.Defensive); // skip
        } else {
            return mul(ctx);
        }
    };
};
