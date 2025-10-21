import { DamageMultipliers } from "../model/battle";
import { Status } from "../model/status";

export class PreparedStatus extends Status {
    name = 'prepared'
    // Prepared should not change the multipliers, instead it triggers 
    // special resulting behavior in each move.
}

export class ManiaStatus extends Status {
    name = 'mania'
    getStatusMultipliers(level: number): DamageMultipliers {
        return {
            incoming: 1,
            outgoing: 2 ** level
        }
    }
}

export class VulnerableStatus extends Status {
    name = 'vulnerable';

    getStatusMultipliers(level: number): DamageMultipliers {
        return {
            incoming: 1.5 ** level,
            outgoing: 1
        };
    }
}
