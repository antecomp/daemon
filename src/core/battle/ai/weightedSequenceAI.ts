import pickRandom, { pickRandomWeighted } from "@/utils/pickRandom";
import { MoveMeta } from "../moves/moves.types";
import { SEQUENCE_LENGTH } from "../engine/battle.config";

// Named keys for our moves
// Allows us to have duplicate moves that are tracked as their own instance in the sequence.
export type MoveMap = Record<string, MoveMeta>; 

// For each move key assign a weight to the other moves (by key)
// f.e {attack1: {attack2: 2, defend: 3, ...}}
// Typing here just enforces keys match what is provided in the movemap ( makes autocomplete work :D )
export type MoveWeightMap<M extends Record<string, MoveMeta>> = {
    [K in keyof M]?: Partial<Record<keyof M, number>>
}

/**
 * Builds a sequence of moves based on a weight map that defines the likelihood
 * of one move following another. The sequence is constructed by selecting moves
 * randomly, weighted by the provided weight map. 
 *
 * @param moveBank - A map of available moves, where the keys are unique move
 *                         identifiers and the values are metadata about each move.
 *                         The keys must be unique to allow duplicate move mappings.
 * @param weightMap - A map defining the weighted chances of one move following another.
 *                    Each key corresponds to a move identifier, and its value is an
 *                    object where the keys are other move identifiers and the values
 *                    are the weights (numbers) representing the likelihood of those
 *                    moves following the current move. 
 *                     - If weights are not provided for a move it defaults to 1
 *                     - Weights should be > 0, but can be fractional!
 * 
 * @throws {Error} If the number of available moves is less than the required sequence length.
 * @throws {Error} If unable to find valid moves while building the sequence.
 *  - Note: The valid checkers should never be so restrictive that this becomes an issue. 
 *          In fact, we only really have one to prevent repeat from being first.
 * 
 * @returns An array of move metadata objects representing the generated sequence.
 */
export function buildSequenceFromWeightMap<M extends Record<string, MoveMeta>>(
    moveBank: M, // Map of moves available (use unique key to have duplicate move mappings)
    weightMap: MoveWeightMap<M> // moveKey -> {moveKey: number} weighted chance of other moves following each move.
): MoveMeta[] {
    const moveKeys = Object.keys(moveBank);
    if(moveKeys.length < SEQUENCE_LENGTH) {
        throw new Error("Not enough moves provided to build a full sequence");
    }

    const selectedKeys: string[] = [];
    const workingSequence: MoveMeta[] = [];

    // First move is picked randomly.
    const validFirstMoves = moveKeys.filter(key => 
        !moveBank[key].canPerform || moveBank[key].canPerform([])
    )
    if (validFirstMoves.length === 0) {
        throw new Error("No valid moves available for the first step.");
    }
    const firstKey = pickRandom(validFirstMoves);
    selectedKeys.push(firstKey);
    workingSequence.push(moveBank[firstKey]);

    while(workingSequence.length < SEQUENCE_LENGTH) {
        const currentKey = selectedKeys[selectedKeys.length - 1];
        const currentWeights = weightMap[currentKey];

        // Filter for valid subsequent moves.
        const options = moveKeys.filter(key => {
            const move = moveBank[key];
            return !selectedKeys.includes(key) && (!move.canPerform || move.canPerform(workingSequence))
        });

        if (options.length === 0) {
            throw new Error("No valid moves available to complete the sequence.");
        }

        // Weights default to 1 if none provided. 
        const weights = options.map(option => currentWeights?.[option] ?? 1);

        const nextKey = pickRandomWeighted(options, weights);
        selectedKeys.push(nextKey);
        workingSequence.push(moveBank[nextKey])
    }

    return workingSequence;

}