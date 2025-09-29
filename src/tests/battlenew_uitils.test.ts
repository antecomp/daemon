import { idle as idleMove } from "@/core/battlenew/moves/moves";
import { VulnerableStatus } from "@/core/battlenew/statuses/statuses";
import { DamageMultipliers } from "@/core/battlenew/model/battle";
import { Combatant } from "@/core/battlenew/model/combatant";
import { DamageMultiplierFunction, MoveSideEffectOutcome, Move, MoveType, PostMoveContext, PreMoveContext, PreMoveSideEffect } from "@/core/battlenew/model/move";
import { Status } from "@/core/battlenew/model/status";
import { calculateAndApplyDamage, combineMultiplierSets, computeStatusMultipliers, getPhaseMultipliers, initializePlannedMoves, runMovePostEffect, runMovePreEffect } from "@/core/battlenew/utils/engine.utils";
import { PASSTHROUGH_MULTPLIERS } from "@/core/battlenew/model/battle";
import { applyStatusTo, effectPipeline, extendStatusOf, multiplierPipeline } from "@/core/battlenew/utils/movebehavior.utils";
import { buildSidesMap, forEachSide, makeSidesMap, mapSides, oppositeSide, Side } from "@/core/battlenew/utils/sides.utils";
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
            moves: {
                player: agroMoveDummy,
                opponent: agroMoveDummy
            }
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

    test("Calculate And Apply Damage", () => {
        let dolls = makeSidesMap(new Combatant(10), new Combatant(10))
        
        calculateAndApplyDamage(dolls, makeSidesMap(PASSTHROUGH_MULTPLIERS, PASSTHROUGH_MULTPLIERS));
        expect(dolls.player.health).toBe(9);
        expect(dolls.opponent.health).toBe(9);

        dolls = makeSidesMap(new Combatant(10), new Combatant(10));
        calculateAndApplyDamage(dolls, makeSidesMap(PASSTHROUGH_MULTPLIERS, {incoming: 5, outgoing: 10}));
        expect(dolls.player.health).toBe(0);
        expect(dolls.opponent.health).toBe(5);

        dolls = makeSidesMap(new Combatant(10), new Combatant(10));
        calculateAndApplyDamage(dolls, makeSidesMap({incoming: 2, outgoing: 3}, PASSTHROUGH_MULTPLIERS));
        expect(dolls.player.health).toBe(8);
        expect(dolls.opponent.health).toBe(7);

        dolls = makeSidesMap(new Combatant(10), new Combatant(10));
        calculateAndApplyDamage(dolls, makeSidesMap({incoming: 2, outgoing: 3}, {incoming: 4, outgoing: 2}));
        expect(dolls.player.health).toBe(6);
        expect(dolls.opponent.health).toBe(0);
    });

    test("runMovePreEffect, runMovePostEffects", () => {
        let dolls = makeSidesMap(new Combatant(10), new Combatant(10))

        const successEffect: PreMoveSideEffect = () => MoveSideEffectOutcome.Success
        const failEffect: PreMoveSideEffect = () => MoveSideEffectOutcome.Failure
        const resultlessEffect: PreMoveSideEffect = () => undefined
        const selfModiEffect: PreMoveSideEffect = ({self}) => self.addStatus(new VulnerableStatus);

        let moves = makeSidesMap(idleMove, idleMove);
        const preCtxPair = buildSidesMap<PreMoveContext>(side => ({
            self: dolls[side],
            them: dolls[oppositeSide(side)],
            moves
        }));

        moves.player.behaviors.preEffect = successEffect;
        expect(runMovePreEffect(moves.player, preCtxPair.player)).toBe(MoveSideEffectOutcome.Success)

        moves.player.behaviors.preEffect = failEffect;
        expect(runMovePreEffect(moves.player, preCtxPair.player)).toBe(MoveSideEffectOutcome.Failure)

        moves.player.behaviors.preEffect = resultlessEffect;
        expect(runMovePreEffect(moves.player, preCtxPair.player)).toBe(undefined)

        moves.player.behaviors.preEffect = selfModiEffect;
        runMovePreEffect(moves.player, preCtxPair.player);
        expect(dolls.player.activeStatuses).toEqual([[new VulnerableStatus, 1]]);

        const postCtx = buildSidesMap<PostMoveContext>((side) => ({
            ...preCtxPair[side],
            preEffectOutcome: undefined,
            damageDealt: 0,
            damageTaken: 0,
            theirMults: PASSTHROUGH_MULTPLIERS,
            ourMults: PASSTHROUGH_MULTPLIERS
        }));

        moves.player.behaviors.postEffect = successEffect;
        expect(runMovePostEffect(moves.player, postCtx.player)).toBe(MoveSideEffectOutcome.Success)

        moves.player.behaviors.postEffect = failEffect;
        expect(runMovePostEffect(moves.player, postCtx.player)).toBe(MoveSideEffectOutcome.Failure)

        moves.player.behaviors.postEffect = resultlessEffect;
        expect(runMovePostEffect(moves.player, postCtx.player)).toBe(undefined)

        moves.opponent.behaviors.postEffect = selfModiEffect;
        runMovePostEffect(moves.opponent, postCtx.opponent);
        expect(dolls.opponent.activeStatuses).toEqual([[new VulnerableStatus, 1]]);
    })

    test("initialize planned moves - basics", () => {
        const theirPlan = [
            { name: "opp-0", instantiate: vi.fn(), canPerform: vi.fn() },
            { name: "opp-1", instantiate: vi.fn(), canPerform: vi.fn() },
        ];

        // Prepare instantiated return values to assert equality
        const move0 = { name: "m0", type: MoveType.Aggressive, behaviors: {} };
        const move1 = { name: "m1", type: MoveType.Aggressive, behaviors: {} };

        let myPlanRef: any; // capture identity in closures
        const myPlan = [
        {
            name: "p-0",
            canPerform: vi.fn(() => true),
            instantiate: vi.fn(({ myPlan, theirPlan, index }) => {
            expect(myPlan).toBe(myPlanRef);
            expect(theirPlan).toBe(theirPlanRef);
            expect(index).toBe(0);
            return move0;
            }),
        },
        {
            name: "p-1",
            canPerform: vi.fn(() => true),
            instantiate: vi.fn(({ myPlan, theirPlan, index }) => {
            expect(myPlan).toBe(myPlanRef);
            expect(theirPlan).toBe(theirPlanRef);
            expect(index).toBe(1);
            return move1;
            }),
        },
        ];
        const theirPlanRef = theirPlan;
        myPlanRef = myPlan;

        const instantiated = initializePlannedMoves(myPlan, theirPlan);

        // Instantiated moves are exactly what instantiate returned, in order
        expect(instantiated).toEqual([move0, move1]);

        // Validate call counts
        expect(myPlan[0].canPerform).toHaveBeenCalledTimes(1);
        expect(myPlan[1].canPerform).toHaveBeenCalledTimes(1);
        expect(myPlan[0].instantiate).toHaveBeenCalledTimes(1);
        expect(myPlan[1].instantiate).toHaveBeenCalledTimes(1);

    });

    test("initialize planned moves - does not throw when canPerform is omitted", () => {
        const theirPlan: any[] = [];
        const myPlan = [
            {
                name: "no-validator",
                // no canPerform
                instantiate: vi.fn(() => ({
                    name: "x",
                    type: MoveType.Aggressive,
                    behaviors: {},
                })),
            },
        ];
        expect(() => initializePlannedMoves(myPlan as any, theirPlan as any)).not.toThrow();
        expect(myPlan[0].instantiate).toHaveBeenCalledTimes(1);
    });

    test("initialize planned moves = throws if any planned move is illegal by canPerform", () => {
        const theirPlan: any[] = [];
        let myPlanRef: any;

        const bad = {
            name: "illegal",
            canPerform: vi.fn(() => false),
            instantiate: vi.fn(),
        };
        const good = {
            name: "legal",
            canPerform: vi.fn(() => true),
            instantiate: vi.fn(),
        };

        const myPlan = [good, bad, good];
        myPlanRef = myPlan;

        expect(() => initializePlannedMoves(myPlan as any, theirPlan as any)).toThrow();

        // instantiate is never called when validation fails
        expect(good.instantiate).not.toHaveBeenCalled();
        expect(bad.instantiate).not.toHaveBeenCalled();

        // At least one canPerform was evaluated (short-circuit behavior isn’t strictly asserted)
        expect(good.canPerform).toHaveBeenCalledTimes(1);
        expect(bad.canPerform).toHaveBeenCalledTimes(1);
    });
});


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

describe("Move Behavior Util Methods", () => {
    test("effectPipeline basics", () => {
        let dummyPreEffect = vi.fn<PreMoveSideEffect>(() => MoveSideEffectOutcome.Success);

        const ctx: PreMoveContext = {
            self: new Combatant(10),
            them: new Combatant(20),
            moves: {
                player: idleMove,
                opponent: idleMove
            }
        }
        const result = effectPipeline(dummyPreEffect, dummyPreEffect)(ctx);
        expect(dummyPreEffect).toHaveBeenCalledTimes(2);
        expect(result).toBe(MoveSideEffectOutcome.Success);
    });

    test("effectPipeline to take the last defined result in chain", () => {
        let undefEffect = vi.fn<PreMoveSideEffect>(() => undefined);
        let sucEffect = vi.fn<PreMoveSideEffect>(() => MoveSideEffectOutcome.Success);
        let failEffect = vi.fn<PreMoveSideEffect>(() => MoveSideEffectOutcome.Failure);

        const ctx: PreMoveContext = {
            self: new Combatant(10),
            them: new Combatant(20),
            moves: {
                player: idleMove,
                opponent: idleMove
            }
        }

        let result = effectPipeline(failEffect, sucEffect, undefEffect)(ctx);
        expect(result).toBe(MoveSideEffectOutcome.Success)
    });

    test("effectPipeline to forward undefined if no effect has outcome", () => {
        let undefEffect = vi.fn<PreMoveSideEffect>(() => undefined);

        const ctx: PreMoveContext = {
            self: new Combatant(10),
            them: new Combatant(20),
            moves: {
                player: idleMove,
                opponent: idleMove
            }
        }

        let result = effectPipeline(undefEffect, undefEffect, undefEffect)(ctx);
        expect(result).toBe(undefined)       
    });

    test("multiplierPipeline basics", () => {
        const mul1: DamageMultiplierFunction = () => ({incoming: 2, outgoing: 3});
        const mul2: DamageMultiplierFunction = () => ({incoming: 5, outgoing: 7});
        const mul3: DamageMultiplierFunction = () => ({incoming: 10, outgoing: 10});

        //@ts-ignore - Context not needed for test. Not gonna bother building dummy.
        expect(multiplierPipeline(mul1, mul2, mul3)(/* ctx */)).toEqual({incoming: 100, outgoing: 210});
    });

    test("extendStatusOf", () => {
        const doll = new Combatant(100);
        const move: Move = {
            name: 'dsfjkh',
            type: MoveType.Passive,
            behaviors: {
                postEffect: extendStatusOf('self', VulnerableStatus)
            }
        }

        const ctx: PreMoveContext = {
            self: doll,
            them: new Combatant(100),
            moves: {
                player: move,
                opponent: move
            }
        }

        doll.addStatus(new VulnerableStatus, 0);
        expect(doll.getStatusLevel('vulnerable')).toBe(0);

        // @ts-ignore - not gonna bother building full context.
        runMovePostEffect(move, ctx);

        expect(doll.getStatusLevel('vulnerable')).toBe(1);

        // Extend doesnt work after status reaped.
        doll.tickStatuses(); doll.reapExpiredStatuses();
        expect(doll.getStatusLevel('vulnerable')).toBe(0);

        // @ts-ignore
        runMovePostEffect(move, ctx);
        expect(doll.getStatusLevel('vulnerable')).toBe(0);
    });

    test("applyStatusTo", () => {
        const doll = new Combatant(100);
        const move: Move = {
            name: 'dsfjkh',
            type: MoveType.Passive,
            behaviors: {
                preEffect: applyStatusTo('self', VulnerableStatus)
            }
        }
        const ctx: PreMoveContext = {
            self: doll,
            them: new Combatant(100),
            moves: {
                player: move,
                opponent: move
            }
        }

        runMovePreEffect(move, ctx);
        expect(doll.getStatusLevel('vulnerable')).toBe(1);

    })
})