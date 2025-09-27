import { DamageMultipliers } from "@/core/battlenew/types/battle.types";
import { Combatant } from "@/core/battlenew/types/combatant";
import { Move, MoveType } from "@/core/battlenew/types/move";
import { Status } from "@/core/battlenew/types/status";
import { combineMultiplierSets, computeStatusMultipliers, getPhaseMultipliers } from "@/core/battlenew/utils/battleUtils";
import { buildSidesMap, forEachSide, makeSidesMap, mapSides, oppositeSide, Side } from "@/core/battlenew/utils/sideUtils";
import { describe, expect, test, vi } from "vitest";


describe("Combatant Class Tests", () => {
    test("Initializes to have maxhealth", () => {
        const doll = new Combatant(100);
        expect(doll.health).toBe(100);
        expect(doll.maxHealth).toBe(100);
    });

    test("Combatant takeDamage modifies state, will not put health below 0", () => {
        const doll = new Combatant(100);
        doll.takeDamage(50);
        expect(doll.health).toBe(50);
        doll.takeDamage(100000);
        expect(doll.health).toBe(0);
    });

    test("Combatant death getter", () => {
        const doll = new Combatant(100);
        expect(doll.isDead).toBe(false);
        doll.takeDamage(50);
        expect(doll.isDead).toBe(false);
        doll.takeDamage(50);
        expect(doll.isDead).toBe(true);
    });

    test("Combatant health percentage getter", () => {
        const doll = new Combatant(200);
        expect(doll.healthPercent).toBe(100);
        doll.takeDamage(100);
        expect(doll.healthPercent).toBe(50);
    });

    test("Combat heal method works & does not exceed maxHealth", () => {
        const doll = new Combatant(100);
        doll.takeDamage(50);
        doll.heal(25);
        expect(doll.health).toBe(75);
        doll.heal(10000);
        expect(doll.health).toBe(100);
    });

    test("Combatant's status methods", () => {
        class DummyStatus extends Status {
            name = 'dummy';
            getStatusMultipliers(level: number): DamageMultipliers {
                return { incoming: level, outgoing: level * 2 }
            };
        }

        const dummyStatus = new DummyStatus;
        const altDummyStatus = new class extends Status {
            name = 'dummy2';
            getStatusMultipliers(_level: number): DamageMultipliers {
                return { incoming: 5, outgoing: 7 }
            }
        }

        const doll = new Combatant(10);
        doll.addStatus(dummyStatus);
        expect(doll.getStatusAndLevel('dummy')).toEqual([dummyStatus, 1]);
        expect(doll.getStatusLevel('dummy')).toBe(1);
        expect(doll.activeStatuses).toEqual([[dummyStatus, 1]]);

        doll.addStatus(dummyStatus);
        expect(doll.getStatusAndLevel('dummy')).toEqual([dummyStatus, 2]);
        expect(doll.getStatusLevel('dummy')).toBe(2);
        expect(doll.activeStatuses).toEqual([[dummyStatus, 2]]);

        doll.addStatus(altDummyStatus);
        expect(doll.activeStatuses).toEqual([[dummyStatus, 2], [altDummyStatus, 1]]);

        doll.tickStatuses();
        expect(doll.activeStatuses).toEqual([]);

        // By instance
        doll.extendStatus(altDummyStatus)
        expect(doll.activeStatuses).toEqual([[altDummyStatus, 1]]);

        // By name
        doll.extendStatus('dummy', 2)
        expect(doll.activeStatuses).toEqual([[dummyStatus, 2], [altDummyStatus, 1]]);

        doll.tickStatuses();
        expect(doll.activeStatuses).toEqual([[dummyStatus, 2]]);

        doll.reapExpiredStatuses();
        doll.extendStatus(altDummyStatus); // should do nothing since was reaped.
        expect(doll.activeStatuses).toEqual([[dummyStatus, 2]]);
    })
});

describe("BattleEngine Utility Functions", () => {
    test("Combine Multiplier Sets - General Case", () => {
        const setOne: DamageMultipliers = { incoming: 2, outgoing: 3 };
        const setTwo: DamageMultipliers = { incoming: 5, outgoing: 7 };

        const combined = combineMultiplierSets(setOne, setTwo);

        expect(combined).toEqual({ incoming: 10, outgoing: 21 });
    });

    test("Combine Multiplier Sets - One Option Returns Just That", () => {
        const set: DamageMultipliers = { incoming: 5, outgoing: 6 };

        const combined = combineMultiplierSets(set);
        expect(combined).toEqual(set);
    });

    test("Compute Status Multipliers", () => {
        const doll = new Combatant(100);
        const dummyStatus = new class extends Status {
            name = 'dummy';
            getStatusMultipliers(level: number): DamageMultipliers {
                return { incoming: level, outgoing: level * 2 }
            };
        }

        // Fallback to passthru values with no statuses
        expect(computeStatusMultipliers(doll.activeStatuses)).toEqual({ incoming: 1, outgoing: 1 });

        // Single Status
        doll.addStatus(dummyStatus);
        expect(computeStatusMultipliers(doll.activeStatuses)).toEqual({ incoming: 1, outgoing: 2 });

        // Status Stack Increases Reported Level
        doll.addStatus(dummyStatus);
        expect(computeStatusMultipliers(doll.activeStatuses)).toEqual({ incoming: 2, outgoing: 4 });

        // Multiple Statuses With Different Multipliers Reduce Together Correctly
        const altDummyStatus = new class extends Status {
            name = 'dummy2';
            getStatusMultipliers(_level: number): DamageMultipliers {
                return { incoming: 5, outgoing: 7 }
            }
        }

        doll.addStatus(altDummyStatus)
        expect(computeStatusMultipliers(doll.activeStatuses)).toEqual({ incoming: 10, outgoing: 28 });
    });

    test("Get Phase Multipliers", () => {
        const doll = new Combatant(100);
        const oppdoll = new Combatant(5);

        const agroMoveDummy: Move = {
            name: 'dummy',
            type: MoveType.Aggressive,
            behaviors: {}
        }

        const ctx = {
            preEffectOutcome: undefined,
            self: doll,
            opponent: oppdoll,
            sequence: [],
        };

        expect(
            getPhaseMultipliers(agroMoveDummy, ctx)
        ).toEqual({ incoming: 1, outgoing: 1 });

        const passiveMoveDummy: Move = {
            name: 'passive',
            type: MoveType.Passive,
            behaviors: {}
        }

        expect(
            getPhaseMultipliers(passiveMoveDummy, ctx)
        ).toEqual({ incoming: 1, outgoing: 0 });

        const basicVulnStatus = new class extends Status {
            name = 'xxx'
            getStatusMultipliers(level: number): DamageMultipliers {
                return { incoming: 2 * level, outgoing: 1 }
            }
        }

        doll.addStatus(basicVulnStatus);
        expect(
            getPhaseMultipliers(agroMoveDummy, ctx)
        ).toEqual(
            { incoming: 2, outgoing: 1 }
        );

        doll.addStatus(basicVulnStatus);
        expect(
            getPhaseMultipliers(agroMoveDummy, ctx)
        ).toEqual(
            { incoming: 4, outgoing: 1 }
        );

        doll.tickStatuses(); doll.reapExpiredStatuses();
        expect(
            getPhaseMultipliers(agroMoveDummy, ctx)
        ).toEqual(
            { incoming: 1, outgoing: 1 }
        );

        const specialMoveDummy: Move = {
            name: "jkhfds",
            type: MoveType.Aggressive,
            behaviors: {
                damageMultipliers() {
                    return { incoming: 0.5, outgoing: 20 }
                },
            }
        }

        expect(
            getPhaseMultipliers(specialMoveDummy, ctx)
        ).toEqual(
            { incoming: 0.5, outgoing: 20 }
        );

        doll.addStatus(basicVulnStatus)
        expect(
            getPhaseMultipliers(specialMoveDummy, ctx)
        ).toEqual(
            { incoming: 1, outgoing: 20 }
        );

    })


    // TODO: calculateAndApplyDamage, runMovePre/PostEffect, initializePlannedMoves.
});

// Need test for sideUtils!
describe("side utils", () => {
    test("makeSidesMap creates Sides from values", () => {
        const m = makeSidesMap(1, 2);
        expect(m).toEqual({ player: 1, opponent: 2 });
    });

    test("oppositeSide flips both ways", () => {
        expect(oppositeSide("player")).toBe<Side>("opponent");
        expect(oppositeSide("opponent")).toBe<Side>("player");
    });

    test("mapSides maps values and passes role + whole", () => {
        const input = makeSidesMap(2, 3);
        const spy = vi.fn((val: number, role: Side, whole: typeof input) => {
            return `${role}:${val}:${whole === input}`;
        });

        const out = mapSides(input, spy);

        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenNthCalledWith(1, 2, "player", input);
        expect(spy).toHaveBeenNthCalledWith(2, 3, "opponent", input);

        expect(out).toEqual({
            player: "player:2:true",
            opponent: "opponent:3:true",
        });
    });

    test("forEachSide iterates both sides in insertion order", () => {
        const pair = makeSidesMap("a", "b");
        const calls: Array<[Side, string]> = [];

        forEachSide(pair, (value, role) => calls.push([role, value]));

        expect(calls).toEqual([
            ["player", "a"],
            ["opponent", "b"],
        ]);
    });

    test("buildSidesMap builds via builder per side", () => {
        const builder = vi.fn((role: Side) => (role === "player" ? 10 : 20));
        const built = buildSidesMap(builder);

        expect(builder).toHaveBeenCalledTimes(2);
        expect(builder).toHaveBeenNthCalledWith(1, "player");
        expect(builder).toHaveBeenNthCalledWith(2, "opponent");
        expect(built).toEqual({ player: 10, opponent: 20 });
    });
})