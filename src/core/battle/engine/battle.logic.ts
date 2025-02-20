import { createMutable } from "solid-js/store";
import { Actor } from "./actor";
import { DVOpponentData, MultiplierSet } from "./battle.types";
import {  MoveMeta, PlayerMoveMeta } from "../moves/moves.types";
import { BattleUIState } from "./battle.context";
import { createSignal } from "solid-js";
import sleep from "@/util/sleep";
import { generateHint, unwrapMoveMetaSequence, prepareMove, handlePostMove } from "./battle.utils";

export function useBattleLogic(opponentData: DVOpponentData) {
    const [battleUIState, setBattleUIState] = createSignal(BattleUIState.WAITING);

    // This should be extracted from game store later?
    const player = createMutable(new Actor("player", 20));

    const opponent = createMutable(new Actor(opponentData.name, opponentData.maxHealth));
    let opponentSequence: MoveMeta[] // Mutable ref-like for use in multiple UI states. (Hint then full reveal)

    const [insight, setInsight] = createSignal<(MoveMeta | undefined)[]>([]);

    const [playerMults, setPlayerMults] = createSignal<MultiplierSet>({incoming: 0, outgoing: 0})
    const [opponentMults, setOpponentMults] = createSignal<MultiplierSet>({incoming: 0, outgoing: 0})


    function setupRound() { 
        opponentSequence = opponentData.getSequence(opponent, player);
        setInsight(generateHint(opponentSequence));
        opponent.setMoveSequence( unwrapMoveMetaSequence(opponent, opponentSequence) );
        setBattleUIState(BattleUIState.WAITING);
    }


    async function executeRound(userSelectedSequence: PlayerMoveMeta[]) {
        if(opponent.currentSequence.length != 5) throw new Error("Opponent sequence not of correct length to evaluate");

        setBattleUIState(BattleUIState.EXECUTING);

        setInsight(opponentSequence);

        player.setMoveSequence(unwrapMoveMetaSequence(player, userSelectedSequence));
        console.log(player.currentSequence);
        if(player.currentSequence.length != 5) throw new Error("Player sequence not of correct length to evaluate");

        const playerSequenceBuffer = {};
        const opponentSequenceBuffer = {};
        
        // Likely want to do some work to generalize this so we dont have to write double of everything.
        for(let moveIndex = 0; moveIndex < 5; moveIndex++) {
            
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

            handlePostMove(player, opponent, moveIndex, playerSequenceBuffer);
            handlePostMove(opponent, player, moveIndex, opponentSequenceBuffer);

            // Reset signal for UI
            setPlayerMults({incoming: 0, outgoing: 0});
            setOpponentMults({incoming: 0, outgoing: 0})

            console.log("playerSeqBuff", playerSequenceBuffer);

            await sleep(3000); // Wait before doing next move.
        }

        // TODO: Death Check

        // Loop back to setup.
        setupRound();
        console.log(player, opponent);
    }

    return { playerMults, opponentMults, battleUIState, setBattleUIState, player, opponent, setupRound, executeRound, insight };
}