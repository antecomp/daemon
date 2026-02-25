import { PlannedMoveValidator } from "../model/plannedMove";

export const CannotBeFirst: PlannedMoveValidator = (workingPlan) => {
    return workingPlan.length > 0;
}