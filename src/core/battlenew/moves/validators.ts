import { MoveValidator } from "../model/move";

export const CannotBeFirst: MoveValidator = (_workingPlan, index) => {
    return index > 0;
}