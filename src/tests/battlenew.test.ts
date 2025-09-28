import { PLAYER_HEALTH_PLACEHOLDER } from "@/core/battlenew/config/battle.config";
import { attack, defend, heal, nothingMove, prepare } from "@/core/battlenew/moves/moves";
import { planMove, repeatPlan } from "@/core/battlenew/moves/plannedMoves";
import { createBattleEngine } from "@/core/battlenew/engine/battleEngine";
import { BattleReactions } from "@/core/battlenew/events/battleEvent.types";
import { Combatant } from "@/core/battlenew/model/combatant";
import { PlannedSequence } from "@/core/battlenew/model/plannedmove";
import { PlannedMove } from "@/core/battlenew/model/plannedmove";
import { OpponentAI, OpponentStats } from "@/core/battlenew/ai/opponentAI.types";
import { describe, it, expect, vi, test } from "vitest";

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
    })
})