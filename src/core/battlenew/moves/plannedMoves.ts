import { PlannedMove } from "../model/plannedmove";
import { nothingMove } from "./moves";
import { CannotBeFirst } from "./validators";

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