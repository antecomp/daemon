import { DamageMultiplierFunction, MoveSideEffectOutcome, MoveMultiplierWrapper, MoveSideEffectWrapper, MoveType, PostMoveSideEffect, PreMoveSideEffect, PostMoveContext, PreMoveContext, reportMoveOutcome } from "../model/move.types";
import { PASSTHROUGH_MULTIPLIERS } from "../model/battle";
import { ManiaStatus } from "../statuses/statuses";
import { combineMultiplierSets, getBaseMultipliers } from "../utils/engine.utils";
import { Status } from "../model/status";

/** Utility used to chain multiple pre/post-effect methods together. Runs them in sequence, reports the latest *defined* outcome. */
export function effectPipeline<T extends PreMoveContext | PostMoveContext>(...pipeline: ((ctx: T) => MoveSideEffectOutcome | void)[]): ((ctx: T) => MoveSideEffectOutcome | void) {
    return (ctx) => {
        let result: MoveSideEffectOutcome | undefined = undefined;
        pipeline.forEach(effect => {
            result = effect(ctx) ?? result; // Save latest defined outcome.
        });
        return result;
    };
}

/** Utility to run multiple multiplier methods together. Runs them in sequence, multiplying their results together (reduce). */
export function multiplierPipeline(...pipeline: DamageMultiplierFunction[]): DamageMultiplierFunction {
    return (context) => {
        return pipeline.reduce(
            (currentMults, step) => combineMultiplierSets(currentMults, step(context)),
            PASSTHROUGH_MULTIPLIERS
        );
    };

}

export function extendStatusOf(who: 'them' | 'self', Stat: typeof Status, amount: number = 1): PostMoveSideEffect {
    return (ctx) => {
        ctx[who].extendStatus(new Stat, amount);
    };
}

export function applyStatusTo<T extends PostMoveContext | PreMoveContext>(who: 'them' | 'self', Stat: typeof Status, duration: number = 1) {
    return (ctx: T) => {
        ctx[who].addStatus(new Stat, duration);
    };
}

export const PreparedAttackBonus: DamageMultiplierFunction = ({ self }) => {
    return {
        incoming: 1,
        outgoing: 2 ** self.getStatusLevel('prepared')
    }
}

export const EvadeRoll: PreMoveSideEffect = ({ self }) => {
    const chance = 0.5 + (0.25 * self.getStatusLevel('prepared'));

    const success = Math.random() <= chance;

    // This result will be added to the context of subsequent operations (damage mults, post effect)
    return success ? reportMoveOutcome('success', 'rng') : reportMoveOutcome('failure', 'rng');
}

export const EvadeDamageReduction: DamageMultiplierFunction = ({ preEffectOutcome }) => {
    if (preEffectOutcome?.status == 'success') {
        return { incoming: 0, outgoing: 1 }
    } else {
        return PASSTHROUGH_MULTIPLIERS
    }
}

export const SuccessfulEvadeBonus: PostMoveSideEffect = ({ self, damageTaken, preEffectOutcome, theirMults }) => {
    if (preEffectOutcome?.status == 'success') {
        if (damageTaken === 0 && theirMults.outgoing > 0) {
            self.addStatus(new ManiaStatus);
            return preEffectOutcome
        } else {
            return { status: 'meaningless', reason: 'clash' };
        }
    }
    return preEffectOutcome;
}

export const RequiresFocus: MoveSideEffectWrapper<PostMoveSideEffect> = (effect) => {
    return (ctx) => {
        if (ctx.damageTaken <= 0) {
            return effect(ctx) ?? reportMoveOutcome('success', 'focus'); // get outcome from effect or default to success.
        } else {
            return reportMoveOutcome('failure', 'focus');
        }
    }
}

export const HealSelf: PostMoveSideEffect = ({ self }) => {
    const healAmount = 2 * (1 + self.getStatusLevelIncludingExpired('prepared'));
    self.heal(healAmount);
}

export const ReduceIncomingDamage: DamageMultiplierFunction = ({ self }) => {
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

export const NegatedByOverwhelm: MoveMultiplierWrapper = (mul) => {
    return (ctx) => {
        if (ctx.moves.theirs.type == MoveType.Overwhelming) {
            return getBaseMultipliers(MoveType.Defensive); // skip
        } else {
            return mul(ctx);
        }
    };
};

export const FailOnOverwhelm: MoveSideEffectWrapper<PreMoveSideEffect> = (se) => {
    return (ctx) => {
        if(ctx.moves.theirs.type == MoveType.Overwhelming) {
            se(ctx);
            return reportMoveOutcome('failure', 'clash')
        } else {
            return se(ctx);
        }
    }
}