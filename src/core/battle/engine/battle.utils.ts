import { animationData, Move, MoveContext, MoveMeta, MoveType, PostMoveContext } from "../moves/moves.types";
import { Actor } from "./actor";
import { MultiplierSet } from "./battle.types";
import { computeStatusMultipliers } from "./statuses";

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
    // Evil type magic to make this properly cast to MoveContext or PostMoveContext.
    type ContextType = TP extends "pre" ? MoveContext : PostMoveContext;
    const playerAnimations = (playerMove.animations?.[phase] || []) as animationData<ContextType>[];
    const opponentAnimations = (opponentMove.animations?.[phase] || []) as animationData<ContextType>[];

    const groupedAnimations = new Map<number, {player: ((ctx: ContextType) => Promise<void>)[], opponent: ((ctx: ContextType) => Promise<void>)[]}>();

    for (const animation of playerAnimations) {
        if (!groupedAnimations.has(animation.priority)) {
            groupedAnimations.set(animation.priority, {player: [], opponent: []});
        }
        groupedAnimations.get(animation.priority)!.player.push(animation.execute as (ctx: ContextType) => Promise<void>);
    }

    for (const animation of opponentAnimations) {
        if (!groupedAnimations.has(animation.priority)) {
            groupedAnimations.set(animation.priority, {player: [], opponent: []});
        }
        groupedAnimations.get(animation.priority)!.opponent.push(animation.execute as (ctx: ContextType) => Promise<void>);
    };
    return groupedAnimations;
}

/** Execute animations in order of priority. Used in tandem with mergeAndSortAnimations.
 * @argument animations - The animations to execute, grouped by priority.
 * @argument playerContext - The context to pass to player animations.
 * @argument opponentContext - The context to pass to opponent animations
 */
export async function executeAnimations<contextType = MoveContext | PostMoveContext>(
    animations: Map<number, {player: ((ctx: contextType) => Promise<void>)[], opponent: ((ctx: contextType) => Promise<void>)[]}>, 
    playerContext: contextType,
    opponentContext: contextType
) {
    // Sort priorities before iteration, since our Map keys are just in order of being added.
    const sortedPriorities = [...animations.keys()].sort((a, b) => a - b);

    for (const priority of sortedPriorities) {
        const { player, opponent } = animations.get(priority)!;

        await Promise.all([
            Promise.all(player.map((animation) => animation(playerContext))),
            Promise.all(opponent.map((animation) => animation(opponentContext)))
        ]);
    }
}

/** Helper to check if we have any animations.
 * Used in battle logic to subsitute a delay for animations if there are none.
 * @argument animations - The animations to check (grabbed from mergeAndSortAnimations)
 * @returns true if there are any animations, false otherwise.
 */
export function hasAnimations(animations: Map<number, {
    player: ((ctx: PostMoveContext) => Promise<void>)[];
    opponent: ((ctx: PostMoveContext) => Promise<void>)[];
}>): boolean {
    for (const animList of animations.values()) {
        if (animList.player.length > 0
            || animList.opponent.length > 0
        ) {
            return true;
        }
    }
    return false;
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