import { createMutable } from "solid-js/store";
import { Actor } from "./actor";
import { ActionMessage, ActionMessageAppender, DVOpponentData, MultiplierSet } from "./battle.types";
import { MoveContext, MoveMeta, MovePerspective, PlayerMoveMeta, PostMoveContext } from "../moves/moves.types";
import { BattleUIState } from "./battle.context";
import { batch, createSignal } from "solid-js";
import sleep from "@/util/sleep";
import { generateHint, unwrapMoveMetaSequence, prepareMove, handlePostMoveEffects, performStatusPostEffects, handleImmediatePostEffects, mergeAndSortAnimations, executeAnimations, hasAnimations, isAnyoneDead } from "./battle.utils";
import { DAMAGE_DELAY, PLAYER_HEALTH_PLACEHOLDER, MOVE_DELAY, NOTIFICATION_LIFESPAN, PREANIM_DELAY } from "./battle.config";
import { animateOpponentDamageFlash, animateOpponentSequenceFadeIn, animateOpponentSequenceFadeOut, animateMoveHighlight, animateOpponentDeathFade, stopMoveHighlight, animateMainUIFadeOut } from "../animation/uiAnimations";

import { playSound } from "@/util/playSound";
import pain_sfx from "@/assets/sfx/battle/pain.wav";
import player_pain_sfx from "@/assets/sfx/battle/player_pain.wav"
import { MeltAnimationFn } from "@/hooks/createMeltEffect";

import { detect } from "detect-browser";
const browser = detect();

/**
 * A hook that provides the core battle logic for a turn-based battle system.
 * It manages the state of the battle, including player and opponent actors, 
 * UI signals, and the execution of battle rounds. The hook also handles animations, 
 * status effects, and battle resolution.
 *
 * @param opponentData - The data for the opponent, including name and max health.
 * @param debugMode - Optional flag to enable debug mode, which skips animations and delays.
 * 
 * @returns An object containing the following:
 * 
 * - `playerMults`: Signal getter for the player's incoming and outgoing multipliers.
 * - `opponentMults`: Signal getter for the opponent's incoming and outgoing multipliers.
 * - `battleUIState`: Signal for the current state of the battle UI.
 * - `setBattleUIState`: Signal setter for the battle UI state.
 * - `player`: The player actor object.
 * - `opponent`: The opponent actor object.
 * - `setupRound`: Function to initialize and set up a new round. Fetches opponent moves, updates the displayed hint, and resets the battle state.
 * - `executeRound`: Function to execute a battle round. Processes the player's selected sequence, evaluates the battle logic, and updates the state.
 * - `insight`: Signal for the current "hint" of the opponent's move sequence.
 * - `currentStatuses`: Object representing the current status icons for the player and opponent (used for UI visualization).
 * - `actionMessages`: Signal for the current action messages (flair text) displayed during the battle.
 * - `battleResultPromise`: A promise that resolves when the battle ends, indicating the outcome:
 *   - Resolves to `"player"` if the player wins (opponent dies).
 *   - Resolves to `"opponent"` if the opponent wins (player dies).
 *   - Resolves to `"draw"` if both the player and opponent die.
 */
export function useBattleLogic(opponentData: DVOpponentData, debugMode?: boolean, startMeltAnimation?: MeltAnimationFn) {
    // Provided as context by the Battle component itself.
    const [battleUIState, setBattleUIState] = createSignal(BattleUIState.WAITING);

    /*  createMultible let's Solid listen for *value* changes on this object for UI updates
        Meaning we don't have to use a signal for "health" as it's a primitive
        already in Actor that we can access directly. */
    const player = createMutable(new Actor("Arda", PLAYER_HEALTH_PLACEHOLDER)); // This should be extracted from game store later.
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
    const appendActionMessage: ActionMessageAppender = (text, icon) => {
        setActionMessages(prev => [...prev, { text, icon }]);

        // Is this good enough or should we have a more reliable system?
        setTimeout(() => {
            setActionMessages(prev => prev.slice(1))
        }, NOTIFICATION_LIFESPAN);
    }

    // expose resolve method so we can call it when someone dies.
    let battleResolve: ((winner: "player" | "opponent" | "draw") => void) | null = null;
    /** Promise representing the battle outcome, resolved when the player or opponent die.
     * @resolves "player" when player wins (opponent death)
     * @resolves "opponent" when opponent wins (player death)
     * @resolves "draw" when both player and opponent die.
     */
    const battleResultPromise = new Promise<"player" | "opponent" | "draw">((resolve) => {
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
                if(!debugMode && startMeltAnimation) {
                    // Will need a more robust check of browser that support this effect w/ some fallback.
                    if(browser?.name != 'safari') startMeltAnimation(false, 20, 0.01);
                    await animateMainUIFadeOut();
                }
                battleResolve!("opponent");
                break;
            case "opponent":
                // Opponent death animation await goes here (await).
                if(!debugMode) {
                    playSound(pain_sfx); // Might replace with a specific killing blow sound later.
                    await animateOpponentDamageFlash();
                    await animateOpponentDeathFade();
                }
                battleResolve!("player");
                break;
            case "draw":
                // For now let's just have player priority, draw is player victory
                battleResolve!("player");
                break;
        }
        
        setBattleUIState(BattleUIState.END); // May be uneeded depending on how we handle resolution.
    }

    // Attach animation effects that trigger when actor or opponent take damage
    if(!debugMode) {
        player.onDamageTaken((_amt, health) => {
            if(health > 0) { // We want a different animation for a killing-blow.
                // Will need a more robust check of browser that support this effect w/ some fallback.
                if(browser?.name != 'safari') startMeltAnimation?.(true, 20, 0.5);
                playSound(player_pain_sfx);
            }
        });

        opponent.onDamageTaken((_amt, health) => {
            if(health > 0){
                playSound(pain_sfx);
                animateOpponentDamageFlash();
            }
        });
    }

    /** 
     * Sets up a new round, fetching opponent moves, updating displayed hint, 
     * and resetting battle state. Called at battle start and after each round. 
     */
    async function setupRound() {
        opponentSequence = opponentData.getSequence(opponent, player);
        !debugMode && await animateOpponentSequenceFadeOut();
        setInsight(generateHint(opponentSequence));
        !debugMode && await animateOpponentSequenceFadeIn();
        setBattleUIState(BattleUIState.WAITING);
        console.log(opponentSequence.map(m => m.displayName)); // Show all for cheating (debugging)
    }

    // Round exec trigger by user event (building sequence and pressing "execute")...
    async function executeRound(userSelectedSequence: PlayerMoveMeta[]) {

        setBattleUIState(BattleUIState.EXECUTING); // This state locks the UI/Conditionally renders in-battle animations

        !debugMode && await animateOpponentSequenceFadeOut();
        setInsight(opponentSequence); // Visualize entire opponent sequence.
        !debugMode && await animateOpponentSequenceFadeIn();

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
            const seqHighlightAnimations = animateMoveHighlight(moveIndex);

            const playerContext: MoveContext = {
                self: player, 
                sequence: player.currentSequence, 
                index: moveIndex, 
                opponent,
                sequenceBuffer: playerSequenceBuffer,
                appendActionMessage,
                movePerspective: MovePerspective.Player
            }

            const opponentContext: MoveContext = {
                self: opponent, 
                sequence: opponent.currentSequence, 
                index: moveIndex, 
                opponent: player, 
                sequenceBuffer: opponentSequenceBuffer,
                appendActionMessage,
                movePerspective: MovePerspective.Opponent
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
                stopMoveHighlight(seqHighlightAnimations);
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
            batch(() => {
                setPlayerMults({ incoming: 0, outgoing: 0 });
                setOpponentMults({ incoming: 0, outgoing: 0 });
                setCurrentStatusIcons({
                    player: Array.from(player.statuses).map(([_, stack]) => stack[0].icon!),
                    opp: Array.from(opponent.statuses).map(([_, stack]) => stack[0].icon!)
                });
            });

            stopMoveHighlight(seqHighlightAnimations);

            !debugMode && await sleep(MOVE_DELAY); // Wait before doing next move.
        }

        deathResult = isAnyoneDead(player, opponent);
        if(deathResult) {
            handleDeath(deathResult);
            return;
        }

        // Loop back to setup.
        setupRound();
    }

    return {
        /** Simple signal getter indicating player incoming/outgoing multipliers */  
        playerMults,
        /** Simple signal getter indicating opponent incoming/outgoing multipliers */
        opponentMults,
        /** Signal for battle UI state. Reference battle.context.ts */ 
        battleUIState, 
        /** Signal setter for battle UI state. Reference battle.context.ts */
        setBattleUIState,
        /** Player actor object */ 
        player,
        /** Opponent actor object */ 
        opponent, 
        /** Round initialization and setup function.
         * Fetches opponent moves, updates displayed hint, and resets battle state.
         */
        setupRound,
        /** Round execution function, triggered by user event.
         * - Builds sequence and executes it, updating the battle state.
         * - Core battle logic is executed here.
         * - Automatically triggers setupRound or handleDeath as needed.
         */ 
        executeRound, 
        /** Signal for the current "hint" of the opponent sequence. */
        insight, 
        /** Simple object representing the current status icons for the player and opponent (for UI) */
        currentStatuses, 
        /** Signal for the current action messages (flair text) */
        actionMessages,
        /** Promise representing the battle outcome, resolved when the player or opponent die.
         * 
         * Await/then this to handle battle resolution.
         * @resolves "player" when player wins (opponent death)
         * @resolves "opponent" when opponent wins (player death)
         * @resolves "draw" when both player and opponent die.
         */
        battleResultPromise
    };
}