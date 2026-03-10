import { SEQUENCE_LENGTH } from "../config/battle.config";
import { BattleOutcome } from "../model/battle";
import { BattleReactions, CombatantHistory } from "../model/battleReactions";
import { Combatant } from "../model/combatant";
import { Move, DamageMultiplierContext, PreMoveContext, PostMoveContext } from "../model/move.types";
import { PlannedSequence } from "../model/plannedMove";
import { OpponentAI, OpponentAIBehaviorDeps, OpponentAIBehaviorPredicateArgs } from "../ai/opponentAI.types";
import { CombatantInitStats } from "../model/combatant";
import { calculateAndApplyDamage, getPhaseMultipliers, initializePlannedMoves, runMovePostEffect, runMovePreEffect } from "../utils/engine.utils";
import { makeSidesMap, oppositeSide, mapSides, Sides, forEachSide, buildSidesMap } from "../utils/sides.utils";
import { BattleEvent, BattleEventPayload } from "../model/battleReactions";
import { DGDEV } from "@/devtools/dev";

/** Engine dependencies (swappable handlers)
 * (f.e logger uses console for testing, but UI version can have a dedicated display handler.) */
export interface BattleEngineDependencies {
    logger: (message: string, tag?: string) => void;
}

const ENGINE_DEP_FALLBACK: BattleEngineDependencies = {
    logger: (message) => DGDEV.log(message)
}

/**
 * Creates and initializes a new battle engine instance for handling turn-based combat between a player and an AI opponent.
 *
 * @param opponentAI - The AI logic responsible for generating the opponent's move sequences and behaviors.
 * @param opponentStats - The statistics object describing the opponent's initial state (e.g., max health).
 * @param playerStats - The statistics object describing the player's initial state (e.g., max health).
 * @param reactions - An object mapping battle events to arrays of asynchronous event handler functions.
 *                  - These 'reactions' fire (and block) at their associated battle stages and are provided information about battle state.
 *                  - Namely used to interweave animations into logic (@ref BattleEngineBridge)
 * @param deps - Injected Dependencies ({@link BattleEngineDependencies})for the battle engine. 
 * @returns An object containing methods and properties to control the battle flow:
 *   - `executeRound(playerPlan: PlannedSequence): Promise<void>`: Executes a round using the player's planned sequence of moves.
 *   - `setupRound(): Promise<void>`: Prepares the next round, generating the opponent's plan and emitting relevant events.
 *   - `forceBattleEnd(): void`: Forces a battle end state with a given outcome (namely used for "Eject")
 *
 * @remarks
 * The engine manages combatants, move execution, event emission, and battle resolution. Consumers should call `setupRound` before each round and `executeRound` with the player's moves. The engine emits events at key points for UI updates or logging.
 */
export function createBattleEngine(opponentAI: OpponentAI, opponentStats: CombatantInitStats, playerStats: CombatantInitStats, reactions: BattleReactions, deps: BattleEngineDependencies = ENGINE_DEP_FALLBACK) {

    const combatants = makeSidesMap(new Combatant(playerStats.maxHealth), new Combatant(opponentStats.maxHealth))
    let opponentPlan: PlannedSequence = [];

    async function emitBattleEvent<K extends BattleEvent>(event: K, payload: BattleEventPayload[K]) {
        await reactions[event]?.(payload);
    }

    // Checks if we've hit any game end state (deaths).
    // returns the corresponding outcome, or "null" if not applicable.
    function outcomeCheck() {
        const playerDead = combatants.player.isDead;
        const opponentDead = combatants.opponent.isDead;
        if (!playerDead && !opponentDead) return null;

        return playerDead
            ? (opponentDead ? BattleOutcome.Draw : BattleOutcome.OpponentVictory)
            : BattleOutcome.PlayerVictory;
    }

    // Also exists as it's own function for the Eject event.
    async function forceBattleEnd(outcome: BattleOutcome) {
        await emitBattleEvent('BattleForceEnd', { outcome });
    }

    // Used to track and enforce 'once' tag for opponent behaviors.
    const opponentRanBehaviors = {
        preRound: new Set<string>(),
        postRound: new Set<string>()
    }

    async function handleOpponentBehaviors(
        stage: 'preRound' | 'postRound',
        predicateArgs: OpponentAIBehaviorPredicateArgs,
        runnerDeps: OpponentAIBehaviorDeps
    ) {
        const behaviors = opponentAI.behaviors?.[stage];
        if (!behaviors) return;

        for(const behavior of behaviors.filter(behavior => behavior.when === undefined || behavior.when(predicateArgs))) {
            if(behavior.once) {
                if (opponentRanBehaviors[stage].has(behavior.key)) continue;
                opponentRanBehaviors[stage].add(behavior.key);
            }
            await behavior.run(runnerDeps);
        }

        // Consider adding an event here.
    }

    async function setupRound() {
        opponentPlan = opponentAI.getSequence(combatants.opponent, combatants.player);
        await emitBattleEvent('RoundPrepared', { combatants, opponentPlan });
    }

    async function executeRound(playerPlan: PlannedSequence) {

        const plans = makeSidesMap(playerPlan, opponentPlan);

        // Consider *not* having an await here, things like the UIState rely on RoundStart running immediately on execute.
        // That or implement the opponent behavior event to give us an entry point for handling it.
        await handleOpponentBehaviors('preRound', { combatants }, { combatants, engineDeps: deps });

        await emitBattleEvent('RoundStart', { plans, combatants });

        const sequences: Sides<Move[]> = {
            player: initializePlannedMoves(playerPlan, opponentPlan),
            opponent: initializePlannedMoves(opponentPlan, playerPlan)
        }

        if (sequences.player.length != SEQUENCE_LENGTH) throw new Error("Player Sequence of Wrong Size!");
        if (sequences.opponent.length != SEQUENCE_LENGTH) throw new Error("Opponent Sequence of Wrong Size!");

        for (let moveIndex = 0; moveIndex < SEQUENCE_LENGTH; moveIndex++) {

            const moves = mapSides(sequences, seq => seq[moveIndex]);
            const plannedMoves = mapSides(plans, plan => plan[moveIndex]);
            const combatantHistory = {} as CombatantHistory;

            await emitBattleEvent('MoveStart', { moveIndex, sequences, moves, plans, combatants })
            combatantHistory.MoveStart = mapSides(combatants, s => s.snapshot());

            const preCtxPair = buildSidesMap<PreMoveContext>(side => ({
                deps,
                self: combatants[side],
                them: combatants[oppositeSide(side)],
                moves: {
                    ours: moves[side],
                    theirs: moves[oppositeSide(side)]
                }
            }));

            const preEffectOutcomes = mapSides(moves, (move, side) => runMovePreEffect(move, preCtxPair[side]))

            await emitBattleEvent("PreEffectResolved", { preEffectOutcomes, combatants });
            combatantHistory.PreEffectResolved = mapSides(combatants, s => s.snapshot());

            const mulCtx = mapSides<PreMoveContext, DamageMultiplierContext>(preCtxPair, (preCtx, side) => ({ ...preCtx, preEffectOutcome: preEffectOutcomes[side] }));

            const damageMultipliers = mapSides(moves, (_m, side) => getPhaseMultipliers(moves[side], mulCtx[side]));

            await emitBattleEvent('MultipliersComputed', { moveIndex, plannedSequences: plans, combatants, moves, damageMultipliers, preEffectOutcomes });
            combatantHistory.MultipliersComputed = mapSides(combatants, s => s.snapshot());

            const damagesDealt = calculateAndApplyDamage(combatants, damageMultipliers);

            const postCtx = buildSidesMap<PostMoveContext>((side) => ({
                ...mulCtx[side],
                ourMults: damageMultipliers[side],
                theirMults: damageMultipliers[oppositeSide(side)],
                damageDealt: damagesDealt[side],
                damageTaken: damagesDealt[oppositeSide(side)],
            }));

            // death check and run.
            const outcome = outcomeCheck();
            if (outcome !== null) {
                combatantHistory.DamagesApplied = mapSides(combatants, s => s.snapshot());
                combatantHistory.MoveEnd = mapSides(combatants, s => s.snapshot());
                await emitBattleEvent('BattleEnd', { outcome, combatants, postCtx, postEffectOutcomes: makeSidesMap(undefined, undefined), moves, plannedMoves, combatantHistory });
                return;
            }

            await emitBattleEvent('DamagesApplied', { combatants, damagesDealt });
            combatantHistory.DamagesApplied = mapSides(combatants, s => s.snapshot());

            forEachSide(combatants, (combatant) => combatant.tickStatuses())

            const postEffectOutcomes = mapSides(moves, (_m, side) => runMovePostEffect(moves[side], postCtx[side]));

            await emitBattleEvent('PostEffectResolved', { postEffectOutcomes, combatants });
            combatantHistory.PostEffectResolved = mapSides(combatants, s => s.snapshot());

            forEachSide(combatants, (combatant) => combatant.reapExpiredStatuses());

            combatantHistory.MoveEnd = mapSides(combatants, s => s.snapshot());
            await emitBattleEvent('MoveEnd', { combatants, postCtx, postEffectOutcomes, moves, plannedMoves, combatantHistory });
        }

        await handleOpponentBehaviors('postRound', { combatants }, { combatants, engineDeps: deps });

        await emitBattleEvent('RoundEnd', { combatants });

    }

    return {
        /** Execute a round of the battle, given the players move sequence. Expects setupRound to have been run first. */
        executeRound,
        /** Generates a new sequence for the opponent, emits round start signals (which can be listened to for setting dependant state) */
        setupRound,
        /** Prematurely end a round with a provided resolution. Should only ever be executed when *not* in the middle of an execution. */
        forceBattleEnd
    }
}
