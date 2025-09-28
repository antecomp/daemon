import { MoveValidator } from "../model/plannedmove";

export const CannotBeFirst: MoveValidator = (_workingPlan, index) => {
    return index > 0;
}