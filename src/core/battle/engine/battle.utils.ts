import sleep from "@/util/sleep";
import { stopMoveHighlight } from "../animation/uiAnimations";
import { animationData, Move, moveAnimationStep, MoveContext, MoveMeta, MoveType, PostMoveContext } from "../moves/moves.types";
import { Actor } from "./actor";
import { MultiplierSet } from "./battle.types";

/**
 * Generate a clone of a sequence with a few of the elements redacted as undefined.
 * @param seq - The sequence of `MoveMeta` objects to redact.
 * @returns A new sequence where three random elements are replaced with `undefined`.
 */
export const generateHint = (seq: MoveMeta[]): (MoveMeta | undefined)[] => {
    const indices = new Set<number>

    while (indices.size < 3) {
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


/**
 * Runs post-effects (if any) for each status instance on an actor.
 * Executes the post-effect of the first status in each stack, providing a "level" (stack depth) to the postEffect handler.
 * @param actor - The actor whose statuses are being processed.
 * @param opponent - The opposing actor.
 */
export function performStatusPostEffects(actor: Actor, opponent: Actor) {
    for(const [_type, statusStack] of actor.statuses) {
        const stackCount = statusStack.length;
        if(stackCount > 0) {
            statusStack[0].applyPostEffect?.(actor, opponent, stackCount);
        }
    }
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

/** Combines the animations requested by player and opponents move, grouping and ordering them by priority
 * @argument playerMove - The move the player is using. (Animation grabbed from here)
 * @argument opponentMove - The move the opponent is using. (Animation grabbed from here)
 * @argument phase - The phase of the move to grab animations for. (pre or post) - pre is before damage, post is after. Controls the required context type.
 * @returns a Map of priority to an object containing player and opponent animations for that priority.
 */
export function mergeAndSortAnimations<TP extends "pre" | "post">(playerMove: Move, opponentMove: Move, phase: TP) {
    type ContextType = TP extends "pre" ? MoveContext : PostMoveContext;
    const playerAnimations = (playerMove.animations?.[phase] || []) as animationData<ContextType>[];
    const opponentAnimations = (opponentMove.animations?.[phase] || []) as animationData<ContextType>[];

    const groupedAnimations = new Map<number, {player: moveAnimationStep<ContextType>[], opponent: moveAnimationStep<ContextType>[] }>();

    for (const animation of playerAnimations) {
        if (!groupedAnimations.has(animation.priority)) {
            groupedAnimations.set(animation.priority, {player: [], opponent: []});
        }
        groupedAnimations.get(animation.priority)!.player.push({
            execute: animation.execute as (ctx: ContextType) => Promise<void>,
            soundEffect: animation.soundEffect as (() => Promise<void>) | undefined,  // Preserve sound!
        });
    }

    for (const animation of opponentAnimations) {
        if (!groupedAnimations.has(animation.priority)) {
            groupedAnimations.set(animation.priority, {player: [], opponent: []});
        }
        groupedAnimations.get(animation.priority)!.opponent.push({
            execute: animation.execute as (ctx: ContextType) => Promise<void>,
            soundEffect: animation.soundEffect as (() => Promise<void>) | undefined,  // Preserve sound!
        });
    }

    return groupedAnimations;
}


/** Execute animations in order of priority. Used in tandem with mergeAndSortAnimations.
 * @argument animations - The animations to execute, grouped by priority.
 * @argument playerContext - The context to pass to player animations.
 * @argument opponentContext - The context to pass to opponent animations
 */
export async function executeAnimations<contextType = MoveContext | PostMoveContext>(
    animations: Map<number, {
        player: moveAnimationStep<contextType>[];
        opponent: moveAnimationStep<contextType>[];
    }>,
    playerContext: contextType,
    opponentContext: contextType
) {
    // Sort priorities before iteration, since our Map keys are just in order of being added.
    const sortedPriorities = [...animations.keys()].sort((a, b) => a - b);

    // im so tired.
    for (const priority of sortedPriorities) {
        const { player, opponent } = animations.get(priority)!;

        await Promise.all([
            // Player animations and sounds...
            Promise.all(player.map(async ({execute, soundEffect}) => 
                Promise.all([execute(playerContext), soundEffect?.(playerContext)])
            )),
            // Opponent animations and sounds...
            Promise.all(opponent.map(({execute, soundEffect}) =>
                Promise.all([execute(opponentContext), soundEffect?.(opponentContext)])
            ))
        ])
    }
}

/** Helper to check if we have any animations.
 * Used in battle logic to subsitute a delay for animations if there are none.
 * @argument animations - The animations to check (grabbed from mergeAndSortAnimations)
 * @returns true if there are any animations, false otherwise.
 */
export function hasAnimations(animations: Map<number, {
        // Fuck off TS this is a length check I'm not working with the context
        player: moveAnimationStep<any>[], 
        opponent: moveAnimationStep<any>[] 
    }>
): boolean {
    for (const animList of animations.values()) {
        if (animList.player.length > 0
            || animList.opponent.length > 0
        ) {
            return true;
        }
    }
    return false;
}

/**
 * Handles the execution of animations for our two animation breaks (pre or post damage calc).
 * If debug mode is enabled, animations are skipped entirely.
 * 
 * @template TContext - The context type, extending either `MoveContext` or `PostMoveContext`. 
 * Associated with if we're doing the pre or post animations.
 * 
 * @param playerMove - The move performed by the player. (animation(s) grabbed from move)
 * @param opponentMove - The move performed by the opponent. (animations(s) grabbed from move)
 * @param phase - Animation phase;
 * - `pre` : before the damage is calculated (and health bars update), used to visualize the moves "in action"
 * - `post` : after damage is calculated and dished out, used to visualize any move side effects.
 * @param playerContext - The context associated with the player's move
 * @param opponentContext - The context associated with the opponent's move.
 * - Contexts are passed to animations such that they can do conditional behavior (f.e changing what spritesheet to use based on damage)
 * @param fallbackDelay - The delay to apply if no animations are present.
 * @param debugMode - Optional flag to disable animations for debugging/testing purposes.
 * 
 * @returns A promise that resolves once the animations (or fallback delay) are completed.
 */
export async function handlePhaseAnimations<TContext extends MoveContext | PostMoveContext>(
    playerMove: Move,
    opponentMove: Move,
    phase: "pre" | "post",
    playerContext: TContext,
    opponentContext: TContext,
    fallbackDelay: number,
    debugMode?: boolean,
) {
    if (debugMode) return; // No animations at all.

    const animations = mergeAndSortAnimations(playerMove, opponentMove, phase);

    if(hasAnimations(animations)) {
        await executeAnimations(animations, playerContext, opponentContext);
    } else {
        await sleep(fallbackDelay);
    }
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
 *    - `seqHighlightAnimations.playerSeqAnim` - The animation for the player's sequence.
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


/** Iterates through an actors current statuses, executing their getStatusMultipliers.
 * If multiple of the same status is applied, the multiplier function is still only run once, but it is passed
 * the number of duplicate instances of that current status at that time.
 */
export function computeStatusMultipliers(actor: Actor): MultiplierSet {
    let incoming = 1;
    let outgoing = 1;

    for (const [_type, statusStack] of actor.statuses) {
        const stackCount = statusStack.length;
        if (stackCount > 0) {
            const statusMults = statusStack[0].getStatusMultipliers(stackCount);
            incoming *= statusMults.incoming;
            outgoing *= statusMults.outgoing;
        }
    }

    return { incoming, outgoing };
}

/**
 * Performs any post effects (as in, after main damage calculation) associated with the player and opponents statuses, then ticks the statuses down.
 */
export function resolveStatuses(player: Actor, opponent: Actor) {
    performStatusPostEffects(player, opponent);
    performStatusPostEffects(opponent, player);

    player.tickAndRemoveStatuses();
    opponent.tickAndRemoveStatuses();
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