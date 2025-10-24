import { mapObject } from "@/shared/utils/mapObject";
import { Move, MoveTags } from "../model/move";
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
        const prevMove = ctx.myPlan[ctx.index - 1];
        if(!prevMove) {
            console.error("Repeat unable to acquire previous move!")
            return MOVEBANK.nothingMove;
        }

        /* TODO/WARNING
            ctx unchanged (we don't also decrement the ctx index) to 
            have expected behavior for mirror -> repeat, where the repeated mirror
            uses the index of the *repeat* not the index of its earlier use.
            HOWEVER! This does mean that repeat -> repeat will infinitely recurse!
            If (for some reason) you want multiple repeats, you will need to address this.

            Good fix is a simple loop of "is previous move repeat, if so, go further back" and use that to
            define "prevMove". Still instantiate it with *this* index though so
            mirror -> repeat -> repeat works as you would expect!

            When you do this. Make sure to add tests!
        */
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

// Rename this?
export const STOCK_PLANBANK = {
    repeat: repeatPlan,
    mirror: mirrorPlan,

    ...mapObject(MOVEBANK, (move => planMove(move)))
} 