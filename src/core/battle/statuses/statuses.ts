import { MultiplierSet } from "../engine/battle.types";
import vuln_icon from "@/assets/icons/statuses/vuln.png"
import prep_icon from "@/assets/icons/statuses/prep.png"
import mania_icon from "@/assets/icons/statuses/mania.png"
import { Status } from "./status.types";

export class VulnerableStatus extends Status {
    constructor(duration: number = 1) {
        super("vulnerable", duration, vuln_icon);
    }

    override getStatusMultipliers(level: number): MultiplierSet {
        // Change this based on whatever balancing you want.
        return { incoming: 1.5 ** level, outgoing: 1 }; // Increases damage taken
    }
}

export class PreparedStatus extends Status {
    constructor(duration: number = 1) {
        super("prepared", duration, prep_icon);
    }

    // Prepared should not change these multipliers, instead it triggers 
    // special resulting behavior in each move.
    getStatusMultipliers(_level: number): MultiplierSet {
        return {incoming: 1, outgoing: 1}
    }
}

export class ManiaStatus extends Status {
    constructor(duration: number = 1) {
        super("mania", duration, mania_icon)
    }

    getStatusMultipliers(level: number): MultiplierSet {
        return {incoming: 1, outgoing: 2 ** level}
    }
}


// ==== Below are some unused examples ====

// export class WeakenedStatus extends Status {
//     constructor(duration: number = 1) {
//         super("weakened", duration);
//     }

//     getStatusMultipliers(level: number): MultiplierSet {
//         return { incoming: 1, outgoing: 0.75 ** level }; // Reduces outgoing damage exponentially
//     }
// }

// Example usage of post effect.
// export class PoisonStatus extends Status {
//     constructor(duration: number = 3) {
//         super("poison", duration);
//     }

//     getStatusMultipliers(_level: number): MultiplierSet {
//         return { incoming: 1, outgoing: 1 }; // No damage scaling, but causes poison
//     }

//     applyPostEffect = (self: Actor, _opponent: Actor) => {
//         // Keeping this constant out of laziness, but 
//         // you can easily scale this on effect level.
//         self.takeDamage(2);
//     }
// }