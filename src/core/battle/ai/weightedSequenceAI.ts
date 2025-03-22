import pickRandom, { pickRandomWeighted } from "@/util/pickRandom";
import { MoveMeta } from "../moves/moves.types";
import { SEQUENCE_LENGTH } from "../engine/battle.config";

// Named keys for our moves
// Allows us to have duplicate moves that are tracked as their own instance in the sequence.
export type MoveMap = Record<string, MoveMeta>; 

// For each move key assign a weight to the other moves (by key)
// f.e {attack1: {attack2: 2, defend: 3, ...}}
//type MoveWeightMap = Record<string, Record<string, number>>;
export type MoveWeightMap<M extends Record<string, MoveMeta>> = {
    [K in keyof M]?: Partial<Record<keyof M, number>>
}

export function buildSequenceFromWeightMap<M extends Record<string, MoveMeta>>(
    availableMoves: M, // Map of moves available (use unique key to have duplicate move mappings)
    weightMap: MoveWeightMap<M> // moveKey -> {moveKey: number} weighted chance of other moves following each move.
): MoveMeta[] {

    const moveKeys = Object.keys(availableMoves);
    if (
        moveKeys.length < SEQUENCE_LENGTH
    ) {
        throw new Error("Not enough moves provided to build full sequence.");
    }

    const availableKeys = new Set(moveKeys);
    const selectedKeys: string[] = [];

    const keys = Array.from(availableKeys);

    const firstKey = pickRandom(keys);
    selectedKeys.push(firstKey);
    availableKeys.delete(firstKey);

    let currentKey = firstKey;

    while(selectedKeys.length < SEQUENCE_LENGTH) {
        const currentWeights = weightMap[currentKey];

        // Get weights of remaining options.
        const options = Array.from(availableKeys);
        const weights = options.map(option => currentWeights?.[option] ?? 1); // <- default to 1 if no weight provided.

        // Pick next move based on weighted options.
        const nextKey = pickRandomWeighted(options, weights);
        selectedKeys.push(nextKey);
        availableKeys.delete(nextKey);
        currentKey = nextKey;
    }

    return selectedKeys.map(key => availableMoves[key]);
}