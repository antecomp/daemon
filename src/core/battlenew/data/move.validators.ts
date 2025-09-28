import { MoveValidator } from "../types/move";

export const CannotBeFirst: MoveValidator = (_workingPlan, index) => {
    return index > 0;
}