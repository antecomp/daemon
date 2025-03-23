import sleep from "@/util/sleep";
import { animationData, Move, moveAnimationStep, MoveContext, PostMoveContext } from "../moves/moves.types";

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
 * @param minimumAnimationTime - The delay to apply if no animations are present.
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
    minimumAnimationTime: number,
    debugMode?: boolean,
) {
    if (debugMode) return; // No animations at all.

    const animations = mergeAndSortAnimations(playerMove, opponentMove, phase);
    
   // ensure that the function always waits for at least the specified delay, regardless of 
   // whether animations are present or how long they take.
    await Promise.all([
        hasAnimations(animations)
            ? executeAnimations(animations, playerContext, opponentContext)
            : Promise.resolve(),
        sleep(minimumAnimationTime)
    ])
}