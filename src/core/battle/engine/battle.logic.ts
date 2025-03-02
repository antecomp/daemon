import { createMutable } from "solid-js/store";
import { Actor } from "./actor";
import { ActionMessage, ActionMessageAppender, DVOpponentData, MultiplierSet } from "./battle.types";
import { MoveContext, MoveMeta, PlayerMoveMeta, PostMoveContext } from "../moves/moves.types";
import { BattleUIState } from "./battle.context";
import { createEffect, createSignal } from "solid-js";
import sleep from "@/util/sleep";
import { generateHint, unwrapMoveMetaSequence, prepareMove, handlePostMoveEffects, performStatusPostEffects, handleImmediatePostEffects, mergeAndSortAnimations, executeAnimations, hasAnimations } from "./battle.utils";
import { DAMAGE_DELAY, MOVE_DELAY, NOTIFICATION_LIFESPAN } from "./battle.config";
import { damageFlashOpponent, highlightMovesAtIndex, stopHighlightingMovesAtIndex } from "../animation/uiAnimations";

export function useBattleLogic(opponentData: DVOpponentData) {
    // Provided as context by the Battle component itself.
    const [battleUIState, setBattleUIState] = createSignal(BattleUIState.WAITING);

    /*  createMultible let's Solid listen for *value* changes on this object for UI updates
        Meaning we don't have to use a signal for "health" as it's a primitive
        already in Actor that we can access directly. */
    const player = createMutable(new Actor("Arda", 20)); // This should be extracted from game store later.
    const opponent = createMutable(new Actor(opponentData.name, opponentData.maxHealth));

    let opponentSequence: MoveMeta[]; // At this scope for use in setupRound and executeRound.

    // Used for visualization of opponent sequence. Either partial "hint" of the full thing.
    const [insight, setInsight] = createSignal<(MoveMeta | undefined)[]>([]);

    // Signals used to visualize the multiplier values (used by the mult bars in ActionBar.tsx)
    const [playerMults, setPlayerMults] = createSignal<MultiplierSet>({ incoming: 0, outgoing: 0 })
    const [opponentMults, setOpponentMults] = createSignal<MultiplierSet>({ incoming: 0, outgoing: 0 })

    // Signal used to visualize status effects in multbar
    const [currentStatuses, setCurrentStatusIcons] = createSignal<{ player: string[], opp: string[] }>({ player: [], opp: [] });

    // Action messages are the little quick prompts that indicate things happening in the battle, information and flair text
    const [actionMessages, setActionMessages] = createSignal<ActionMessage[]>([]);
    const appendActionMessage: ActionMessageAppender = (text: string/*, icon */) => {
        setActionMessages(prev => [...prev, { text }]);

        // Should be changed to some sort of pipeline thing later.
        setTimeout(() => {
            setActionMessages(prev => prev.slice(1))
        }, NOTIFICATION_LIFESPAN);
    }


    // Runs automatically on battle start, and then after every (nonfatal) round.
    function setupRound() {
        opponentSequence = opponentData.getSequence(opponent, player);
        setInsight(generateHint(opponentSequence));
        setBattleUIState(BattleUIState.WAITING);
        console.log(opponentSequence.map(m => m.displayName)); // Show all for cheating (debugging)
    }

    // Round exec trigger by user event (building sequence and pressing "execute")...
    async function executeRound(userSelectedSequence: PlayerMoveMeta[], debugMode?: boolean) {

        setBattleUIState(BattleUIState.EXECUTING); // This state locks the UI/Conditionally renders in-battle animations

        setInsight(opponentSequence); // Visualize entire opponent sequence.

        opponent.setMoveSequence(unwrapMoveMetaSequence(opponent, opponentSequence, player, userSelectedSequence));
        player.setMoveSequence(unwrapMoveMetaSequence(player, userSelectedSequence, opponent, opponentSequence));
        if (opponent.currentSequence.length != 5) throw new Error("Opponent sequence not of correct length to evaluate");
        if (player.currentSequence.length != 5) throw new Error("Player sequence not of correct length to evaluate"); // Should never see this.

        // Sequence buffers are Record<index, {}>'s that can be used by moves to save information relevant to subsequent moves.
        // Differs from player.data which is persistent for the entire battle.
        const playerSequenceBuffer = {};
        const opponentSequenceBuffer = {};

        for (let moveIndex = 0; moveIndex < 5; moveIndex++) {

            // Get animation objects so we can call cancel on them later.
            const seqHighlightAnimations = highlightMovesAtIndex(moveIndex);

            const playerContext: MoveContext = {
                self: player, 
                sequence: player.currentSequence, 
                index: moveIndex, 
                opponent,
                sequenceBuffer: playerSequenceBuffer,
                appendActionMessage
            }

            const opponentContext: MoveContext = {
                self: opponent, 
                sequence: opponent.currentSequence, 
                index: moveIndex, 
                opponent: player, 
                sequenceBuffer: opponentSequenceBuffer,
                appendActionMessage
            }

            // PreEffects and Mults.
            const playerFinalMultipliers = prepareMove(playerContext);
            const opponentFinalMultipliers = prepareMove(opponentContext);

            // Update UI
            setPlayerMults(playerFinalMultipliers);
            setOpponentMults(opponentFinalMultipliers);
            setCurrentStatusIcons({
                player: Array.from(player.statuses).map(([_, stack]) => stack[0].icon!),
                opp: Array.from(opponent.statuses).map(([_, stack]) => stack[0].icon!)
            });

            // Perform animations that occur before damage output.
            const preAnims = mergeAndSortAnimations(player.currentSequence[moveIndex], opponent.currentSequence[moveIndex], "pre");

            if(!debugMode){ // Skip anims/delay for testing
                if(hasAnimations(preAnims)) {
                    await executeAnimations(preAnims, playerContext, opponentContext)
                } else {
                    await sleep(DAMAGE_DELAY);
                }
            }

            // I know this doubling up look stupid, but you can't easily loop generalize this
            // as we require this specific flip-floppy way of ordering the events!!!

            const playerDamageDealt = playerFinalMultipliers.outgoing * opponentFinalMultipliers.incoming;
            const opponentDamageDealt = playerFinalMultipliers.incoming * opponentFinalMultipliers.outgoing;

            opponent.takeDamage(playerDamageDealt);
            player.takeDamage(opponentDamageDealt);

            const playerPostContext: PostMoveContext = {
                ...playerContext,
                damageDealt: playerDamageDealt,
                damageTaken: opponentDamageDealt,
                ourMults: playerFinalMultipliers,
                theirMults: opponentFinalMultipliers
            }

            const opponentPostContext: PostMoveContext = {
                ...opponentContext,
                damageDealt: opponentDamageDealt,
                damageTaken: playerDamageDealt,
                ourMults: opponentFinalMultipliers,
                theirMults: playerFinalMultipliers
            }

            handleImmediatePostEffects(playerPostContext);
            handleImmediatePostEffects(opponentPostContext);

            performStatusPostEffects(player, opponent);
            performStatusPostEffects(opponent, player);

            player.tickAndRemoveStatuses();
            opponent.tickAndRemoveStatuses();

            handlePostMoveEffects(playerPostContext);
            handlePostMoveEffects(opponentPostContext);

            const postAnims = mergeAndSortAnimations(player.currentSequence[moveIndex], opponent.currentSequence[moveIndex], "post");

            if(!debugMode) {
                if(hasAnimations(postAnims)) {
                    await executeAnimations(postAnims, playerPostContext, opponentPostContext)
                }
            }

            // Reset signal for UI
            setPlayerMults({ incoming: 0, outgoing: 0 });
            setOpponentMults({ incoming: 0, outgoing: 0 });
            setCurrentStatusIcons({
                player: Array.from(player.statuses).map(([_, stack]) => stack[0].icon!),
                opp: Array.from(opponent.statuses).map(([_, stack]) => stack[0].icon!)
            });

            stopHighlightingMovesAtIndex(seqHighlightAnimations);

            !debugMode && await sleep(MOVE_DELAY); // Wait before doing next move.
        }

        // TODO: Death Check

        //console.log(player, opponent);

        // Loop back to setup.
        setupRound();

    }

    createEffect(() => {
        // Dependency, should trigger whenever health changes.
        if(opponent.health > 0) {
            damageFlashOpponent();
        }
    })

    return { playerMults, opponentMults, battleUIState, setBattleUIState, player, opponent, setupRound, executeRound, insight, currentStatuses, actionMessages };
}