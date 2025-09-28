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