import { OpponentAI, CombatantInitStats } from "@/core/battle/ai/opponentAI.types";
import { createBattleEngine } from "@/core/battle/engine/battleEngine";
import { PlannedMove, PlannedSequence } from "@/core/battle/model/plannedMove";
import { COMMON_PLANNED_MOVES as PLN } from "@/core/battle/moves/plannedMoves";
import { describe, expect, test } from "vitest";

const IDLE = PLN.idle;
const idlePlan: PlannedSequence = Array.from({length: 5}, () => IDLE);

function generateSampleOpponentAI(plan?: PlannedMove[]): OpponentAI {
    return { getSequence: (_me, _player) => plan ?? idlePlan }
}

const SAMPLE_OPPONENT_STATS: CombatantInitStats = {maxHealth: 100}
const SAMPLE_PLAYER_STATS: CombatantInitStats = {maxHealth: 10}

describe("Observe Tests", () => {
    test("Basic: Observe Applies Vulnerability to Player", async () => {
        const engine = createBattleEngine(
            generateSampleOpponentAI([PLN.idle, PLN.idle, PLN.idle, PLN.idle, PLN.observe]),
            SAMPLE_OPPONENT_STATS,
            SAMPLE_PLAYER_STATS,
            {
                RoundEnd({combatants: {player, opponent}}) {
                    expect(player.getStatusLevel('vulnerable')).toBe(1);
                    expect(opponent.getStatusLevel('vulnerable')).toBe(0);
                }
            }
        );

        engine.setupRound();
        await engine.executeRound(idlePlan);
    });

    test("Basic: Observe Applies Vulnerability to Opponent", async () => {
        const engine = createBattleEngine(
            generateSampleOpponentAI(),
            SAMPLE_OPPONENT_STATS,
            SAMPLE_PLAYER_STATS,
            {
                RoundEnd({combatants: {player, opponent}}) {
                    expect(player.getStatusLevel('vulnerable')).toBe(0);
                    expect(opponent.getStatusLevel('vulnerable')).toBe(1);                    
                }
            }
        );

        engine.setupRound();
        await engine.executeRound([IDLE, IDLE, IDLE, IDLE, PLN.observe]);
    });

    test("Observe works with mirror", async () => {
        const engine = createBattleEngine(
            generateSampleOpponentAI([IDLE, IDLE, IDLE, IDLE, PLN.observe]),
            SAMPLE_OPPONENT_STATS,
            SAMPLE_PLAYER_STATS,
            {
                RoundEnd({combatants: {player, opponent}}) {
                    expect(player.getStatusLevel('vulnerable')).toBe(1);
                    expect(opponent.getStatusLevel('vulnerable')).toBe(1);                    
                }
            }
        );

        engine.setupRound();
        await engine.executeRound([IDLE, IDLE, IDLE, IDLE, PLN.mirror]);
    });

    test("Observe on vulnerable opponent stacks into next clash.", async () => {
        {
            const engine = createBattleEngine(
            generateSampleOpponentAI([IDLE, IDLE, IDLE, IDLE, PLN.prepare]),
                SAMPLE_OPPONENT_STATS,
            SAMPLE_PLAYER_STATS,
            {
                    RoundEnd({combatants: {player, opponent}}) {
                        expect(player.getStatusLevel('vulnerable')).toBe(0);
                        expect(opponent.getStatusLevel('vulnerable')).toBe(2);                    
                    }
                }
            );
            engine.setupRound();
            await engine.executeRound([IDLE, IDLE, IDLE, IDLE, PLN.observe]);
        }

        {
            const engine = createBattleEngine(
            generateSampleOpponentAI([IDLE, IDLE, IDLE, IDLE, PLN.observe]),
                SAMPLE_OPPONENT_STATS,
            SAMPLE_PLAYER_STATS,
            {
                    RoundEnd({combatants: {player, opponent}}) {
                        expect(player.getStatusLevel('vulnerable')).toBe(2);
                        expect(opponent.getStatusLevel('vulnerable')).toBe(0);                    
                    }
                }
            );
            engine.setupRound();
            await engine.executeRound([IDLE, IDLE, IDLE, IDLE, PLN.heal]);            
        }
    });

    test("Observe repeat works (stacks)", async () => {
        const engine = createBattleEngine(
            generateSampleOpponentAI(),
            SAMPLE_OPPONENT_STATS,
            SAMPLE_PLAYER_STATS,
            {
                RoundEnd({combatants: {player, opponent}}) {
                    expect(player.getStatusLevel('vulnerable')).toBe(0);
                    expect(opponent.getStatusLevel('vulnerable')).toBe(2);                    
                }
            }
        );

        engine.setupRound();
        await engine.executeRound([IDLE, IDLE, IDLE, PLN.observe, PLN.repeat]);
    });
});