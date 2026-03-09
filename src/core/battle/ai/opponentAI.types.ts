/** @fileoverview - Types and interfaces for Opponent AI (battle logic) */

import { BattleEngineDependencies } from "../engine/battleEngine";
import { Combatant } from "../model/combatant";
import { PlannedSequence } from "../model/plannedMove";
import { Sides } from "../utils/sides.utils";

/** Required fields for an OpponentAI Behavior Predicate (when clause), for making contextual decision on if a behavior should be run. */
export type OpponentAIBehaviorPredicateArgs = {combatants: Sides<Combatant>}

/** Required dependencies for an Opponent AI behavior to carry out various functions. (f.e combatants for opponent to modify state of its Combatant.)  */
export type OpponentAIBehaviorDeps = {combatants: Sides<Combatant>, engineDeps: BattleEngineDependencies}; // Add as needed. Be careful with how state is being modified!

/**
 * Opponent AI behaviors are side effects ran by the battle engine, as part of the Opponent AI declaration. This can be used for context-based changes to battle state.
 * For example, this can be used by an opponent to apply a certain status as part of a phase change.
 * 
 * Each behavior has a...
 * @property `key` - .Used for internal tracking, can be anything as long as it's unique per behavior.
 * @property run `(deps: OpponentAIBehaviorDeps)` => void;` The actual behavior side-effect. Takes in dependencies {@link OpponentAIBehaviorDeps} to perform needed actions.
 * And can optionally take...
 * @property `when (args: OpponentAIBehaviorPredicateArgs)` - A predicate for if the behavior should run at all. 
 *           Use this instead of conditionals inside `run`. Takes in context {@link OpponentAIBehaviorPredicateArgs}
 * @property `once` - Apply if this effect should only run one time.
*/
export interface OpponentAIBehavior {
    key: string;
    when?: (args: OpponentAIBehaviorPredicateArgs) => boolean;
    run: (deps: OpponentAIBehaviorDeps) => Promise<void> | void;
    once?: boolean
}

/** OpponentAI describes the logic and behavior for a given battle opponent.
 * @property `getSequence(me: Combatant, player: Combatant)` - A method that reads current Player/Opponent Combatant state (for making contextual decisions) and returns the opponents planned sequence.
 * @property behaviors - Opponent Behaviors (side effects) to run. 
 *    - Has two arrays of behaviors (@ref OpponentAIBehavior), where `preRound` runs before the round starts (right after player execute), and `postRound` runs when the round ends (but before new plans have been generated)
 */
export interface OpponentAI {
    /** A method that reads current Player/Opponent Combatant state (for making contextual decisions) and returns the opponents planned sequence.  */
    getSequence: (me: Combatant, player: Combatant) => PlannedSequence;

    /** Opponent Behaviors (side effects) to run.  */
    behaviors?: {
        /** Behaviors to run right as round starts (executeRound called) */
        preRound?: OpponentAIBehavior[];
        /** Behaviors to run when the round ends (but before next setupRound) */
        postRound?: OpponentAIBehavior[]; // Feel free to expand this if you want the postRound to have unique predicates/deps
    }
}