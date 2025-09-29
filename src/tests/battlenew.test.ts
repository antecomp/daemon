import { PLAYER_HEALTH_PLACEHOLDER } from "@/core/battlenew/config/battle.config";
import { attack, defend, evade, heal, nothingMove, overwhelm, prepare } from "@/core/battlenew/moves/moves";
import { planMove, repeatPlan } from "@/core/battlenew/moves/plannedMoves";
import { createBattleEngine } from "@/core/battlenew/engine/battleEngine";
import { BattleReactions } from "@/core/battlenew/events/battleEvent.types";
import { Combatant } from "@/core/battlenew/model/combatant";
import { PlannedSequence } from "@/core/battlenew/model/plannedmove";
import { PlannedMove } from "@/core/battlenew/model/plannedmove";
import { OpponentAI, OpponentStats } from "@/core/battlenew/ai/opponentAI.types";
import { describe, expect, vi, test } from "vitest";

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
            RoundPrepared: [prepareReaction],
            RoundStart: [execReaction]
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
            RoundEnd: [({combatants}) => {expect(combatants.player.health).toBe(9)}]
        }
        
        const engine = createBattleEngine(generateSampleOpponentAI([PlanForAttack, PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing]), SAMPLE_OPPONENT_STATS, reactions);
        engine.setupRound();
        await engine.executeRound(idlePlan);
    })

    test("Repeat performs attack twice", async () => {
         const reactions: BattleReactions = {
            RoundEnd: [({combatants}) => {expect(combatants.player.health).toBe(8)}]
        }

        const engine = createBattleEngine(generateSampleOpponentAI([PlanForAttack, repeatPlan, PlanForNothing, PlanForNothing, PlanForNothing]), SAMPLE_OPPONENT_STATS, reactions);
        engine.setupRound();
        await engine.executeRound(idlePlan);
    });

    test("Defend reduces incoming damage", async () => {
        const reactions: BattleReactions = {
            RoundEnd: [({combatants}) => {expect(combatants.player.health).toBe(9.5)}]
        }
        
        const engine = createBattleEngine(generateSampleOpponentAI([PlanForAttack, PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing]), SAMPLE_OPPONENT_STATS, reactions);
        engine.setupRound();
        await engine.executeRound([planMove(defend), PlanForNothing, PlanForNothing, PlanForNothing, PlanForNothing]);        
    });

    test("Heal fails based on RequiresFocus", async () => {
         const reactions: BattleReactions = {
            RoundStart: [({combatants}) => combatants.opponent.takeDamage(10)],
            RoundEnd: [({combatants}) => {expect(combatants.opponent.health).toBeLessThan(combatants.opponent.maxHealth - 10)}]
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
            RoundStart: [({combatants}) => combatants.opponent.takeDamage(10)],
            RoundEnd: [({combatants}) => {expect(combatants.opponent.health).toBeGreaterThan(combatants.opponent.maxHealth - 10)}]
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
            RoundEnd: [({combatants}) => {expect(combatants.opponent.getStatusLevel('prepared')).toBe(1)}]
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
            RoundEnd: [({combatants}) => {expect(combatants.opponent.getStatusLevel('prepared')).toBe(0)}]
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

describe("Overwhelm interactions", () => {

    test("Overwhelm lands on defensive and evade", async () => {
        const reactions: BattleReactions = {
            RoundEnd: [({ combatants }) => {
                expect(combatants.player.health).toBe(8); // two hits of 1 each
                expect(combatants.opponent.health).toBe(combatants.opponent.maxHealth);
            }]
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
            RoundEnd: [({ combatants }) => {
                expect(combatants.player.health).toBe(combatants.player.maxHealth); // overwhelm deals 0 vs attack
                // player attack deals 1, opponent is vulnerable (1.5x incoming)
                expect(combatants.opponent.health).toBe(combatants.opponent.maxHealth - 1.5);
            }]
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
            RoundEnd: [({ combatants }) => {
                expect(combatants.opponent.health).toBe(combatants.opponent.maxHealth - 2);
            }]
        });
        engine.setupRound();
        await engine.executeRound([planMove(prepare), PlanForAttack, PlanForNothing, PlanForNothing, PlanForNothing]);
        const engine2 = createBattleEngine(generateSampleOpponentAI(), SAMPLE_OPPONENT_STATS, {
            RoundEnd: [({ combatants }) => {
                expect(combatants.opponent.health).toBe(combatants.opponent.maxHealth - 4);
            }]
        });
        engine2.setupRound();
        await engine2.executeRound([planMove(prepare), repeatPlan, PlanForAttack, PlanForNothing, PlanForNothing]);
    });
    test("Prepare wraps to next round", async () => {
        let phase = 0;
        const reactions: BattleReactions = {
            RoundEnd: [({ combatants }) => {
                if (phase === 0) {
                    // After first round ending with prepare at last index, prepared should persist
                    expect(combatants.player.getStatusLevel('prepared')).toBe(1);
                    phase = 1;
                } else {
                    // After second round starting with attack, should deal 2 damage
                    expect(combatants.opponent.health).toBe(combatants.opponent.maxHealth - 2);
                }
            }]
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
            RoundEnd: [({ combatants }) => {
                if (combatants.player.health === combatants.player.maxHealth) success++;
                // heal back to max for reuse
                combatants.player.heal(999);
                combatants.opponent.heal(999);
            }]
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
            RoundEnd: [({ combatants }) => {
                if (combatants.player.health === combatants.player.maxHealth) success++;
                combatants.player.heal(999);
                combatants.opponent.heal(999);
            }]
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
            RoundEnd: [({ combatants }) => {
                expect(combatants.player.health).toBe(combatants.player.maxHealth);
            }]
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
            RoundEnd: [({ combatants }) => {
                expect(combatants.player.health).toBe(combatants.player.maxHealth); // evaded
                expect(combatants.opponent.health).toBe(combatants.opponent.maxHealth - 2); // mania doubles next attack
            }]
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
            RoundEnd: [({ combatants }) => {
                expect(combatants.player.getStatusLevel('mania')).toBe(0);
            }]
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
            RoundStart: [({ combatants }) => { combatants.opponent.takeDamage(combatants.opponent.maxHealth); }],
            RoundEnd: [({ combatants }) => { healAmountPrep = combatants.opponent.health; }]
        });
        await enginePrep.setupRound();
        await enginePrep.executeRound(idlePlan);
        
        // Normal heal
        const engineNorm = createBattleEngine(generateSampleOpponentAI(
            [PlanForNothing, PlanForNothing, planMove(heal), PlanForNothing, PlanForNothing]
        ), {maxHealth: 100}, {
            RoundStart: [({ combatants }) => { combatants.opponent.takeDamage(combatants.opponent.maxHealth); }],
            RoundEnd: [({ combatants }) => { healAmountNorm = combatants.opponent.health; }]
        });
        await engineNorm.setupRound();
        await engineNorm.executeRound(idlePlan);

        expect(healAmountPrep).toBeGreaterThan(healAmountNorm);
    });
});