import { Combatant } from "../model/combatant";
import { PlannedMove } from "../model/plannedmove";

// Feels a bit silly having an interface with only one property but meh
// any data needed to initialize the opponent combatant.
export interface OpponentStats {
    maxHealth: number // for Combatant constuctor.
    // could also do stuff like initial statuses if u want.
}

export interface OpponentAI {
    getSequence: (me: Combatant, player: Combatant) => PlannedMove[];

    // consider making these return some information that may be needed context-wise for UI or whatever.
    preRoundBehavior?: (me: Combatant, player: Combatant, /*ctx: any <- for side effects*/) => void;
    postRoundBehavior?: (me: Combatant, player: Combatant, /*ctx: any <- for side effects*/) => void;
}