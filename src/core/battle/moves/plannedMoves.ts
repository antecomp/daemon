import { mapObject } from "@/shared/utils/mapObject";
import { Move, MoveTags } from "../model/move";
import { PlannedMove } from "../model/plannedmove";
import { MOVEBANK, nothingMove } from "./moves";
import { CannotBeFirst } from "./validators";

const tagMove = (move: Move, tag: MoveTags[number]): Move => {
    const existingTags = move.tags;
    const nextTags = existingTags ? [...existingTags, tag] : [tag];
    return { ...move, tags: nextTags };
};

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

        return tagMove(prevMove.instantiate(ctx), 'repeated');
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

        return tagMove(oppMove, 'mirrored');
    }
}

// Move this?
export const STOCK_PLANBANK: Record<string, PlannedMove> = {
    repeat: repeatPlan,
    mirror: mirrorPlan,

    ...mapObject(MOVEBANK, (move => planMove(move)))
} 
