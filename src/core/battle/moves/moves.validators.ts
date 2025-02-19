import { MoveValidator } from "./moves.types";

export const CannotBeFirst: MoveValidator = (workingSequence) => {
    return workingSequence.length > 0;
}