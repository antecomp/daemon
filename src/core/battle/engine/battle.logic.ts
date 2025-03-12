import { createMutable } from "solid-js/store";
import { Actor } from "./actor";
import { ActionMessage, ActionMessageAppender, DVOpponentData, MultiplierSet } from "./battle.types";
import { MoveContext, MoveMeta, PlayerMoveMeta, PostMoveContext } from "../moves/moves.types";
import { BattleUIState } from "./battle.context";
import { batch, createEffect, createSignal } from "solid-js";
import sleep from "@/util/sleep";
import { generateHint, unwrapMoveMetaSequence, prepareMove, handlePostMoveEffects, performStatusPostEffects, handleImmediatePostEffects, mergeAndSortAnimations, executeAnimations, hasAnimations, isAnyoneDead } from "./battle.utils";
import { DAMAGE_DELAY, MORONIC_CONST_FOR_PLAYER_STARTER_HEALTH_CHANGE_ME_PLEASE, MOVE_DELAY, NOTIFICATION_LIFESPAN, PREANIM_DELAY } from "./battle.config";
import { damageFlashOpponent, fadeInOppSeq, fadeOutOppSeq, highlightMovesAtIndex, opponentDeathFade, stopHighlightingMovesAtIndex } from "../animation/uiAnimations";

import { playSound } from "@/util/playSound";
import pain_sfx from "@/assets/sfx/battle/pain.wav";

export function useBattleLogic(opponentData: DVOpponentData, debugMode?: boolean) {
    // Provided as context by the Battle component itself.
    const [battleUIState, setBattleUIState] = createSignal(BattleUIState.WAITING);

    /*  createMultible let's Solid listen for *value* changes on this object for UI updates
        Meaning we don't have to use a signal for "health" as it's a primitive
        already in Actor that we can access directly. */
    const player = createMutable(new Actor("Arda", MORONIC_CONST_FOR_PLAYER_STARTER_HEALTH_CHANGE_ME_PLEASE)); // This should be extracted from game store later.
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

        // Is this good enough or should we have a more reliable system?
        setTimeout(() => {
            setActionMessages(prev => prev.slice(1))
        }, NOTIFICATION_LIFESPAN);
    }

    let battleResolve: ((winner: "player" | "opponent" | "draw") => void) | null = null;
    /** Promise representing the battle outcome, resolved when the player or opponent die.
     * @resolves "player" when player wins (opponent death)
     * @resolves "opponent" when opponent wins (player death)
     * @resolves "draw" when both player and opponent die.
     */
    const battleResultPromise = new Promise<"player" | "opponent" | "draw">((resolve) => { // TODO: Remove "draw" from this due to player bias?
        battleResolve = resolve;
    });

    /** UI Cleanup, Animation and Promise Resolution Handler For Battle End (Someone died)  */
    async function handleDeath(who: "player" | "opponent" | "draw") {

        // UI Cleanup
        batch(() => {
            setPlayerMults({ incoming: 0, outgoing: 0 });
            setOpponentMults({ incoming: 0, outgoing: 0 });
            setCurrentStatusIcons({
                player: [],
                opp: []
            });
        });

        switch(who) {
            case "player":
                // Player death animation goes here (await).
                battleResolve!("opponent");
                break;
            case "opponent":
                // Opponent death animation await goes here (await).
                !debugMode && await damageFlashOpponent();
                !debugMode && await opponentDeathFade();
                battleResolve!("player");
                break;
            case "draw":
                // For now let's just have player priority, draw is player victory
                battleResolve!("player");
                break;
        }
        
        setBattleUIState(BattleUIState.END); // May be uneeded depending on how we handle resolution.
    }

    /** 
     * Sets up a new round, fetching opponent moves, updating displayed hint, 
     * and resetting battle state. Called at battle start and after each round. 
     */
    async function setupRound() {
        opponentSequence = opponentData.getSequence(opponent, player);
        !debugMode && await fadeOutOppSeq();
        setInsight(generateHint(opponentSequence));
        !debugMode && await fadeInOppSeq();
        setBattleUIState(BattleUIState.WAITING);
        console.log(opponentSequence.map(m => m.displayName)); // Show all for cheating (debugging)
    }

    // Round exec trigger by user event (building sequence and pressing "execute")...
    async function executeRound(userSelectedSequence: PlayerMoveMeta[]) {

        setBattleUIState(BattleUIState.EXECUTING); // This state locks the UI/Conditionally renders in-battle animations

        !debugMode && await fadeOutOppSeq();
        setInsight(opponentSequence); // Visualize entire opponent sequence.
        !debugMode && await fadeInOppSeq();

        opponent.setMoveSequence(unwrapMoveMetaSequence(opponent, opponentSequence, player, userSelectedSequence));
        player.setMoveSequence(unwrapMoveMetaSequence(player, userSelectedSequence, opponent, opponentSequence));
        if (opponent.currentSequence.length != 5) throw new Error("Opponent sequence not of correct length to evaluate");
        if (player.currentSequence.length != 5) throw new Error("Player sequence not of correct length to evaluate"); // Should never see this.

        // Sequence buffers are Record<index, {}>'s that can be used by moves to save information relevant to subsequent moves.
        // Differs from player.data which is persistent for the entire battle.
        const playerSequenceBuffer = {};
        const opponentSequenceBuffer = {};

        let deathResult: "player" | "opponent" | "draw" | null = null;

        for (let moveIndex = 0; moveIndex < 5; moveIndex++) {
            // Note: Can't generalize these as functions to loop over
            // as we're flipping between player/opponent.

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

            batch(() => {
                setPlayerMults(playerFinalMultipliers);
                setOpponentMults(opponentFinalMultipliers);
                setCurrentStatusIcons({
                    player: Array.from(player.statuses).map(([_, stack]) => stack[0].icon!),
                    opp: Array.from(opponent.statuses).map(([_, stack]) => stack[0].icon!)
                });
            });

            // Perform animations that occur before damage output.
            const preAnims = mergeAndSortAnimations(player.currentSequence[moveIndex], opponent.currentSequence[moveIndex], "pre");

            !debugMode && await sleep(PREANIM_DELAY)

            if(!debugMode){ // Skip anims/delay for testing
                if(hasAnimations(preAnims)) {
                    await executeAnimations(preAnims, playerContext, opponentContext)
                } else {
                    await sleep(DAMAGE_DELAY);
                }
            }

            const playerDamageDealt = playerFinalMultipliers.outgoing * opponentFinalMultipliers.incoming;
            const opponentDamageDealt = playerFinalMultipliers.incoming * opponentFinalMultipliers.outgoing;

            opponent.takeDamage(playerDamageDealt);
            player.takeDamage(opponentDamageDealt);

            // Early check if someone died from damage
            // we dont want to run any other effects if someone is dead.
            deathResult = isAnyoneDead(player, opponent);
            if(deathResult) {
                // Do our own early UI cleanup in-scope for the current move highlighting.
                stopHighlightingMovesAtIndex(seqHighlightAnimations);
                handleDeath(deathResult);
                return;
            }

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

        deathResult = isAnyoneDead(player, opponent);
        if(deathResult) {
            handleDeath(deathResult);
            return;
        }
        
        
        // TODO: Sequence Removal Animation

        // Loop back to setup.
        setupRound();

    }

    // Handles a few out-of-battle effects, like damage flash on opponent.
    createEffect(() => {
        // Opponent flash when taking damage. Unsynced from evaluation to give accurate feedback.
        if(opponent.health > 0) {
            // This is temporary, as it will improperly trigger for stuff like heal
            // need a more robust checker/cache system for this.
            if(opponent.health != opponent.maxHealth) playSound(pain_sfx);
            damageFlashOpponent();
        }
        // TODO: Player damage effect here (if any)
    })

    return { 
        playerMults, 
        opponentMults, 
        battleUIState, 
        setBattleUIState, 
        player, 
        opponent, 
        setupRound, 
        executeRound, 
        insight, 
        currentStatuses, 
        actionMessages,
        battleResultPromise
    };
}