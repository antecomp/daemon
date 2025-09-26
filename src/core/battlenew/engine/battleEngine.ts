//export function createBattleEngine(opponentAI, reactionmap, deps);

import { SEQUENCE_LENGTH } from "../config/battle.config";
import { PLAYER_HEALTH_PLACEHOLDER } from "../config/placeholders";
import { BattleOutcome, DamageMultipliers } from "../types/battle.types";
import { Combatant } from "../types/combatant";
import { EffectOutcome, Move, DamageMultiplierContext, PlannedSequence, PreMoveContext, PostMoveContext } from "../types/move";
import { OpponentAI, OpponentStats } from "../types/opponentProfile";
import { calculateAndApplyDamage, getPhaseMultipliers, initializePlannedMoves, runMovePostEffect, runMovePreEffect } from "../utils/battleUtils";



// need hook for like useUIBattleEngine or some better name, that runs the above but 
// injects all the Solid/Anim shit into reactionmap that we want, configires the UI,
// uses opponentProfile instead of opponentAI. opponentProfile used to configure UI shit beforehand
// configured UI handlers are *then* passed as part of the reactionmap
// hook should probably be in features rather than here? idk it's still just a "hook" no components.
// up to u

export function createBattleEngine(opponentAI: OpponentAI, opponentStats: OpponentStats, /* reactionmap, deps */) {
    const player = new Combatant(PLAYER_HEALTH_PLACEHOLDER);
    const opponent = new Combatant(opponentStats.maxHealth);
    
    // naming convention of DynamicMoves are uninstantiated "plans"
    // whereas the evaluated version is a "sequence"
    let opponentPlan: PlannedSequence = [];

    const {promise: battleResolutionPromise, resolve: resolveBattle} = Promise.withResolvers<BattleOutcome>();
    
    // do we need this?
    const forceBattleResolve = (outcome: BattleOutcome) => resolveBattle(outcome);

    // This feels fucking stupid and I hate it
    function handleDeathIfNeeded(): boolean {
        let outcome: BattleOutcome | null = null;
        // nice just overwriting shit. Come up with something more elegant, this is geniunely embarassing. Dont code after studying for 6 hours to """"relax"""""
        if(player.isDead) outcome = BattleOutcome.OpponentVictory;
        if(opponent.isDead) outcome = BattleOutcome.PlayerVictory;
        if(player.isDead && opponent.isDead) outcome = BattleOutcome.Draw;
        
        if(outcome == null) return false;

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
        opponentPlan = opponentAI.getSequence(opponent, player);
        // await reaction handlers for setup here.
    }

    async function executeRound(playerPlan: PlannedSequence) {

        const roles = ['player', 'opponent'] as const;
        type Role = typeof roles[number];
        type RoleMap<T> = Record<Role, T>

        // await reaction handlers for pre-round

        const playerSequence = initializePlannedMoves(playerPlan, opponentPlan);
        const opponentSequence = initializePlannedMoves(opponentPlan, playerPlan);

        if(playerSequence.length != SEQUENCE_LENGTH) throw new Error("Player Sequence of Wrong Size!");
        if(opponentSequence.length != SEQUENCE_LENGTH) throw new Error("Opponent Sequence of Wrong Size!");

        opponentAI.preRoundBehavior?.(opponent, player);
        
        for(let moveIndex = 0; moveIndex < SEQUENCE_LENGTH; moveIndex++) {
            // BP: await reaction handlers for move start

            const moves = { player: playerSequence[moveIndex], opponent: opponentSequence[moveIndex] } as RoleMap<Move>;

            const preMoveContexts = {
                player: { self: player, opponent, sequence: playerSequence },
                opponent: { self: opponent, opponent: player, sequence: opponentSequence },
            } as RoleMap<PreMoveContext>;

            const preEffectOutcomes = Object.fromEntries(
                roles.map(role => [role, runMovePreEffect(moves[role], preMoveContexts[role])])
            ) as RoleMap<EffectOutcome | undefined>;

            // BP? Prob not, (considering I b4 bundled this all into one function before any events)

            const damageMultiplierContexts = Object.fromEntries(
                roles.map(r => [r, { ...preMoveContexts[r], preEffectOutcome: preEffectOutcomes[r] }])
            ) as RoleMap<DamageMultiplierContext>;

            const multipliers = Object.fromEntries(
                roles.map(r => [r, getPhaseMultipliers(moves[r], damageMultiplierContexts[r])])
            ) as RoleMap<DamageMultipliers>

            // BP - display multipliers

            const damagesDealt = calculateAndApplyDamage(player, opponent, multipliers);

            if (handleDeathIfNeeded()) return;

            // idk how to do the flip-floppy with maps. Maybe there's something better to do here.
            const postMoveContexts = {
                opponent: {
                    ...damageMultiplierContexts.opponent,
                    ourMults: multipliers.opponent,
                    theirMults: multipliers.player,
                    damageDealt: damagesDealt.opponent,
                    damageTaken: damagesDealt.player
                },
                player: {
                    ...damageMultiplierContexts.player,
                    ourMults: multipliers.player,
                    theirMults: multipliers.opponent,
                    damageDealt: damagesDealt.player,
                    damageTaken: damagesDealt.opponent
                }
            } as RoleMap<PostMoveContext>

            player.tickStatuses();
            opponent.tickStatuses();

            // Can add new statuses with duration 1, or extend statuses here.
            const postEffectOutcomes = Object.fromEntries(
                roles.map(r => [r, runMovePostEffect(moves[r], postMoveContexts[r])])
            ) as RoleMap<EffectOutcome | undefined>

            const endOfMoveContexts = Object.fromEntries(
                roles.map(r => [r, {...postMoveContexts[r], postEffectOutcome: postEffectOutcomes[r]}])
            )

            // BP - post effect results.
            
            
            player.reapExpiredStatuses();
            opponent.reapExpiredStatuses();
        }

        opponentAI.postRoundBehavior?.(opponent, player);
    }

    return {
        executeRound, setupRound, battleResolutionPromise, forceBattleResolve
    }
}