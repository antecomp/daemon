import { PLAYER_HEALTH_PLACEHOLDER } from "@/core/battlenew/config/placeholders";
import { attack, nothingMove } from "@/core/battlenew/data/basemoves";
import { createBattleEngine } from "@/core/battlenew/engine/battleEngine";
import { BattleReactions } from "@/core/battlenew/types/battleReactions.types";
import { Combatant } from "@/core/battlenew/types/combatant";
import { PlannedMove, PlannedSequence } from "@/core/battlenew/types/move";
import { OpponentAI, OpponentStats } from "@/core/battlenew/types/opponentProfile";
import { describe, it, expect, vi, test } from "vitest";

const NothingMove: PlannedMove = {
    name: 'nothing',
    instantiate: () => nothingMove
}

const idlePlan: PlannedSequence = [NothingMove, NothingMove, NothingMove, NothingMove, NothingMove]

const AttackMovePlan: PlannedMove = {
    name: 'attack',
    instantiate: () => attack
}

function generateSampleOpponentAI(plan?: PlannedMove[]): OpponentAI {
    return {
        getSequence: (_me, _player) => plan ?? [NothingMove, NothingMove, NothingMove, NothingMove, NothingMove]
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

        engine.executeRound([NothingMove, NothingMove, NothingMove, NothingMove, NothingMove])
        expect(execReaction).toHaveBeenCalled();
    })
})

describe("Sequence Eval basics", () => {
    test("Attack damage dealt", async () => {
        const reactions: BattleReactions = {
            RoundEnd: [({combatants}) => {expect(combatants.player.health).toBe(9)}]
        }
        
        const engine = createBattleEngine(generateSampleOpponentAI([AttackMovePlan, NothingMove, NothingMove, NothingMove, NothingMove]), SAMPLE_OPPONENT_STATS, reactions);
        engine.setupRound();
        await engine.executeRound(idlePlan);
    })
})