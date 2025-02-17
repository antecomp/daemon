import { MoveValidator } from "./moves.types";

export const CannotBeFirst: MoveValidator = (_s, workingSequence) => {
    return workingSequence.length > 0;
}