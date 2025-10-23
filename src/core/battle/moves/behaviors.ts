import { DamageMultiplierFunction, MoveSideEffectOutcome, MoveMultiplierConditionalWrapper, MoveSideEffectConditionalWrapper, MoveType, PostMoveSideEffect, PreMoveSideEffect, PostMoveContext, PreMoveContext } from "../model/move";
import { PASSTHROUGH_MULTPLIERS } from "../model/battle";
import { ManiaStatus } from "../statuses/statuses";
import { combineMultiplierSets, getBaseMultipliers } from "../utils/engine.utils";
import { Status } from "../model/status";

declare global {
    interface MoveSignalMap {
        'effect:heal': {amount: number, capped: boolean},
        'status:prepare': {level: number}
        'mechanic:mania': {manic: boolean},
        'mechanic:focus': {lost: boolean}
    }
}

export function effectPipeline<T extends PreMoveContext | PostMoveContext>(...pipeline: ((ctx: T) => MoveSideEffectOutcome | void)[]): ((ctx: T) => MoveSideEffectOutcome | void) {
    return (ctx) => {
        let result: MoveSideEffectOutcome | undefined = undefined;
        pipeline.forEach(effect => {
            result = effect(ctx) ?? result; // Save latest defined outcome.
        });
        return result;
    };
}

export function multiplierPipeline(...pipeline: DamageMultiplierFunction[]): DamageMultiplierFunction {
    return (context) => {
        return pipeline.reduce(
            (currentMults, step) => combineMultiplierSets(currentMults, step(context)),
            PASSTHROUGH_MULTPLIERS
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

export const SuccessfulEvadeBonus: PostMoveSideEffect = ({self, damageTaken, preEffectOutcome, theirMults, emit}) => {
    if(preEffectOutcome == MoveSideEffectOutcome.Success) {
        if(damageTaken === 0 && theirMults.outgoing > 0) {
            self.addStatus(new ManiaStatus);
            emit({type: 'mechanic:mania', payload: {'manic': true}});
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
            //ctx.deps.logger('Focus Shattered! Cannot ' + ctx.moves.ours.name);
            ctx.emit({
                type: 'mechanic:focus',
                payload: {lost: true}
            })
            return MoveSideEffectOutcome.Failure
        }
    }
}

export const HealSelf: PostMoveSideEffect = ({self, emit}) => {
    const healAmount = 2 * (1 + self.getStatusLevelIncludingExpired('prepared'));
    self.heal(healAmount);
    emit({
        type: 'effect:heal',
        payload: {'amount': healAmount, capped: self.health == self.maxHealth}
    })
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