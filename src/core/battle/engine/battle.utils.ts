import { stopMoveHighlight } from "../animation/uiAnimations";
import { Move, MoveContext, MoveMeta, MoveType, PostMoveContext } from "../moves/moves.types";
import { computeStatusMultipliers } from "../statuses/status.utils";
import { Actor } from "./actor";
import { HINT_AMOUNT } from "./battle.config";
import { MultiplierSet } from "./battle.types";

/**
 * Generate a clone of a sequence with a few of the elements redacted as undefined.
 * @param seq - The sequence of `MoveMeta` objects to redact.
 * @returns A new sequence where three random elements are replaced with `undefined`.
 */
export const generateHint = (seq: MoveMeta[]): (MoveMeta | undefined)[] => {
    const indices = new Set<number>

    while (indices.size < HINT_AMOUNT) {
        indices.add(Math.floor(Math.random() * seq.length));
    }

    return seq.map((item, index) => indices.has(index) ? undefined : item);
}

/** Base multiplier registry, these are used as the initial values for the multipliers in the mult pipeline (reduce).
 * 
 * If you create a new MoveType, you must add it here.
 */
const BASE_MULTIPLIERS: Record<MoveType, MultiplierSet> = {
    [MoveType.Aggressive]: { incoming: 1, outgoing: 1 },
    [MoveType.Passive]: { incoming: 1, outgoing: 0 },
    [MoveType.Defensive]: { incoming: 1, outgoing: 0 },
    [MoveType.Overwhelming]: { incoming: 1, outgoing: 1 },
};

/** Get the base multipliers associated with a MoveType (aggressive, passive, defensive etc)
 * Used to get the initialMultipliers pushed to computeMoveMultipliers.
 */
export function getBaseMultipliers(type: MoveType): MultiplierSet {
    return BASE_MULTIPLIERS[type];
}

/** Reduce through a moves multipliers properties, returning the combined multipliers.
 * @param initialMultipliers - The starting multipliers to apply.
 * @param move - The move whose multipliers are being computed.
 * @param context - The context in which the move is being executed.
 * @returns The combined multipliers after applying the move's multiplier pipeline.
 */
export function computeMoveMultipliers(initialMultipliers: MultiplierSet, move: Move, context: MoveContext): MultiplierSet {
    if (!move.behaviors.multpipeline) return initialMultipliers; // No multipliers to apply.

    return move.behaviors.multpipeline.reduce(
        (currentMults, step) => step(currentMults, context), 
        initialMultipliers
    );
}

/** Helper function to multiply "incoming" and "outgoing" for multiple multiplier sets. 
 * @param sets - The multiplier sets to combine.
 * @returns A single `MultiplierSet` with combined "incoming" and "outgoing" values.
*/
export function combineMultiplierSets(...sets: MultiplierSet[]) {
    return sets.reduce((acc: MultiplierSet, set) => {
        return {
            outgoing: acc.outgoing * set.outgoing,
            incoming: acc.incoming * set.incoming
        }
    }, {incoming: 1, outgoing: 1})
}

/** Extracts the underlying Move information from MoveMeta sequence, allows us to do preprocessing logic for dynamic moves.
 * @param self - The actor performing the moves.
 * @param seq - The sequence of `MoveMeta` objects for the actor.
 * @param opponent - The opposing actor.
 * @param opponentSeq - The sequence of `MoveMeta` objects for the opponent.
 * @returns An array of `Move` objects extracted from the `MoveMeta` sequence.
 */
export function unwrapMoveMetaSequence(self: Actor, seq: MoveMeta[], opponent: Actor, opponentSeq: MoveMeta[]): Move[] {
    return seq.map((meta, index) => {
        
        // getMove has some special logic that will return a move.
        if(typeof meta.getMove == "function") {
            return meta.getMove({self, seq, index, opponent, opponentSeq});
        }
        
        return meta.getMove;
    })
}

/** Runs PreEffects and Mult Pipeline For A Given Move + Set Of Actors.
 * @param context - The context in which the move is being prepared.
 * @returns The final multipliers after applying all effects and pipelines.
 */
export function prepareMove(
    context: MoveContext,
): MultiplierSet {

    const { self, index: moveIndex, sequenceBuffer } = context;
    
    const move = self.currentSequence[moveIndex];

    // Add buffer entry at index.
    if (!sequenceBuffer[moveIndex]) sequenceBuffer[moveIndex] = {};

    move.behaviors.preEffects?.forEach((effect) => effect(context));

    const baseMultipliers = getBaseMultipliers(move.type);
    const moveMultipliers = computeMoveMultipliers(baseMultipliers, move, context);
    const statusMultipliers = computeStatusMultipliers(self);

    const finalMultipliers = combineMultiplierSets(statusMultipliers, moveMultipliers);

    return finalMultipliers;
}


/** Runs Move Effects at the very end (after damage calculation and ticker) */
export function handlePostMoveEffects(context: PostMoveContext) {

    const { self, index: moveIndex } = context;

    // Run Move PostEffect *last* so it can apply effects for
    // the next turn that won't be ticked off.
    const move = self.currentSequence[moveIndex];
    move.behaviors.postEffects?.forEach((effect) => {
            effect(context)
        }
    );
}


/** Run Move Effects that happen before the ticker but after the damage calculation. */
export function handleImmediatePostEffects(context: PostMoveContext) {

    const { self, index: moveIndex } = context;

    const move = self.currentSequence[moveIndex];
    move.behaviors.immediatePostEffects?.forEach((effect) => {
            effect(context)
        }
    );
}

/** Check if player or opponent has died.
 * @returns "player" on player death
 * @returns "opponent" on opponent death
 * @returns "draw" on both death
 * @returns null otherwise (no death)
 */
export function isAnyoneDead(player: Actor, opponent: Actor) {
   const p = player.health <= 0;
   const o = opponent.health <= 0;
   if(p && o) return "draw";
   if(p) return "player";
   if(o) return "opponent";
   return null;
}


/**
 * Handles the death logic for a battle scenario by checking if either the player
 * or the opponent has died. If a death is detected, it stops any ongoing highlight
 * animations and invokes the provided `handleDeath` callback with the result.
 *
 * @param player - The player actor involved in the battle.
 * @param opponent - The opponent actor involved in the battle.
 * @param handleDeath - A callback function to handle the death result. It receives
 *                      a string indicating the result: `"player"`, `"opponent"`, or `"draw"`.
 * @param seqHighlightAnimations - Optional animations for highlighting the sequence
 *                                 of moves. If provided, these animations will be stopped
 *                                 when a death is detected.
 *   - `seqHighlightAnimations.playerSeqAnim` - The animation for the player's sequence.
 *   - `seqHighlightAnimations.oppSeqAnim` - The animation for the opponent's sequence.
 * @returns `true` if a death was detected and handled, otherwise `false`. 
 * This return is used in executeRound to trigger an escape from evaluation loop.
 */
export function handleDeathIfNeeded(
    player: Actor,
    opponent: Actor,
    handleDeath: (result: "player" | "opponent" | "draw") => void,
    seqHighlightAnimations?: {
        playerSeqAnim: Animation | undefined;
        oppSeqAnim: Animation | undefined;
    },
): boolean {
    const deathResult = isAnyoneDead(player, opponent);
    if(deathResult) {
        seqHighlightAnimations && stopMoveHighlight(seqHighlightAnimations);
        handleDeath(deathResult);
        return true;
    }
    return false;
}

/**
 * Cross-multiplies player and opponent multipliers and performs corresponding .takeDamage on each actor.
 */
export function calculateAndApplyDamage(player: Actor, opponent: Actor, playerMults: MultiplierSet, opponentMults: MultiplierSet) {
    const playerDamageDealt = playerMults.outgoing * opponentMults.incoming;
    const opponentDamageDealt = opponentMults.outgoing * playerMults.incoming;

    opponent.takeDamage(playerDamageDealt);
    player.takeDamage(opponentDamageDealt);

    return {playerDamageDealt, opponentDamageDealt};
}