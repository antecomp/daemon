import { mapObject } from "@/shared/utils/mapObject";
import { Move } from "../model/move";
import { PlannedMove } from "../model/plannedmove";
import { MOVEBANK, nothingMove } from "./moves";
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

        // TODO MAKE THIS CLEANER!!!
        const move = prevMove.instantiate(ctx);
        return {...move, tags: [...(move.tags ?? []), 'repeated']}
    },
    canPerform: CannotBeFirst
}

export const mirrorPlan: PlannedMove = {
    name: 'mirror',
    instantiate(ctx) {
        const oppPlan = ctx.theirPlan[ctx.index];

        if(oppPlan.name == 'mirror') return nothingMove;

        // Swap context as we want moves like repeat to be
        // in regards to the opponents sequence, not our own.
        const oppMove = oppPlan.instantiate({
            myPlan: ctx.theirPlan,
            theirPlan: ctx.myPlan,
            index: ctx.index,
        });

        // TODO MAKE THIS CLEANER!!!
        return {...oppMove, tags: [...(oppMove.tags ?? []), 'mirrored']}
    }
}

// Move this?
export const STOCK_PLANBANK: Record<string, PlannedMove> = {
    repeat: repeatPlan,
    mirror: mirrorPlan,

    ...mapObject(MOVEBANK, (move => planMove(move)))
} 