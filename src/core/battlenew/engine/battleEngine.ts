//export function createBattleEngine(opponentAI, reactionmap, deps);

import { SEQUENCE_LENGTH } from "../config/battle.config";
import { PLAYER_HEALTH_PLACEHOLDER } from "../config/placeholders";
import { BattleOutcome } from "../types/battle.types";
import { BattleReactions } from "../types/battleReactions.types";
import { Combatant } from "../types/combatant";
import { Move, DamageMultiplierContext, PlannedSequence, PreMoveContext, PostMoveContext } from "../types/move";
import { OpponentAI, OpponentStats } from "../types/opponentProfile";
import { calculateAndApplyDamage, getPhaseMultipliers, initializePlannedMoves, runMovePostEffect, runMovePreEffect } from "../utils/battleUtils";
import { makeSidesMap, oppositeSide, mapSides, Sides, forEachSide, buildSidesMap } from "../utils/sideUtils";
import { BattleEvent, BattleEventPayload } from "../types/battleReactions.types";

export function createBattleEngine(opponentAI: OpponentAI, opponentStats: OpponentStats, reactions: BattleReactions, /* deps? */) {

    async function emitBattleEvent<K extends BattleEvent>(event: K, payload: BattleEventPayload[K]) {
        for (const handler of reactions?.[event] ?? []) {
            await handler(payload);
        }
    }

    const combatants = makeSidesMap(new Combatant(PLAYER_HEALTH_PLACEHOLDER), new Combatant(opponentStats.maxHealth))

    let opponentPlan: PlannedSequence = [];

    const {promise: battleResolutionPromise, resolve: resolveBattle} = Promise.withResolvers<BattleOutcome>();
    
    // Will need to notify own breakpoints
    const forceBattleResolve = async (outcome: BattleOutcome) => {
        await emitBattleEvent('BattleEnd', {outcome});
        resolveBattle(outcome);
    };

    // This function feels gross, I think it could be improved.
    function handleDeathIfNeeded(): boolean {
        let outcome: BattleOutcome | null = null;

        // Is there a cleaner way of doing this?
        const deathStatuses = mapSides(combatants, x => x.isDead);
        if(deathStatuses.player) outcome = BattleOutcome.OpponentVictory;
        if(deathStatuses.opponent) outcome = BattleOutcome.PlayerVictory
        if(deathStatuses.player && deathStatuses.opponent) outcome = BattleOutcome.Draw;

        if (!outcome) return false;

        handleBattleEnd(outcome); 
        return true; // bool check used to breask loop in executeRound.
    }

    async function handleBattleEnd(outcome: BattleOutcome) {
        await emitBattleEvent('BattleEnd', {outcome});
        resolveBattle(outcome);
    }

    async function setupRound() {
        opponentPlan = opponentAI.getSequence(combatants.opponent, combatants.player);
        await emitBattleEvent('RoundPrepared', {combatants, opponentPlan});
    }

    async function executeRound(playerPlan: PlannedSequence) {

        await emitBattleEvent('RoundStart', {plans: makeSidesMap(playerPlan, opponentPlan), combatants});

        // Alternatively use makeSidesMap; but I am making it by hand for readability;
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
                opponent: combatants[oppositeSide(side)],
                moves
                //sequence: sequences[side]
            }));

            const preEffectOutcomes = mapSides(moves, (move, side) => runMovePreEffect(move, preCtxPair[side]))

            // event here needed for certain indicators that were previously done just by effects running cbs (i.e status message)
            await emitBattleEvent("PreEffectResolved", {preEffectOutcomes});

            const mulCtx = mapSides<PreMoveContext, DamageMultiplierContext>(preCtxPair, (preCtx, side) => ({ ...preCtx, preEffectOutcome: preEffectOutcomes[side] }));
            
            const damageMultipliers = mapSides(moves, (_m, side) => getPhaseMultipliers(moves[side], mulCtx[side]));

            await emitBattleEvent('MultipliersComputed', {damageMultipliers});

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

            // Can add new statuses with duration 1, or extend statuses here.
            const postEffectOutcomes = mapSides(moves, (_m, side) => runMovePostEffect(moves[side], postCtx[side]));

            await emitBattleEvent('PostEffectResolved', {postEffectOutcomes});

            forEachSide(combatants, (combatant) => combatant.reapExpiredStatuses());

            await emitBattleEvent('MoveEnd', {});
        }

        opponentAI.postRoundBehavior?.(combatants.opponent, combatants.player);

        console.log(combatants.player.health);
        await emitBattleEvent('RoundEnd', {combatants});

        // make calling the setup again the responsibility of engine user!
    }

    return {
        executeRound, setupRound, battleResolutionPromise, forceBattleResolve
    }
}