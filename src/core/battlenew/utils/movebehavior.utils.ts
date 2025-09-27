import { mul } from "three/tsl";
import { PreMoveContext, PostMoveContext, EffectOutcome, PostMoveSideEffect, PreMoveSideEffect, DamageMultiplierFunction, MoveType, MoveMultiplierConditionalWrapper } from "../types/move";
import { Status } from "../types/status";
import { combineMultiplierSets, PASSTHROUGH_MULTPLIERS } from "./battleUtils";


export function effectPipeline<T extends PreMoveContext | PostMoveContext>(...pipeline: ((ctx: T) => EffectOutcome | void)[]): ((ctx: T) => EffectOutcome | void) {
    return (ctx) => {
        let result: EffectOutcome | undefined = undefined;
        pipeline.forEach(effect => {
            result = effect(ctx) ?? result; // Save latest defined outcome.
        });
        return result;
    }
}

export function multiplierPipeline(...pipeline: DamageMultiplierFunction[]): DamageMultiplierFunction {
    return (context) => {
        return pipeline.reduce(
            (currentMults, step) => combineMultiplierSets(currentMults, step(context)),
            PASSTHROUGH_MULTPLIERS
        )
    }

}

export function extendStatusOf(who: 'opponent' | 'self', Stat: typeof Status, amount: number = 1): PostMoveSideEffect {
    return (ctx) => {
        ctx[who].extendStatus(new Stat, amount);
    };
}

export function applyStatusTo<T extends PostMoveContext | PreMoveContext>(who: 'opponent' | 'self', Stat: typeof Status, duration: number = 1){
    return (ctx: T) => {
        ctx[who].addStatus(new Stat, duration)
    }
}

export const OnlyDoDamageOnDefensive: DamageMultiplierFunction = ({moves}) => {
    return {
        incoming: 1,
        outgoing: Number(moves.opponent.type == MoveType.Defensive)
    }
}

export const NegatedByOverwhelm: MoveMultiplierConditionalWrapper = (mul) => {
    return (ctx) => {
        if(ctx.moves.opponent.type == MoveType.Overwhelming) {
            return PASSTHROUGH_MULTPLIERS; // skip
        } else {
            return mul(ctx)
        }
    }
}