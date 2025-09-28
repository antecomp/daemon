import { PASSTHROUGH_MULTPLIERS } from "./battle";
import { DamageMultipliers } from "./battle";

// can't enforce an override unfortunately, but we can make the default obnoxious!
const DEFAULT_STATUS_TYPE = "__EMPTY_STATUS_OVERRIDE_REQUIRED__";

export class Status {
    /** Class Field Declaration Of Status Name -- Used for keying statuses in Combatant by name and other checks. 
     * All new statuses must override this with their own unique name! */
    name = DEFAULT_STATUS_TYPE;

    // Sensible default for status. Override this to add multipler effects.
    getStatusMultipliers(_level: number): DamageMultipliers {
        return PASSTHROUGH_MULTPLIERS
    }

    // omitting pre/post effect stuff as we never used it. Feel free to add.
}

/*
Example; Simple 'flag' statuses (that moves can check for to change behavior) are declared like this;
export class FlagStatus extends Status {
    name = "flagstatus";
}

Example; Combat-oriented statuses that change damage multipliers look like this;
export class CombatStatus extends Status {
    name = "combatstatus";
    // no icon, inherit default from Status (which rn is just undefined but we could totally have a stock icon!)

    // override status multipliers with whatever this status does...
    getStatusMultipliers(level: number): DamageMultipliers {
        return {incoming: 1, outgoing: 2 ** level}
    }
}
*/