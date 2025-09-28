import { PLAYER_HEALTH_PLACEHOLDER } from "@/core/battlenew/config/battle.config";
import { attack, nothingMove } from "@/core/battlenew/moves/moves";
import { PlanForRepeat } from "@/core/battlenew/moves/plannedMoves";
import { createBattleEngine } from "@/core/battlenew/engine/battleEngine";
import { BattleReactions } from "@/core/battlenew/events/battleEvent.types";
import { Combatant } from "@/core/battlenew/model/combatant";
import { PlannedMove, PlannedSequence } from "@/core/battlenew/model/move";
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

        const engine = createBattleEngine(generateSampleOpponentAI([PlanForAttack, PlanForRepeat, PlanForNothing, PlanForNothing, PlanForNothing]), SAMPLE_OPPONENT_STATS, reactions);
        engine.setupRound();
        await engine.executeRound(idlePlan);
    })
})