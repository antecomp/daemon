import { SEQUENCE_LENGTH } from "../config/battle.config";
import { PLAYER_HEALTH_PLACEHOLDER } from "../config/battle.config";
import { BattleOutcome } from "../model/battle";
import { BattleReactions } from "../model/battleReactions";
import { Combatant } from "../model/combatant";
import { Move, DamageMultiplierContext, PreMoveContext, PostMoveContext } from "../model/move.types";
import { PlannedSequence } from "../model/plannedMove";
import { OpponentAI, OpponentAIBehaviorDeps, OpponentAIBehaviorPredicateArgs, OpponentStats } from "../ai/opponentAI.types";
import { calculateAndApplyDamage, getPhaseMultipliers, initializePlannedMoves, runMovePostEffect, runMovePreEffect } from "../utils/engine.utils";
import { makeSidesMap, oppositeSide, mapSides, Sides, forEachSide, buildSidesMap } from "../utils/sides.utils";
import { BattleEvent, BattleEventPayload } from "../model/battleReactions";

/** Engine dependencies (swappable handlers)
 * (f.e logger uses console for testing, but UI version can have a dedicated display handler.) */
export interface BattleEngineDependencies {
    logger: (message: string, tag?: string) => void;
}

const ENGINE_DEP_FALLBACK: BattleEngineDependencies = {
    logger: (message) => console.log(message)
}

/**
 * Creates and initializes a new battle engine instance for handling turn-based combat between a player and an AI opponent.
 *
 * @param opponentAI - The AI logic responsible for generating the opponent's move sequences and behaviors.
 * @param opponentStats - The statistics object describing the opponent's initial state (e.g., max health).
 * @param reactions - An object mapping battle events to arrays of asynchronous event handler functions.
 *                  - These 'reactions' fire (and block) at their associated battle stages and are provided information about battle state.
 *                  - Namely used to interweave animations into logic (@ref BattleEngineBridge)
 * @returns An object containing methods and properties to control the battle flow:
 *   - `executeRound(playerPlan: PlannedSequence): Promise<void>`: Executes a round using the player's planned sequence of moves.
 *   - `setupRound(): Promise<void>`: Prepares the next round, generating the opponent's plan and emitting relevant events.
 *   - `forceBattleResolve(): void`: Forces a battle end state with a given outcome (namely used for "Eject")
 *
 * @remarks
 * The engine manages combatants, move execution, event emission, and battle resolution. Consumers should call `setupRound` before each round and `executeRound` with the player's moves. The engine emits events at key points for UI updates or logging.
 */
export function createBattleEngine(opponentAI: OpponentAI, opponentStats: OpponentStats, reactions: BattleReactions, deps: BattleEngineDependencies = ENGINE_DEP_FALLBACK) {

    const combatants = makeSidesMap(new Combatant(PLAYER_HEALTH_PLACEHOLDER), new Combatant(opponentStats.maxHealth))
    let opponentPlan: PlannedSequence = [];

    async function emitBattleEvent<K extends BattleEvent>(event: K, payload: BattleEventPayload[K]) {
        await reactions[event]?.(payload);
    }

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
    }

    async function forceBattleResolve(outcome: BattleOutcome){
        await emitBattleEvent('BattleEnd', {outcome, combatants});
    };


    const opponentRanBehaviors = {
        preRound: new Set<string>(),
        postRound: new Set<string>()        
    }

    function handleOpponentBehaviors(
        stage: 'preRound' | 'postRound', 
        predicateArgs: OpponentAIBehaviorPredicateArgs, 
        runnerDeps: OpponentAIBehaviorDeps
    ) {
        const behaviors = opponentAI.behaviors?.[stage];
        if(!behaviors) return;
        behaviors.filter(behavior => (behavior.when === undefined) || behavior.when(predicateArgs)).forEach(behavior => {
            if(behavior.once) {
                if(opponentRanBehaviors[stage].has(behavior.key)) return;
                opponentRanBehaviors[stage].add(behavior.key);
            }
            behavior.run(runnerDeps);
        })
    }

    async function setupRound() {
        opponentPlan = opponentAI.getSequence(combatants.opponent, combatants.player);
        await emitBattleEvent('RoundPrepared', {combatants, opponentPlan});
    }

    async function executeRound(playerPlan: PlannedSequence) {

        const plans = makeSidesMap(playerPlan, opponentPlan);

        handleOpponentBehaviors('preRound', {combatants}, {combatants, engineDeps: deps});
        
        await emitBattleEvent('RoundStart', {plans, combatants});

        const sequences: Sides<Move[]> = {
            player: initializePlannedMoves(playerPlan, opponentPlan),
            opponent: initializePlannedMoves(opponentPlan, playerPlan)
        }

        if(sequences.player.length != SEQUENCE_LENGTH) throw new Error("Player Sequence of Wrong Size!");
        if(sequences.opponent.length != SEQUENCE_LENGTH) throw new Error("Opponent Sequence of Wrong Size!");
        
        for(let moveIndex = 0; moveIndex < SEQUENCE_LENGTH; moveIndex++) {

            const moves = mapSides(sequences, seq => seq[moveIndex]);

            await emitBattleEvent('MoveStart', {moveIndex, sequences, moves})

            const preCtxPair = buildSidesMap<PreMoveContext>(side => ({
                deps,
                emit(s) {
                    emitBattleEvent('MoveEmission', {
                        moveName: moves[side].name,
                        signal: s,
                        perspective: side
                    })
                },
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

            await emitBattleEvent('MultipliersComputed', {moveIndex, plannedSequences: plans,combatants, moves, damageMultipliers, preEffectOutcomes});

            const damagesDealt = calculateAndApplyDamage(combatants, damageMultipliers);

            // handleDeathIfNeeded returns true if there was a death. If so, we want to end all execution here.
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

        handleOpponentBehaviors('postRound', {combatants}, {combatants, engineDeps: deps});

        await emitBattleEvent('RoundEnd', {combatants});

    }

    return {
        /** Execute a round of the battle, given the players move sequence. Expects setupRound to have been run first. */
        executeRound, 
        /** Generates a new sequence for the opponent, emits round start signals (which can be listened to for setting dependant state) */
        setupRound, 
        /** Prematurely end a round with a provided resolution. Should only ever be executed when *not* in the middle of an execution. */
        forceBattleResolve
    }
}