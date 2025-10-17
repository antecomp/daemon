import { SEQUENCE_LENGTH } from "../config/battle.config";
import { PLAYER_HEALTH_PLACEHOLDER } from "../config/battle.config";
import { BattleOutcome } from "../model/battle";
import { BattleReactions } from "../events/battleEvent.types";
import { Combatant } from "../model/combatant";
import { Move, DamageMultiplierContext, PreMoveContext, PostMoveContext } from "../model/move";
import { PlannedSequence } from "../model/plannedmove";
import { OpponentAI, OpponentStats } from "../ai/opponentAI.types";
import { calculateAndApplyDamage, getPhaseMultipliers, initializePlannedMoves, runMovePostEffect, runMovePreEffect } from "../utils/engine.utils";
import { makeSidesMap, oppositeSide, mapSides, Sides, forEachSide, buildSidesMap } from "../utils/sides.utils";
import { BattleEvent, BattleEventPayload } from "../events/battleEvent.types";


/**
 * Creates and initializes a new battle engine instance for handling turn-based combat between a player and an AI opponent.
 *
 * @param opponentAI - The AI logic responsible for generating the opponent's move sequences and behaviors.
 * @param opponentStats - The statistics object describing the opponent's initial state (e.g., max health).
 * @param reactions - An object mapping battle events to arrays of asynchronous event handler functions.
 *                  - These 'reactions' fire (and block) at their associated battle stages and are provided information about battle state.
 * @returns An object containing methods and properties to control the battle flow:
 *   - `executeRound(playerPlan: PlannedSequence): Promise<void>`: Executes a round using the player's planned sequence of moves.
 *   - `setupRound(): Promise<void>`: Prepares the next round, generating the opponent's plan and emitting relevant events.
 *   - `battleResolutionPromise: Promise<BattleOutcome>`: A promise that resolves with the outcome of the battle when it ends.
 *   - `forceBattleResolve(outcome: BattleOutcome): Promise<void>`: Immediately ends the battle with the specified outcome.
 *
 * @remarks
 * The engine manages combatants, move execution, event emission, and battle resolution. Consumers should call `setupRound` before each round and `executeRound` with the player's moves. The engine emits events at key points for UI updates or logging.
 */
export function createBattleEngine(opponentAI: OpponentAI, opponentStats: OpponentStats, reactions: BattleReactions, /* deps? */) {

    async function emitBattleEvent<K extends BattleEvent>(event: K, payload: BattleEventPayload[K]) {
        await reactions[event]?.(payload);
    }

    const combatants = makeSidesMap(new Combatant(PLAYER_HEALTH_PLACEHOLDER), new Combatant(opponentStats.maxHealth))

    let opponentPlan: PlannedSequence = [];

    const {promise: battleResolutionPromise, resolve: resolveBattle} = Promise.withResolvers<BattleOutcome>();
    
    const forceBattleResolve = async (outcome: BattleOutcome) => {
        await emitBattleEvent('BattleEnd', {outcome, combatants});
        resolveBattle(outcome);
    };

    // This function feels gross, I think it could be improved.
    function handleDeathIfNeeded(): boolean {
        let outcome: BattleOutcome | null = null;

        const deathStatuses = mapSides(combatants, x => x.isDead);
        switch (true) {
            case deathStatuses.player && deathStatuses.opponent:
                outcome = BattleOutcome.Draw;
                break;
            case deathStatuses.player:
                outcome = BattleOutcome.OpponentVictory;
                break;
            case deathStatuses.opponent:
                outcome = BattleOutcome.PlayerVictory;
                break;
        }

        if (outcome == null) return false;

        handleBattleEnd(outcome); 
        return true; // bool check used to breask loop in executeRound.
    }

    async function handleBattleEnd(outcome: BattleOutcome) {
        await emitBattleEvent('BattleEnd', {outcome, combatants});
        resolveBattle(outcome);
    }

    async function setupRound() {
        opponentPlan = opponentAI.getSequence(combatants.opponent, combatants.player);
        await emitBattleEvent('RoundPrepared', {combatants, opponentPlan});
    }

    async function executeRound(playerPlan: PlannedSequence) {

        const plans = makeSidesMap(playerPlan, opponentPlan);

        await emitBattleEvent('RoundStart', {plans, combatants});

        const sequences: Sides<Move[]> = {
            player: initializePlannedMoves(playerPlan, opponentPlan),
            opponent: initializePlannedMoves(opponentPlan, playerPlan)
        }

        if(sequences.player.length != SEQUENCE_LENGTH) throw new Error("Player Sequence of Wrong Size!");
        if(sequences.opponent.length != SEQUENCE_LENGTH) throw new Error("Opponent Sequence of Wrong Size!");

        opponentAI.preRoundBehavior?.(combatants.opponent, combatants.player);
        
        for(let moveIndex = 0; moveIndex < SEQUENCE_LENGTH; moveIndex++) {

            const moves = mapSides(sequences, seq => seq[moveIndex]);

            await emitBattleEvent('MoveStart', {moveIndex, sequences, moves})

            const preCtxPair = buildSidesMap<PreMoveContext>(side => ({
                self: combatants[side],
                them: combatants[oppositeSide(side)],
                moves: {
                    ours: moves[side],
                    theirs: moves[oppositeSide(side)]
                }
            }));

            const preEffectOutcomes = mapSides(moves, (move, side) => runMovePreEffect(move, preCtxPair[side]))

            await emitBattleEvent("PreEffectResolved", {preEffectOutcomes, combatants});

            const mulCtx = mapSides<PreMoveContext, DamageMultiplierContext>(preCtxPair, (preCtx, side) => ({ ...preCtx, preEffectOutcome: preEffectOutcomes[side] }));
            
            const damageMultipliers = mapSides(moves, (_m, side) => getPhaseMultipliers(moves[side], mulCtx[side]));

            await emitBattleEvent('MultipliersComputed', {combatants, moves, damageMultipliers, preEffectOutcomes, plannedMoves: mapSides(plans, plan => plan[moveIndex])});

            const damagesDealt = calculateAndApplyDamage(combatants, damageMultipliers);

            if (handleDeathIfNeeded()) return;

            await emitBattleEvent('DamagesApplied', {combatants, damagesDealt})

            const postCtx = buildSidesMap<PostMoveContext>((side) => ({
                ...mulCtx[side],
                ourMults: damageMultipliers[side],
                theirMults: damageMultipliers[oppositeSide(side)],
                damageDealt: damagesDealt[side],
                damageTaken: damagesDealt[oppositeSide(side)],
            }));

            forEachSide(combatants, (combatant) => combatant.tickStatuses())

            const postEffectOutcomes = mapSides(moves, (_m, side) => runMovePostEffect(moves[side], postCtx[side]));

            await emitBattleEvent('PostEffectResolved', {postEffectOutcomes, combatants});

            forEachSide(combatants, (combatant) => combatant.reapExpiredStatuses());

            await emitBattleEvent('MoveEnd', {combatants});
        }

        opponentAI.postRoundBehavior?.(combatants.opponent, combatants.player);

        await emitBattleEvent('RoundEnd', {combatants});

    }

    return {
        executeRound, setupRound, battleResolutionPromise, forceBattleResolve
    }
}