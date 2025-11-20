import { mapObject } from "@/shared/utils/mapObject";
import { Move, MoveTags } from "../model/move.types";
import { PlannedMove } from "../model/plannedMove";
import * as MOVEBANK from '@/core/battle/moves/moves'
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
        let lookupOffset = 1;
        let prevMove: PlannedMove | undefined;

        while (!prevMove && lookupOffset <= ctx.index) {
            const candidate = ctx.myPlan[ctx.index - lookupOffset];
            if (!candidate) break;
            if (candidate.name !== 'repeat') {
                prevMove = candidate;
                break;
            }
            lookupOffset += 1;
        }

        if(!prevMove) {
            console.error("Repeat unable to acquire previous move!")
            return MOVEBANK.nothingMove;
        }

        return tagMove(prevMove.instantiate(ctx), 'repeated');
    },
    canPerform: CannotBeFirst
}

export const mirrorPlan: PlannedMove = {
    name: 'mirror',
    instantiate(ctx) {
        const oppPlan = ctx.theirPlan[ctx.index];

        if(oppPlan.name == 'mirror') return MOVEBANK.nothingMove;

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

export const PLANNED_MOVE_REGISTRY = {
    repeat: repeatPlan,
    mirror: mirrorPlan,

    ...mapObject(MOVEBANK, (move => planMove(move)))
} 
