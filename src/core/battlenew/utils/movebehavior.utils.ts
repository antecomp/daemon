import { PreMoveContext, PostMoveContext, MoveSideEffectOutcome, PostMoveSideEffect, DamageMultiplierFunction } from "../model/move";
import { Status } from "../model/status";
import { combineMultiplierSets } from "./engine.utils";
import { PASSTHROUGH_MULTPLIERS } from "../model/battle";


export function effectPipeline<T extends PreMoveContext | PostMoveContext>(...pipeline: ((ctx: T) => MoveSideEffectOutcome | void)[]): ((ctx: T) => MoveSideEffectOutcome | void) {
    return (ctx) => {
        let result: MoveSideEffectOutcome | undefined = undefined;
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

export function extendStatusOf(who: 'them' | 'self', Stat: typeof Status, amount: number = 1): PostMoveSideEffect {
    return (ctx) => {
        ctx[who].extendStatus(new Stat, amount);
    };
}

export function applyStatusTo<T extends PostMoveContext | PreMoveContext>(who: 'them' | 'self', Stat: typeof Status, duration: number = 1){
    return (ctx: T) => {
        ctx[who].addStatus(new Stat, duration)
    }
}