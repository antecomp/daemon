import { Move, MoveContext, MoveMeta, movetype, SequenceBuffer } from "../moves/moves.types";
import { Actor } from "./actor";
import { MultiplierSet } from "./battle.types";
import { computeEffectMultipliers } from "./effects";

export const generateHint = (seq: MoveMeta[]): (MoveMeta | undefined)[] => {
    const indices = new Set<number>

    while (indices.size < 3) {
        indices.add(Math.floor(Math.random() * seq.length));
    }

    return seq.map((item, index) => indices.has(index) ? undefined : item);
}

export function getBaseMultipliers(type: movetype): MultiplierSet {
    return {
        "Aggressive":   {incoming: 1, outgoing: 1},
        "Passive":      {incoming: 1, outgoing: 0}
    }[type]
}

export function performMultPipeline(initialMultipliers: MultiplierSet, move: Move, context: MoveContext): MultiplierSet {
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
export function unwrapMoveMetaSequence(self: Actor, seq: MoveMeta[]): Move[] {
    return seq.map((meta, index) => {
        if(typeof meta.getMove == "function") { // getMove has some special logic that will return a move.
            return meta.getMove({self, seq, index});
        } else { // We just have a move straight-up
            return meta.getMove;
        }
    })
}

/** Runs PreEffects and Mult Pipeline For A Given Move + ActorSet */
export function prepareMove(
    actor: Actor,
    opponent: Actor,
    moveIndex: number,
    sequenceBuffer: SequenceBuffer
): MultiplierSet {
    
    const move = actor.currentSequence[moveIndex];

    const context: MoveContext = {
        self: actor,
        opponent: opponent,
        index: moveIndex,
        sequence: actor.currentSequence,
        sequenceBuffer: sequenceBuffer,
    }

    // Add buffer entry at index.
    if (!sequenceBuffer[moveIndex]) sequenceBuffer[moveIndex] = {};

    move.behaviors.preEffects?.forEach((effect) => effect(context));

    const baseMultipliers = getBaseMultipliers(move.type);
    const moveMultipliers = performMultPipeline(baseMultipliers, move, context);
    const effectMultipliers = computeEffectMultipliers(actor);

    const finalMultipliers = combineMultiplierSets(effectMultipliers, moveMultipliers);

    return finalMultipliers;
}

/** Runs Side Effects After Damage Calculation, From Move and Statuses */
export function handlePostMove(
    actor: Actor,
    opponent: Actor,
    moveIndex: number,
    sequenceBuffer: SequenceBuffer
) {
    // Apply post-effects from ongoing actor effects
    // Might be worth making this a method of actor.
    for (const effectStack of actor.effects.values()) {
        effectStack.forEach((effect) => effect.applyPostEffect(actor, opponent));
    }

    // Remove expired effects
    actor.tickAndRemoveEffects();

    // Run Move PostEffect *last* so it can apply effects for
    // the next turn that won't be ticked off.
    const move = actor.currentSequence[moveIndex];
    move.behaviors.postEffects?.forEach((effect) =>
        // Just manually rebuild the context here, doesn't matter.
        effect({
            self: actor,
            opponent: opponent,
            index: moveIndex,
            sequence: actor.currentSequence,
            sequenceBuffer: sequenceBuffer,
        })
    );
}