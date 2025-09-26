//export function createBattleEngine(opponentAI, reactionmap, deps);

import { SEQUENCE_LENGTH } from "../config/battle.config";
import { PLAYER_HEALTH_PLACEHOLDER } from "../config/placeholders";
import { BattleOutcome } from "../types/battle.types";
import { Combatant } from "../types/combatant";
import { Move, DamageMultiplierContext, PlannedSequence, PreMoveContext, PostMoveContext } from "../types/move";
import { OpponentAI, OpponentStats } from "../types/opponentProfile";
import { calculateAndApplyDamage, getPhaseMultipliers, initializePlannedMoves, runMovePostEffect, runMovePreEffect } from "../utils/battleUtils";


const side = ['player', 'opponent'] as const;
type Side = typeof side[number];
// Change this name to be more specific!
export type Sides<T> = Record<Side, T>
const oppositeSide = (r: Side): Side => (r == 'player' ? 'opponent' : 'player');

function mapSides<Input, Output>(pair: Sides<Input>, mapper: (value: Input, role: Side, whole: Sides<Input>) => Output): Sides<Output> {
    return {
        player: mapper(pair.player, 'player', pair),
        opponent: mapper(pair.opponent, 'opponent', pair),
    };
}

function forEachSide<T>(pair: Sides<T>, action: ((value: T, roll: Side) => void)) {
    for(const [role, entry] of Object.entries(pair)) {
        action(entry, role as Side);
    }
}

function makeSidesMap<T>(player: T, opponent: T): Sides<T> { return { player, opponent } }

const buildSidesMap = <T>(builder: (role: Side) => T): Sides<T> => ({
    player: builder('player'),
    opponent: builder('opponent'),
});





// need hook for like useUIBattleEngine or some better name, that runs the above but 
// injects all the Solid/Anim shit into reactionmap that we want, configires the UI,
// uses opponentProfile instead of opponentAI. opponentProfile used to configure UI shit beforehand
// configured UI handlers are *then* passed as part of the reactionmap
// hook should probably be in features rather than here? idk it's still just a "hook" no components.
// up to u

export function createBattleEngine(opponentAI: OpponentAI, opponentStats: OpponentStats, /* reactionmap, deps */) {
    const combatants = makeSidesMap(new Combatant(PLAYER_HEALTH_PLACEHOLDER), new Combatant(opponentStats.maxHealth))
    
    // naming convention of DynamicMoves are uninstantiated "plans"
    // whereas the evaluated version is a "sequence"
    let opponentPlan: PlannedSequence = [];

    const {promise: battleResolutionPromise, resolve: resolveBattle} = Promise.withResolvers<BattleOutcome>();
    
    // do we need this?
    const forceBattleResolve = (outcome: BattleOutcome) => resolveBattle(outcome);

    // This feels fucking stupid and I hate it
    function handleDeathIfNeeded(): boolean {
        let outcome: BattleOutcome | null = null;

        // Is there a cleaner way of doing this?
        const deathStatuses = mapSides(combatants, x => x.isDead);
        if(deathStatuses.player) outcome = BattleOutcome.OpponentVictory;
        if(deathStatuses.opponent) outcome = BattleOutcome.PlayerVictory
        if(deathStatuses.player && deathStatuses.opponent) outcome = BattleOutcome.Draw;

        if (!outcome) return false;

        handleBattleEnd(outcome); 
        return true;
    }

    // anticipates use of another helper getOutcome(ctx) => BattleOutcome | false. If there's an outcome we hand
    // off to this to do cleanup, set stages. Otherwise we just continue execution loop.
    async function handleBattleEnd(outcome: BattleOutcome) {
        // await reaction handlers (death animations and whatnot)
        resolveBattle(outcome);
    }

    async function setupRound() {
        opponentPlan = opponentAI.getSequence(combatants.opponent, combatants.player);
        // await reaction handlers for setup here.
    }

    async function executeRound(playerPlan: PlannedSequence) {

        // await reaction handlers for pre-round

        // Alternatively use makeSidesMap; but I am making it by hand for readability;
        const sequences: Sides<Move[]> = {
            player: initializePlannedMoves(playerPlan, opponentPlan),
            opponent: initializePlannedMoves(opponentPlan, playerPlan)
        }

        if(sequences.player.length != SEQUENCE_LENGTH) throw new Error("Player Sequence of Wrong Size!");
        if(sequences.opponent.length != SEQUENCE_LENGTH) throw new Error("Opponent Sequence of Wrong Size!");

        opponentAI.preRoundBehavior?.(combatants.opponent, combatants.player);
        
        for(let moveIndex = 0; moveIndex < SEQUENCE_LENGTH; moveIndex++) {
            // BP: await reaction handlers for move start

            const moves = mapSides(sequences, seq => seq[moveIndex]);

            const preCtxPair = buildSidesMap<PreMoveContext>(role => ({
                self: combatants[role],
                opponent: combatants[oppositeSide(role)],
                sequence: sequences[role]
            }));

            const preEffectOutcomes = mapSides(moves, (move, role) => runMovePreEffect(move, preCtxPair[role]))

            // BP? Prob not, (considering I b4 bundled this all into one function before any events)

            const mulCtx = mapSides<PreMoveContext, DamageMultiplierContext>(preCtxPair, (preCtx, role) => ({ ...preCtx, preEffectOutcome: preEffectOutcomes[role] }));
            
            const multipliers = mapSides(moves, (_m, role) => getPhaseMultipliers(moves[role], mulCtx[role]));

            // BP - display multipliers

            // Change this to just take the combatants object.
            const damagesDealt = calculateAndApplyDamage(combatants.player, combatants.opponent, multipliers);

            if (handleDeathIfNeeded()) return;

            const postCtx = buildSidesMap<PostMoveContext>((role) => ({
                ...mulCtx[role],
                ourMults: multipliers[role],
                theirMults: multipliers[oppositeSide(role)],
                damageDealt: damagesDealt[role],
                damageTaken: damagesDealt[oppositeSide(role)],
            }));

            forEachSide(combatants, (combatant) => combatant.tickStatuses())

            // Can add new statuses with duration 1, or extend statuses here.
            const postOut = mapSides(moves, (_m, role) => runMovePostEffect(moves[role], postCtx[role]));
            // will be handed to BP later.

            // BP - post effect results.
            
            forEachSide(combatants, (combatants) => combatants.reapExpiredStatuses());
        }

        opponentAI.postRoundBehavior?.(combatants.opponent, combatants.player);
    }

    return {
        executeRound, setupRound, battleResolutionPromise, forceBattleResolve
    }
}