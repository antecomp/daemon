import { mapObject } from "@/shared/utils/mapObject";
import { Move } from "../model/move";
import { PlannedMove } from "../model/plannedmove";
import { MOVEBANK, nothingMove } from "./moves";
import { CannotBeFirst } from "./validators";

export function planMove(move: Move): PlannedMove {
    return {
        name: move.name,
        instantiate: ({tags}) => ({...move, tags: tags})
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

        return prevMove.instantiate({...ctx, tags: ['repeated', ...(ctx.tags ?? [])]}); // TODO MAKE THIS CLEANER!!!
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
            index: ctx.index,
            tags: ['mirrored', ...(ctx.tags ?? [])] // TODO MAKE THIS LESS FORSAKEN!!!!
        })

        //return oppmove.instantiate(ctx);
    }
}

// Move this?
export const STOCK_PLANBANK: Record<string, PlannedMove> = {
    repeat: repeatPlan,
    mirror: mirrorPlan,

    ...mapObject(MOVEBANK, (move => planMove(move)))
} 