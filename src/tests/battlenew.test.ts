import { combineMultiplierSets } from "@/core/battle/engine/battle.utils";
import { DamageMultipliers } from "@/core/battlenew/types/battle.types";
import { describe, it, expect, vi, test } from "vitest";

describe("BattleEngine Utility Functions", () => {
    test("Combine Multiplier Sets - General Case", () => {
        const setOne: DamageMultipliers = {incoming: 2, outgoing: 3};
        const setTwo: DamageMultipliers = {incoming: 5, outgoing: 7};

        const combined = combineMultiplierSets(setOne, setTwo);

        expect(combined).toEqual({incoming: 10, outgoing: 21});         
    });

    test("Combine Multiplier Sets - One Option Returns Just That", () => {
        const set: DamageMultipliers = {incoming: 5, outgoing: 6};

        const combined = combineMultiplierSets(set);
        expect(combined).toEqual(set);
    });

    test("x")
})
