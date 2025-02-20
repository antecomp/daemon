import { createMutable } from "solid-js/store";
import { Actor } from "./actor";
import { DVOpponentData, MultiplierSet } from "./battle.types";
import {  MoveMeta, PlayerMoveMeta } from "../moves/moves.types";
import { BattleUIState } from "./battle.context";
import { createSignal } from "solid-js";
import sleep from "@/util/sleep";
import { generateHint, unwrapMoveMetaSequence, prepareMove, handlePostMove } from "./battle.utils";

export function useBattleLogic(opponentData: DVOpponentData) {
    // Provided as context by the Battle component itself.
    const [battleUIState, setBattleUIState] = createSignal(BattleUIState.WAITING);

    /*  createMultible let's Solid listen for *value* changes on this object for UI updates
        Meaning we don't have to use a signal for "health" as it's a primitive
        already in Actor that we can access directly. */
    const player = createMutable(new Actor("player", 20)); // This should be extracted from game store later.
    const opponent = createMutable(new Actor(opponentData.name, opponentData.maxHealth));

    let opponentSequence: MoveMeta[] // Mutable ref-like (here because it's utilized by multiple methods.)

    // Used for visualization of opponent sequence. Either partial "hint" of the full thing.
    const [insight, setInsight] = createSignal<(MoveMeta | undefined)[]>([]);

    // Signals used to visualize the multiplier values (used by the mult bars in ActionBar.tsx)
    const [playerMults, setPlayerMults] = createSignal<MultiplierSet>({incoming: 0, outgoing: 0})
    const [opponentMults, setOpponentMults] = createSignal<MultiplierSet>({incoming: 0, outgoing: 0})


    // Runs automatically on battle start, and then after every (nonfatal) round.
    function setupRound() { 
        opponentSequence = opponentData.getSequence(opponent, player);
        setInsight(generateHint(opponentSequence));
        opponent.setMoveSequence( unwrapMoveMetaSequence(opponent, opponentSequence) );
        setBattleUIState(BattleUIState.WAITING);
    }

    // Round exec trigger by user event (building sequence and pressing "execute")...
    async function executeRound(userSelectedSequence: PlayerMoveMeta[]) {
        if(opponent.currentSequence.length != 5) throw new Error("Opponent sequence not of correct length to evaluate");

        setBattleUIState(BattleUIState.EXECUTING); // This state locks the UI/Conditionally renders in-battle animations

        setInsight(opponentSequence); // Visualize entire opponent sequence.

        player.setMoveSequence(unwrapMoveMetaSequence(player, userSelectedSequence));
        if(player.currentSequence.length != 5) throw new Error("Player sequence not of correct length to evaluate"); // Should never see this.

        // Sequence buffers are Record<index, {}>'s that can be used by moves to save information relevant to subsequent moves.
        // Differs from player.data which is persistent for the entire battle.
        const playerSequenceBuffer = {};
        const opponentSequenceBuffer = {};
        
        for(let moveIndex = 0; moveIndex < 5; moveIndex++) {
            
            // PreEffects and Mults.
            const playerFinalMultipliers = prepareMove( player, opponent, moveIndex, playerSequenceBuffer);
            const opponentFinalMultipliers = prepareMove( opponent, player, moveIndex, opponentSequenceBuffer);

            // Update signal to visualize new mults in UI
            setPlayerMults(playerFinalMultipliers); 
            setOpponentMults(opponentFinalMultipliers);

            // TODO: Also Visualize Applied Effects.

            // Delay before damage dealt. (see multipliers then apply)
            await sleep(1000);

            opponent.takeDamage(playerFinalMultipliers.outgoing * opponentFinalMultipliers.incoming);
            player.takeDamage(playerFinalMultipliers.incoming * opponentFinalMultipliers.outgoing);

            // PostEffects for Statuses and Moves.
            handlePostMove(player, opponent, moveIndex, playerSequenceBuffer);
            handlePostMove(opponent, player, moveIndex, opponentSequenceBuffer);

            // Reset signal for UI
            setPlayerMults({incoming: 0, outgoing: 0});
            setOpponentMults({incoming: 0, outgoing: 0})

            await sleep(3000); // Wait before doing next move.
        }

        // TODO: Death Check

        //console.log(player, opponent);

        // Loop back to setup.
        setupRound();
        
    }

    return { playerMults, opponentMults, battleUIState, setBattleUIState, player, opponent, setupRound, executeRound, insight };
}