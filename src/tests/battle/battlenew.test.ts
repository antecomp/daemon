import { attack, defend, evade, heal, nothingMove, overwhelm, prepare } from "@/core/battle/moves/moves";
import { mirrorPlan, planMove, repeatPlan } from "@/core/battle/moves/plannedMoves";
import { createBattleEngine } from "@/core/battle/engine/battleEngine";
import { BattleReactions } from "@/core/battle/model/battleReactions";
import { PlannedSequence } from "@/core/battle/model/plannedMove";
import { PlannedMove } from "@/core/battle/model/plannedMove";
import { OpponentAI, OpponentStats } from "@/core/battle/ai/opponentAI.types";
import { describe, expect, vi, test } from "vitest";
import { BattleOutcome } from "@/core/battle/model/battle";

const PlanForNothing: PlannedMove = {
    name: 'nothing',
    instantiate: () => nothingMove
}

const idlePlan: PlannedSequence = [PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing]

const PlanForAttack: PlannedMove = {
    name: 'attack',
    instantiate: () => attack
}

function generateSampleOpponentAI(plan?: PlannedMove[]): OpponentAI {
    return {
        getSequence: (_me, _player) => plan ?? [PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing]
    }
}

const SAMPLE_OPPONENT_STATS: OpponentStats = {maxHealth: 100}

describe("battleEngine init", () => {

    test("prepare, exec triggers", () => {


        const prepareReaction = vi.fn();
        const execReaction = vi.fn();

        const reactions: BattleReactions = {
            RoundPrepared: prepareReaction,
            RoundStart: execReaction
        }

        const engine = createBattleEngine(generateSampleOpponentAI(), SAMPLE_OPPONENT_STATS, reactions);

        engine.setupRound();
        expect(prepareReaction).toHaveBeenCalled();

        engine.executeRound([PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing])
        expect(execReaction).toHaveBeenCalled();
    })
})

describe("Sequence Eval basics", () => {
    test("Attack damage dealt", async () => {
        const reactions: BattleReactions = {
            RoundEnd: ({combatants}) => {expect(combatants.player.health).toBe(9)}
        }
        
        const engine = createBattleEngine(generateSampleOpponentAI([PlanForAttack, PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing]), SAMPLE_OPPONENT_STATS, reactions);
        engine.setupRound();
        await engine.executeRound(idlePlan);
    })

    test("Repeat performs attack twice", async () => {
         const reactions: BattleReactions = {
            RoundEnd: ({combatants}) => {expect(combatants.player.health).toBe(8)}
        }

        const engine = createBattleEngine(generateSampleOpponentAI([PlanForAttack, repeatPlan, PlanForNothing, PlanForNothing, PlanForNothing]), SAMPLE_OPPONENT_STATS, reactions);
        engine.setupRound();
        await engine.executeRound(idlePlan);
    });

    test("Defend reduces incoming damage", async () => {
        const reactions: BattleReactions = {
            RoundEnd: ({combatants}) => {expect(combatants.player.health).toBe(9.5)}
        }
        
        const engine = createBattleEngine(generateSampleOpponentAI([PlanForAttack, PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing]), SAMPLE_OPPONENT_STATS, reactions);
        engine.setupRound();
        await engine.executeRound([planMove(defend), PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing]);        
    });

    test("Heal fails based on RequiresFocus", async () => {
         const reactions: BattleReactions = {
            RoundStart: ({combatants}) => combatants.opponent.takeDamage(10),
            RoundEnd: ({combatants}) => {expect(combatants.opponent.health).toBeLessThan(combatants.opponent.maxHealth - 10)}
        };

        const engine = createBattleEngine(
            generateSampleOpponentAI([planMove(heal), PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing]),
            {maxHealth: 20},
            reactions
        );
        engine.setupRound();
        engine.executeRound([PlanForAttack, PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing]);
    });

    test("Heal succeeds with focus", async () => {
         const reactions: BattleReactions = {
            RoundStart: ({combatants}) => combatants.opponent.takeDamage(10),
            RoundEnd: ({combatants}) => {expect(combatants.opponent.health).toBeGreaterThan(combatants.opponent.maxHealth - 10)}
        };

        const engine = createBattleEngine(
            generateSampleOpponentAI([planMove(heal), PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing]),
            {maxHealth: 20},
            reactions
        );
        engine.setupRound();
        engine.executeRound(idlePlan);        
    });

    test("Prepare adds status on success", async () => {
         const reactions: BattleReactions = {
            RoundEnd: ({combatants}) => {expect(combatants.opponent.getStatusLevel('prepared')).toBe(1)}
        };

        const engine = createBattleEngine(
            generateSampleOpponentAI([PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing, planMove(prepare)]),
            {maxHealth: 20},
            reactions
        );
        engine.setupRound();
        await engine.executeRound(idlePlan);        
    });


    test("Prepare fails without focus", async () => {
         const reactions: BattleReactions = {
            RoundEnd: ({combatants}) => {expect(combatants.opponent.getStatusLevel('prepared')).toBe(0)}
        };

        const engine = createBattleEngine(
            generateSampleOpponentAI([PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing, planMove(prepare)]),
            {maxHealth: 20},
            reactions
        );
        engine.setupRound();
        await engine.executeRound([PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing, planMove(attack)]);        
    });
})

describe("Repeat chaining behavior", () => {
    test("repeat skips prior repeats to find latest non-repeat move", () => {
        const myPlan: PlannedSequence = [planMove(attack), repeatPlan, repeatPlan, PlanForNothing, PlanForNothing];
        const ctx = { myPlan, theirPlan: myPlan, index: 2 };

        const move = myPlan[2].instantiate(ctx);

        expect(move.name).toBe(attack.name);
        expect(move.tags).toEqual(['repeated']);
    });

    test("mirror followed by multiple repeats mirrors the current opponent move", () => {
        const theirPlan: PlannedSequence = [PlanForAttack, planMove(defend), planMove(prepare), PlanForNothing, PlanForNothing];
        const myPlan: PlannedSequence = [mirrorPlan, repeatPlan, repeatPlan, PlanForNothing, PlanForNothing];
        const ctx = { myPlan, theirPlan, index: 2 };

        const move = myPlan[2].instantiate(ctx);

        expect(move.name).toBe(prepare.name);
        expect(move.tags).toEqual(['mirrored', 'repeated']);
    });
});

describe("Overwhelm interactions", () => {

    test("Overwhelm lands on defensive and evade", async () => {
        const reactions: BattleReactions = {
            RoundEnd: ({ combatants }) => {
                expect(combatants.player.health).toBe(8); // two hits of 1 each
                expect(combatants.opponent.health).toBe(combatants.opponent.maxHealth);
            }
        };
        const engine = createBattleEngine(
            generateSampleOpponentAI([planMove(overwhelm), planMove(overwhelm), PlanForNothing, PlanForNothing, PlanForNothing]),
            SAMPLE_OPPONENT_STATS,
            reactions
        );
        engine.setupRound();
        await engine.executeRound([planMove(defend), planMove(evade), PlanForNothing, PlanForNothing, PlanForNothing]);
    });

    test("Overwhelm fails vs non-defensive, applies vulnerable to self", async () => {
        const reactions: BattleReactions = {
            RoundEnd: ({ combatants }) => {
                expect(combatants.player.health).toBe(combatants.player.maxHealth); // overwhelm deals 0 vs attack
                // player attack deals 1, opponent is vulnerable (1.5x incoming)
                expect(combatants.opponent.health).toBe(combatants.opponent.maxHealth - 1.5);
            }
        };
        const engine = createBattleEngine(
            generateSampleOpponentAI([planMove(overwhelm), PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing]),
            SAMPLE_OPPONENT_STATS,
            reactions
        );
        engine.setupRound();
        await engine.executeRound([PlanForAttack, PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing]);
    });
});

describe("Prepare effects", () => {
    test("Prepare attack does bonus damage", async () => {
        const engine = createBattleEngine(generateSampleOpponentAI(), SAMPLE_OPPONENT_STATS, {
            RoundEnd: ({ combatants }) => {
                expect(combatants.opponent.health).toBe(combatants.opponent.maxHealth - 2);
            }
        });
        engine.setupRound();
        await engine.executeRound([planMove(prepare), PlanForAttack, PlanForNothing, PlanForNothing, PlanForNothing]);
        const engine2 = createBattleEngine(generateSampleOpponentAI(), SAMPLE_OPPONENT_STATS, {
            RoundEnd: ({ combatants }) => {
                expect(combatants.opponent.health).toBe(combatants.opponent.maxHealth - 4);
            }
        });
        engine2.setupRound();
        await engine2.executeRound([planMove(prepare), repeatPlan, PlanForAttack, PlanForNothing, PlanForNothing]);
    });
    test("Prepare wraps to next round", async () => {
        let phase = 0;
        const reactions: BattleReactions = {
            RoundEnd: ({ combatants }) => {
                if (phase === 0) {
                    // After first round ending with prepare at last index, prepared should persist
                    expect(combatants.player.getStatusLevel('prepared')).toBe(1);
                    phase = 1;
                } else {
                    // After second round starting with attack, should deal 2 damage
                    expect(combatants.opponent.health).toBe(combatants.opponent.maxHealth - 2);
                }
            }
        };
        const engine = createBattleEngine(generateSampleOpponentAI(), SAMPLE_OPPONENT_STATS, reactions);
        await engine.setupRound();
        await engine.executeRound([PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing, planMove(prepare)]);
        await engine.setupRound();
        await engine.executeRound([PlanForAttack, PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing]);
    });
});

describe("Evade behavior", () => {
    test("Evade negates damage with chance (~50%)", async () => {
        let success = 0;
        let runs = 1000;
        const reactions: BattleReactions = {
            RoundEnd: ({ combatants }) => {
                if (combatants.player.health === combatants.player.maxHealth) success++;
                // heal back to max for reuse
                combatants.player.heal(999);
                combatants.opponent.heal(999);
            }
        };
        const engine = createBattleEngine(
            generateSampleOpponentAI([PlanForAttack, PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing]),
            SAMPLE_OPPONENT_STATS,
            reactions
        );
        for (let i = 0; i < runs; i++) {
            await engine.setupRound();
            await engine.executeRound([planMove(evade), PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing]);
        }
        const rate = success / runs;
        expect(rate).toBeGreaterThan(0.45);
        expect(rate).toBeLessThan(0.55);
    });
    test("Evade chance scales with prepare (~75%)", async () => {
        let success = 0;
        let runs = 500; // Slightly lower to keep runtime reasonable
        const reactions: BattleReactions = {
            RoundEnd: ({ combatants }) => {
                if (combatants.player.health === combatants.player.maxHealth) success++;
                combatants.player.heal(999);
                combatants.opponent.heal(999);
            }
        };
        const engine = createBattleEngine(
            generateSampleOpponentAI([PlanForNothing, PlanForAttack, PlanForNothing, PlanForNothing, PlanForNothing]),
            SAMPLE_OPPONENT_STATS,
            reactions
        );
        for (let i = 0; i < runs; i++) {
            await engine.setupRound();
            await engine.executeRound([planMove(prepare), planMove(evade), PlanForNothing, PlanForNothing, PlanForNothing]);
        }
        const rate = success / runs;
        expect(rate).toBeGreaterThan(0.65);
        expect(rate).toBeLessThan(0.85);
    });
    test("Evade guaranteed on prepare + repeat", async () => {
        const reactions: BattleReactions = {
            RoundEnd: ({ combatants }) => {
                expect(combatants.player.health).toBe(combatants.player.maxHealth);
            }
        };
        const engine = createBattleEngine(
            generateSampleOpponentAI([PlanForNothing, PlanForNothing, PlanForAttack, PlanForNothing, PlanForNothing]),
            SAMPLE_OPPONENT_STATS,
            reactions
        );
        await engine.setupRound();
        await engine.executeRound([planMove(prepare), repeatPlan, planMove(evade), PlanForNothing, PlanForNothing]);
    });
    test("Evade counterattack bonus (mania)", async () => {
        const reactions: BattleReactions = {
            RoundEnd: ({ combatants }) => {
                expect(combatants.player.health).toBe(combatants.player.maxHealth); // evaded
                expect(combatants.opponent.health).toBe(combatants.opponent.maxHealth - 2); // mania doubles next attack
            }
        };
        const engine = createBattleEngine(
            generateSampleOpponentAI([PlanForNothing, PlanForNothing, PlanForAttack, PlanForNothing, PlanForNothing]),
            SAMPLE_OPPONENT_STATS,
            reactions
        );
        await engine.setupRound();
        await engine.executeRound([planMove(prepare), repeatPlan, planMove(evade), PlanForAttack, PlanForNothing]);
    });
    test("No mania if not attacked", async () => {
        const reactions: BattleReactions = {
            RoundEnd: ({ combatants }) => {
                expect(combatants.player.getStatusLevel('mania')).toBe(0);
            }
        };
        const engine = createBattleEngine(generateSampleOpponentAI(), SAMPLE_OPPONENT_STATS, reactions);
        await engine.setupRound();
        await engine.executeRound([PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing, planMove(evade)]);
    });
});

describe("Heal scaling with prepare", () => {
    test("Heal scales when prepared", async () => {
        let healAmountPrep = 0;
        let healAmountNorm = 0;
        
        // Prepared heal
        const enginePrep = createBattleEngine(generateSampleOpponentAI(
            [PlanForNothing, planMove(prepare), planMove(heal), PlanForNothing, PlanForNothing]
        ), {maxHealth: 100}, {
            RoundStart: ({ combatants }) => { combatants.opponent.takeDamage(combatants.opponent.maxHealth - 1); },
            RoundEnd: ({ combatants }) => { healAmountPrep = combatants.opponent.health; }
        });
        await enginePrep.setupRound();
        await enginePrep.executeRound(idlePlan);
        
        // Normal heal
        const engineNorm = createBattleEngine(generateSampleOpponentAI(
            [PlanForNothing, PlanForNothing, planMove(heal), PlanForNothing, PlanForNothing]
        ), {maxHealth: 100}, {
            RoundStart: ({ combatants }) => { combatants.opponent.takeDamage(combatants.opponent.maxHealth - 1); },
            RoundEnd: ({ combatants }) => { healAmountNorm = combatants.opponent.health; }
        });
        await engineNorm.setupRound();
        await engineNorm.executeRound(idlePlan);

        expect(healAmountPrep).toBeGreaterThan(healAmountNorm);
    });
});

describe("Mirror move", () => {
    test("Mirror clones basic move", async () => {
        const engine = createBattleEngine(
            generateSampleOpponentAI([PlanForAttack, PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing]),
            SAMPLE_OPPONENT_STATS,
            {
                RoundEnd: ({combatants: {player, opponent}}) => {
                    expect(player.health).toBe(player.maxHealth - 1);
                    expect(opponent.health).toBe(opponent.maxHealth -1);
                }
            }
        );

        engine.setupRound();
        await engine.executeRound([mirrorPlan, mirrorPlan, mirrorPlan, mirrorPlan, mirrorPlan]);
    });

    test("Mirror clones basic move (opponent)", async () => {
        const engine = createBattleEngine(
            generateSampleOpponentAI([mirrorPlan, PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing]),
            SAMPLE_OPPONENT_STATS,
            {
                RoundEnd: ({combatants: {player, opponent}}) => {
                    expect(player.health).toBe(player.maxHealth - 1);
                    expect(opponent.health).toBe(opponent.maxHealth -1);
                }
            }
        );

        engine.setupRound();
        await engine.executeRound([planMove(attack), mirrorPlan, mirrorPlan, mirrorPlan, mirrorPlan]);
    });

    test("Prepare mirror properly scales move output", async () => {
            const engine = createBattleEngine(
                generateSampleOpponentAI([PlanForNothing, planMove(attack), PlanForNothing, PlanForNothing, PlanForNothing]),
                SAMPLE_OPPONENT_STATS,
                {
                    RoundEnd: ({combatants: {player, opponent}}) => {
                        expect(opponent.health).toBe(opponent.maxHealth - 2); // prepared attack
                        expect(player.health).toBe(player.maxHealth -1); // Normal attack from opp.
                    }
                }
            );

            engine.setupRound();
            await engine.executeRound([planMove(prepare), mirrorPlan, PlanForNothing, PlanForNothing, PlanForNothing]);
    });

    test("Mirror->repeat mirrors twice accurately", async () => {
        const engine = createBattleEngine(
            generateSampleOpponentAI([planMove(attack), planMove(attack), PlanForNothing, PlanForNothing, PlanForNothing]),
            SAMPLE_OPPONENT_STATS,
            {
                RoundEnd: ({combatants: {opponent}}) => {
                    expect(opponent.health).toBe(opponent.maxHealth - 2); // Hit twice
                }
            }
        );

        engine.setupRound();
        await engine.executeRound([mirrorPlan, repeatPlan, PlanForNothing, PlanForNothing, PlanForNothing]);
    });

    test("Mirror->repeat mirrors twice accurately (2)", async () => {
        const engine = createBattleEngine(
            generateSampleOpponentAI([planMove(attack), planMove(defend), PlanForNothing, PlanForNothing, PlanForNothing]),
            SAMPLE_OPPONENT_STATS,
            {
                RoundEnd: ({combatants: {opponent}}) => {
                    expect(opponent.health).toBe(opponent.maxHealth - 1); // Hit once once
                }
            }
        );

        engine.setupRound();
        await engine.executeRound([mirrorPlan, repeatPlan, PlanForNothing, PlanForNothing, PlanForNothing]);
    });

    test("Mirror on mirror fails", async () => {
        const engine = createBattleEngine(
            generateSampleOpponentAI([mirrorPlan, PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing]),
            SAMPLE_OPPONENT_STATS,
            {
                RoundEnd: ({combatants: {opponent, player}}) => {
                    expect(opponent.health).toBe(opponent.maxHealth); // No damage taken
                    expect(player.health).toBe(player.maxHealth);
                }
            }
        );

        engine.setupRound();
        await engine.executeRound([mirrorPlan, PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing]);
    });

    test("Mirror applies status moves to self correctly", async () => {
        const engine = createBattleEngine(
            generateSampleOpponentAI([PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing, planMove(prepare)]),
            SAMPLE_OPPONENT_STATS,
            {
                RoundEnd: ({combatants: {player, opponent}}) => {
                    expect(player.getStatusLevel('prepared')).toBe(1);
                    expect(opponent.getStatusLevel('prepared')).toBe(1);
                }
            }
        );

        engine.setupRound();
        await engine.executeRound([PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing, mirrorPlan])
    });

    test("Mirror on self-effecting moves (e.g heal) properly target self", async () => {
        const engine = createBattleEngine(
            generateSampleOpponentAI([planMove(attack), PlanForNothing, PlanForNothing, PlanForNothing, planMove(heal)]),
            SAMPLE_OPPONENT_STATS,
            {
                RoundEnd: ({combatants: {player, opponent}}) => {
                    expect(player.health).toBe(player.maxHealth);
                    expect(opponent.health).toBe(opponent.maxHealth);
                }
            }
        );

        engine.setupRound();
        await engine.executeRound([planMove(attack), PlanForNothing, PlanForNothing, PlanForNothing, mirrorPlan])
    });

    test("Mirror on repeat, runs *opponents* last move, not our own", async () => {
        const engine = createBattleEngine(
            generateSampleOpponentAI([planMove(attack), repeatPlan, PlanForNothing, PlanForNothing, PlanForNothing]),
            SAMPLE_OPPONENT_STATS,
            {
                RoundEnd: ({combatants: {opponent}}) => {
                    expect(opponent.health).toBe(opponent.maxHealth -1);
                }
            }
        );

        engine.setupRound();

        await engine.executeRound([PlanForNothing, mirrorPlan, PlanForNothing, PlanForNothing, PlanForNothing]);
    });
})

describe("Death tests", () => {
    test.each([0,1,2,3,4])("Player death at %i", async (index) => {

        let battleResult: BattleOutcome | undefined = undefined;
        let battleEndTrigger = vi.fn(({outcome}) => battleResult = outcome);
        let moveHitTrigger = vi.fn();

        const engine = createBattleEngine(
            generateSampleOpponentAI([
            ...Array(index).fill(PlanForNothing), // Fill with no moves until the attack index
            planMove(attack), // Opponent attacks at the given index
            ...Array(4 - index).fill(PlanForNothing) // Fill the remaining moves                
            ]),
            SAMPLE_OPPONENT_STATS,
            {
                RoundPrepared: ({combatants: {player}}) => {
                    player.takeDamage(player.maxHealth - 0.25);
                },
                MoveStart: moveHitTrigger, // to ensure we only go up to the killing move not the end of the sequence.
                BattleEnd: battleEndTrigger 
            }
        );

        await engine.setupRound();

        await engine.executeRound(idlePlan);

        expect(battleEndTrigger).toHaveBeenCalled();
        expect(moveHitTrigger).toBeCalledTimes(index + 1);
        expect(battleResult).toBe(BattleOutcome.OpponentVictory)
    });

    test.each([0,1,2,3,4])("Opponent death at %i", async (index) => {

        let battleResult: BattleOutcome | undefined = undefined;
        let battleEndTrigger = vi.fn(({outcome}) => battleResult = outcome);
        let moveHitTrigger = vi.fn();

        const engine = createBattleEngine(
            generateSampleOpponentAI(idlePlan),
            SAMPLE_OPPONENT_STATS,
            {
                RoundPrepared: ({combatants: {opponent}}) => {
                    opponent.takeDamage(opponent.maxHealth - 0.25);
                    expect(opponent.health).toBe(0.25);
                },
                MoveStart: moveHitTrigger, // to ensure we only go up to the killing move not the end of the sequence.
                BattleEnd: battleEndTrigger
            }
        );

        await engine.setupRound();

        await engine.executeRound(
            [
            ...Array(index).fill(PlanForNothing), // Fill with no moves until the attack index
            planMove(attack), // Opponent attacks at the given index
            ...Array(4 - index).fill(PlanForNothing) // Fill the remaining moves 
            ]    
        );

        expect(battleEndTrigger).toHaveBeenCalled();
        expect(moveHitTrigger).toBeCalledTimes(index + 1);
        expect(battleResult).toBe(BattleOutcome.PlayerVictory)
    });


})
