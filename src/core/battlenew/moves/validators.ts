import { MoveValidator } from "../model/plannedmove";

export const CannotBeFirst: MoveValidator = (workingPlan) => {
    return workingPlan.length > 0;
}