import { MoveValidator } from "../model/plannedMove";

export const CannotBeFirst: MoveValidator = (workingPlan) => {
    return workingPlan.length > 0;
}