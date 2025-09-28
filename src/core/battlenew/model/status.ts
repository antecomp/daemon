import { PASSTHROUGH_MULTPLIERS } from "../utils/battleUtils";
import { DamageMultipliers } from "./battle";

// can't enforce an override unfortunately, but we can make the default obnoxious!
const DEFAULT_STATUS_TYPE = "__EMPTY_STATUS_OVERRIDE_REQUIRED__";

export class Status {
    // doing this is referred to a a "class field" declaration. It creates a default value for all instances
    // that does not require the constructor to do anything (the constructor can override this though)
    // particular helpful for our child classes, so they can easily just declare their type in the
    // class definition and have no gross custom constructor that has to super for the same thing but w/ one change!
    name = DEFAULT_STATUS_TYPE;
    // might keep it like this just so I dont have an obnoxious mapping of status name -> icon. We dont need to be *that* anal about it.
    // we will see how everything else goes together.
    //icon?: AssetURL = undefined; // WHAT IS THIS UI SHIT DOING IN MY LOGICAL DESCRIPTOR!?!?!?!?!? >:O 

    // instead of abstract, we're gonna have a sensible default we override
    // (also makes working with status as a generic/interface easier for a lot of things)
    getStatusMultipliers(_level: number): DamageMultipliers {
        return PASSTHROUGH_MULTPLIERS
    }

    // omitting pre/post effect stuff as we never used it. Feel free to add LATER.
}


// Now statuses inherit the (essentially passthru) getStatusMultipliers of the base class.
// Useful for statuses that are instead flags to moves (f.e prepared with its single-sided bonuses),
// No need to repeat ourselves with a generic {in: 1; out: 0}
export class FlagStatus extends Status {
    name = "flagstatus";
    // constructor automatically inherited. No more annoying super calls!
}

// But when we have a status that changes combat multipliers, we can easily override!
// So we can just as easily implement statuses like Vulnerable...
export class CombatStatus extends Status {
    name = "combatstatus";
    // no icon, inherit default from Status (which rn is just undefined but we could totally have a stock icon!)

    // override status multipliers with whatever this status does...
    getStatusMultipliers(level: number): DamageMultipliers {
        return {incoming: 1, outgoing: 2 ** level}
    }
}