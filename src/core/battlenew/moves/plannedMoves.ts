import { Move } from "../model/move";
import { PlannedMove } from "../model/plannedmove";
import { nothingMove } from "./moves";
import { CannotBeFirst } from "./validators";

export function planMove(move: Move): PlannedMove {
    return {
        name: move.name,
        instantiate: () => move
    }
}

export const repeatPlan: PlannedMove = {
    name: "repeat",
    instantiate(ctx) {
        const prevMove = ctx.myPlan[ctx.index - 1];
        if(!prevMove) {
            console.error("Repeat unable to acquire previous move!")
            return nothingMove;
        }

        return prevMove.instantiate(ctx);
    },
    canPerform: CannotBeFirst
}

export const mirrorPlan: PlannedMove = {
    name: 'mirror',
    instantiate(ctx) {
        const oppmove = ctx.theirPlan[ctx.index];

        if(oppmove.name == 'mirror') return nothingMove;

        // Swap context as we want moves like repeat to be
        // in regards to the opponents sequence, not our own.
        return oppmove.instantiate({
            myPlan: ctx.theirPlan,
            theirPlan: ctx.myPlan,
            index: ctx.index
        })

        //return oppmove.instantiate(ctx);
    }
}