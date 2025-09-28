import { PlannedMove } from "../types/move";
import { nothingMove } from "./basemoves";
import { CannotBeFirst } from "./move.validators";

export const PlanForRepeat: PlannedMove = {
    name: "repeat",
    instantiate: function (ctx) {
        const prevMove = ctx.myPlan[ctx.index -1];
        if(!prevMove) {
            console.error("Repeat unable to acquire previous move!")
            return nothingMove;
        }

        return prevMove.instantiate(ctx);
    },
    canPerform: CannotBeFirst
}