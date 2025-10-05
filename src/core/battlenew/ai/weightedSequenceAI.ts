import pickRandom, { pickRandomWeighted } from "@/shared/utils/pickRandom";
import { SEQUENCE_LENGTH } from "../config/battle.config";
import { PlannedMove, PlannedSequence } from "../model/plannedmove";

export type PlanMap = Record<string, PlannedMove>

export type PlanWeightMap<M extends Record<string, PlannedMove>> = {
    [K in keyof M]?: Partial<Record<keyof M, number>>
}

export function buildSequenceFromWeightMap<M extends PlanMap>(
    planBank: M,
    weightMap: PlanWeightMap<M>
): PlannedSequence {
    const keys = Object.keys(planBank);
    if(keys.length < SEQUENCE_LENGTH) throw new Error("[Weighted Sequence AI] Not enough moves provided to build a full sequence");

    const selectedKeys: string[] = [];
    const workingSequence: PlannedSequence = [];

    // Initial move is picked completely at random
    const validFirstMoves = keys.filter(key => !planBank[key].canPerform || planBank[key].canPerform([], 0));
    if (validFirstMoves.length == 0) throw new Error("[Weighted Sequence AI] No valid moves available for the first step.");

    const firstKey = pickRandom(validFirstMoves);
    selectedKeys.push(firstKey);
    workingSequence.push(planBank[firstKey]);

    // Weighted pick for remaining moves;
    while(workingSequence.length < SEQUENCE_LENGTH) {
        const currentKey = selectedKeys[selectedKeys.length - 1];
        const currentWeights = weightMap[currentKey];

        // Filter for valid subsequent moves;
        const options = keys.filter(key => {
            const move = planBank[key];
            return !selectedKeys.includes(key) && (!move.canPerform || move.canPerform(workingSequence, selectedKeys.length))
        });

        if(options.length == 0) throw new Error("[Weighted Sequence AI] No valid moves available to complete the sequence.");

        const weights = options.map(option => currentWeights?.[option] ?? 1);

        const nextKey = pickRandomWeighted(options, weights);
        selectedKeys.push(nextKey);
        workingSequence.push(planBank[nextKey])   
    }

    return workingSequence;
}