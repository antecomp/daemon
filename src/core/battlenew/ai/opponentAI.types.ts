import { BattleEngineDependencies } from "../engine/battleEngine";
import { Combatant } from "../model/combatant";
import { PlannedSequence } from "../model/plannedmove";
import { Sides } from "../utils/sides.utils";

export type OpponentAIBehaviorPredicateArgs = {combatants: Sides<Combatant>}
export type OpponentAIBehaviorDeps = {combatants: Sides<Combatant>, engineDeps: BattleEngineDependencies}; // Add as needed. Be careful with how state is being modified!

export interface OpponentAIBehavior {
    key: string;
    when?: (args: OpponentAIBehaviorPredicateArgs) => boolean;
    run: (deps: OpponentAIBehaviorDeps) => void;
    once?: boolean
}

// Feels a bit silly having an interface with only one property but meh
// any data needed to initialize the opponent combatant.
export interface OpponentStats {
    maxHealth: number // for Combatant constuctor.
    // could also do stuff like initial statuses if u want.
}


/**
 * This interface defines the contract for implementing AI behavior for an opponent,
 * including move selection and optional pre- and post-round behaviors.
 *
 * @property getSequence - A function that determines the sequence of planned moves for the AI,
 *   given the AI's own combatant state and the player's combatant state.
 *
 * @property preRoundBehavior - (Optional) A function executed before a round starts, allowing
 *   the AI to perform side effects or context-specific logic.
 *
 * @property postRoundBehavior - (Optional) A function executed after a round ends, allowing
 *   the AI to perform side effects or context-specific logic.
 */
export interface OpponentAI {
    getSequence: (me: Combatant, player: Combatant) => PlannedSequence;

    behaviors?: {
        preRound?: OpponentAIBehavior[];
        postRound?: OpponentAIBehavior[]; // Feel free to expand this if you want the postRound to have unique predicates/deps
    }
}