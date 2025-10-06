import { describe, it, expect, vi } from "vitest";
import { buildSequenceFromWeightMap, PlanMap, PlanWeightMap } from "../core/battlenew/ai/weightedSequenceAI";
import { SEQUENCE_LENGTH } from "@/core/battlenew/config/battle.config";

// Mock pickRandom and pickRandomWeighted
vi.mock("@/shared/utils/pickRandom", async () => {
    return {
        default: (arr: any[]) => arr[0], // always pick first for determinism
        pickRandomWeighted: (arr: any[], weights: number[]) => {
            // pick the one with the highest weight, break ties by first
            let max = Math.max(...weights);
            let idx = weights.findIndex(w => w === max);
            return arr[idx];
        }
    }
});

// Dummy planBank and weightMap
function makePlanBank(names: string[], canPerformMap?: Record<string, (seq: any[]) => boolean>): PlanMap {
    const bank: PlanMap = {};
    for (const n of names) {
        bank[n] = { name: n, canPerform: canPerformMap?.[n], instantiate: vi.fn() };
    }
    return bank;
}

describe("buildSequenceFromWeightMap", () => {

    it("throws if not enough moves", () => {
        const planBank = makePlanBank(["A", "B"]);
        const weightMap: PlanWeightMap<typeof planBank> = {};
        expect(() => buildSequenceFromWeightMap(planBank, weightMap)).toThrow("[Weighted Sequence AI] Not enough moves provided to build a full sequence");
    });

    it("throws if no valid first moves", () => {
        const planBank = makePlanBank(["A", "B", "C", "D", "E"], {
            A: () => false,
            B: () => false,
            C: () => false,
            D: () => false,
            E: () => false,
        });
        const weightMap: PlanWeightMap<typeof planBank> = {};
        expect(() => buildSequenceFromWeightMap(planBank, weightMap)).toThrow("[Weighted Sequence AI] No valid moves available for the first step.");
    });

    it("throws if no valid moves to complete sequence", () => {
        // Only first move is valid, others are not
        const planBank = makePlanBank(["A", "B", "C", "D", "E"], {
            A: () => true,
            B: () => false,
            C: () => false,
            D: () => false,
            E: () => false,
        });
        const weightMap: PlanWeightMap<typeof planBank> = {};
        expect(() => buildSequenceFromWeightMap(planBank, weightMap)).toThrow("[Weighted Sequence AI] No valid moves available to complete the sequence.");
    });

    it("returns a valid sequence of correct length", () => {
        const planBank = makePlanBank(["A", "B", "C", "D", "E"]);
        const weightMap: PlanWeightMap<typeof planBank> = {
            A: { B: 2, C: 1 },
            B: { A: 1, C: 2 },
            C: { D: 2, B: 1 },
            D: { E: 2, A: 1},
            E: {D: 1, A: 1, C: 2}
        };
        const seq = buildSequenceFromWeightMap(planBank, weightMap);
        expect(seq).toHaveLength(SEQUENCE_LENGTH);
        // Should not repeat moves
        const names = seq.map(m => m.name);
        expect(new Set(names).size).toBe(SEQUENCE_LENGTH);
        expect(names).toEqual(["A", "B", "C", "D", "E"]);
    });

    it("respects canPerform for subsequent moves", () => {
        // Only B can be performed after A, only C after B
        const planBank: PlanMap = {
            A: { name: "A", canPerform: () => true, instantiate: vi.fn()},
            B: { name: "B", canPerform: (seq: any[]) => seq.length === 1 && seq[0].name === "A", instantiate: vi.fn() },
            C: { name: "C", canPerform: (seq: any[]) => seq.length === 2 && seq[1].name === "B", instantiate: vi.fn() },
            D: { name: "D", canPerform: (seq: any[]) => seq.length === 3 && seq[2].name === "C", instantiate: vi.fn() },
            E: { name: "E", canPerform: (seq: any[]) => seq.length === 4 && seq[3].name === "D", instantiate: vi.fn() },
        };
        const weightMap: PlanWeightMap<typeof planBank> = {
            A: { B: 1, C: 1 },
            B: { C: 1, A: 1 },
            C: { D: 1, A: 1 },
            D: {A: 1, E: 1},
            E: {A: 1, B: 1, C: 1}
        };
        const seq = buildSequenceFromWeightMap(planBank, weightMap);
        expect(seq.map(m => m.name)).toEqual(["A", "B", "C", "D", "E"]);
    });

    it("uses weights to pick the next move", () => {
        const planBank = makePlanBank(["A", "B", "C", "D", "E"]);
        const weightMap: PlanWeightMap<typeof planBank> = {
            A: { B: 1, C: 100 },
            B: { A: 1, D: 100 },
            C: { B: 1 },
            D: { E: 1},
            E: { A: 1 }
        };
        const seq = buildSequenceFromWeightMap(planBank, weightMap);
        expect(seq.map(m => m.name)).toEqual(["A", "C", "B", "D", "E"]);
    });
});