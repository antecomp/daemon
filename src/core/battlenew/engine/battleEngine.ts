//export function createBattleEngine(opponentAI, reactionmap, deps);

import { SEQUENCE_LENGTH } from "../config/battle.config";
import { PLAYER_HEALTH_PLACEHOLDER } from "../config/placeholders";
import { BattleOutcome } from "../types/battle.types";
import { Combatant } from "../types/combatant";
import { PlannedMove } from "../types/move";
import { OpponentAI, OpponentStats } from "../types/opponentProfile";

// need hook for like useUIBattleEngine or some better name, that runs the above but 
// injects all the Solid/Anim shit into reactionmap that we want, configires the UI,
// uses opponentProfile instead of opponentAI. opponentProfile used to configure UI shit beforehand
// configured UI handlers are *then* passed as part of the reactionmap
// hook should probably be in features rather than here? idk it's still just a "hook" no components.
// up to u

// helpers here for laziness, ofc we will want to move this all (to probably a BattleUtils class as a bunch of static methods)
function initializePlannedMoves(myPlan: PlannedMove[], theirPlan: PlannedMove[]) {
    return myPlan.map((plannedMove, index) => plannedMove.instantiate({myPlan, theirPlan, index}))
} 

export function createBattleEngine(opponentAI: OpponentAI, opponentStats: OpponentStats, /* reactionmap, deps */) {
    const player = new Combatant(PLAYER_HEALTH_PLACEHOLDER);
    const opponent = new Combatant(opponentStats.maxHealth);
    
    // naming convention of DynamicMoves are uninstantiated "plans"
    // whereas the evaluated version is a "sequence"
    let opponentPlan: PlannedMove[] = [];

    const {promise: battleResolutionPromise, resolve: resolveBattle} = Promise.withResolvers<BattleOutcome>();
    
    // do we need this?
    const forceBattleResolve = (outcome: BattleOutcome) => resolveBattle(outcome);

    // anticipates use of another helper getOutcome(ctx) => BattleOutcome | false. If there's an outcome we hand
    // off to this to do cleanup, set stages. Otherwise we just continue execution loop.
    async function handleBattleEnd(outcome: BattleOutcome) {
        // noop for now
    }

    async function setupRound() {
        opponentPlan = opponentAI.getSequence(opponent, player);
        // await reaction handlers for setup here.
    }

    async function executeRound(playerPlan: PlannedMove[]) {
        // await reaction handlers for pre-round

        const playerSequence = initializePlannedMoves(playerPlan, opponentPlan);
        const opponentSequence = initializePlannedMoves(opponentPlan, playerPlan);

        if(playerSequence.length != SEQUENCE_LENGTH) throw new Error("Player Sequence of Wrong Size!");
        if(opponentSequence.length != SEQUENCE_LENGTH) throw new Error("Opponent Sequence of Wrong Size!");
        
        for(let moveIndex = 0; moveIndex < SEQUENCE_LENGTH; moveIndex++) {
            // await reaction handlers for move start

            // ...
        }
    }
}