import { DamageMultiplierFunction, EffectOutcome, MoveMultiplierConditionalWrapper, MoveSideEffectConditionalWrapper, MoveType, PostMoveContext, PostMoveSideEffect, PreMoveContext, PreMoveSideEffect } from "../model/move";
import { PASSTHROUGH_MULTPLIERS } from "../utils/battleUtils";
import { ManiaStatus } from "../statuses/statuses";

export const PreparedAttackBonus: DamageMultiplierFunction = ({self}) => {
    return {
        incoming: 1,
        outgoing: 2 ** self.getStatusLevel('prepared')
    }
}

export const EvadeRoll: PreMoveSideEffect = ({self}) => {
    const chance = 0.5 + (0.25 * self.getStatusLevel('prepared'));

    const success = Math.random() <= chance;

    return [EffectOutcome.Failure, EffectOutcome.Success][Number(success)]
}

export const EvadeDamageReduction: DamageMultiplierFunction = ({preEffectOutcome}) => {
    if(preEffectOutcome == EffectOutcome.Success) {
        return {incoming: 0, outgoing: 1}
    } else {
        return PASSTHROUGH_MULTPLIERS
    }
}

export const SuccessfulEvadeBonus: PostMoveSideEffect = ({self, damageTaken, preEffectOutcome, theirMults}) => {
    if(preEffectOutcome == EffectOutcome.Success) {
        if(damageTaken === 0 && theirMults.outgoing > 0) {
            self.addStatus(new ManiaStatus)
            return EffectOutcome.Success
        }
    }
    return EffectOutcome.Failure
}

export const RequiresFocus: MoveSideEffectConditionalWrapper<PostMoveSideEffect> = (effect) => {
    return (ctx) => {
        if(ctx.damageTaken <= 0) {
            return effect(ctx) ?? EffectOutcome.Success; // get outcome from effect or default to success.
        } else {
            return EffectOutcome.Failure
        }
    }
}

export const HealSelf: PostMoveSideEffect = ({self}) => {
    const healAmount = 2 * (1 + self.getStatusLevel('prepared'));
    self.heal(healAmount);
    // How do we communicate this amount back to the UI?
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
        outgoing: Number(moves.opponent.type == MoveType.Defensive)
    };
};

export const NegatedByOverwhelm: MoveMultiplierConditionalWrapper = (mul) => {
    return (ctx) => {
        if (ctx.moves.opponent.type == MoveType.Overwhelming) {
            return PASSTHROUGH_MULTPLIERS; // skip
        } else {
            return mul(ctx);
        }
    };
};
