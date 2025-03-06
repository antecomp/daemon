import { animationData, Move, MoveContext, MoveMeta, MoveResolution, MoveType, PostMoveContext, SequenceBuffer } from "../moves/moves.types";
import { Actor } from "./actor";
import { BattleUIState } from "./battle.context";
import { ActionMessageAppender, MultiplierSet } from "./battle.types";
import { computeStatusMultipliers } from "./statuses";

/** Generate a clone of a sequence with a few of the elements redacted as undefined. */
export const generateHint = (seq: MoveMeta[]): (MoveMeta | undefined)[] => {
    const indices = new Set<number>

    while (indices.size < 3) {
        indices.add(Math.floor(Math.random() * seq.length));
    }

    return seq.map((item, index) => indices.has(index) ? undefined : item);
}

// When adding a new move type, register it here also.
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

/** Reduce through a moves multipliers properties, returning the combined multipliers. */
export function computeMoveMultipliers(initialMultipliers: MultiplierSet, move: Move, context: MoveContext): MultiplierSet {
    if (!move.behaviors.multpipeline) return initialMultipliers; // No multipliers to apply.

    return move.behaviors.multpipeline.reduce(
        (currentMults, step) => step(currentMults, context), 
        initialMultipliers
    );
}

export function combineMultiplierSets(...sets: MultiplierSet[]) {
    return sets.reduce((acc: MultiplierSet, set) => {
        return {
            outgoing: acc.outgoing * set.outgoing,
            incoming: acc.incoming * set.incoming
        }
    }, {incoming: 1, outgoing: 1})
}

/** Extracts the underlying Move information from MoveMeta sequence, allows us to do preprocessing logic for dynamic moves. */
export function unwrapMoveMetaSequence(self: Actor, seq: MoveMeta[], opponent: Actor, opponentSeq: MoveMeta[]): Move[] {
    return seq.map((meta, index) => {
        
        // getMove has some special logic that will return a move.
        if(typeof meta.getMove == "function") {
            return meta.getMove({self, seq, index, opponent, opponentSeq});
        }
        
        return meta.getMove;
    })
}

/** Runs PreEffects and Mult Pipeline For A Given Move + ActorSet */
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


// Runs once for every instance of a status (i.e multiple times if the status is stacked). TODO: change to be level based.
export function performStatusPostEffects(actor: Actor, opponent: Actor) {
    for (const effectStack of actor.statuses.values()) {
        effectStack.forEach((status) => status.applyPostEffect && status.applyPostEffect(actor, opponent));
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
        // Just manually rebuild the context here, doesn't matter.
            effect(context)
        }
    );
}

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

// Actual close logic goes here later xdddd
// This handler is retarded, move to an effect to sync with UI
export function handleDeath(who: "player" | "opponent") {
    if(who == "player") {
        alert("you are loser.");
    }
    if(who == "opponent") {
        alert("you are winner.");
    }
}

export function deathCheckpoint(player: Actor, opponent: Actor) {
    // Done first, we will technically let the player win on both dead event.
    if(opponent.health == 0) {
        handleDeath("opponent");
        return true;
    }

    if(player.health == 0) {
        handleDeath("player");
        return true;
    }

    return false;
}