import { Actor } from "./actor";
import { MultiplierSet } from "./battle.types";
import vuln_icon from "@/assets/icons/statuses/vuln.png"
import prep_icon from "@/assets/icons/statuses/prep.png"

export abstract class Status {
    type: string;
    icon?: string
    duration: number;

    constructor(type: string, duration: number = 1, icon?: string) {
        this.type = type;
        this.duration = duration;
        this.icon = icon
    }

    /** Applies effect multipliers based on level, where level = stack depth (amount of times effect applied) */
    abstract getStatusMultipliers(level: number): MultiplierSet;

    applyPostEffect?(_self: Actor, _opponent: Actor) {/* noop */};

    /** Reduce duration */
    tick(): boolean {
        this.duration--;
        return this.duration <= 0;
    }
}

export function computeStatusMultipliers(actor: Actor): MultiplierSet {
    let incoming = 1;
    let outgoing = 1;

    for (const [_type, statusStack] of actor.statuses) {
        const stackCount = statusStack.length;
        if (stackCount > 0) {
            const statusMults = statusStack[0].getStatusMultipliers(stackCount);
            incoming *= statusMults.incoming;
            outgoing *= statusMults.outgoing;
        }
    }

    return { incoming, outgoing };
}



/* Effects Themselves............... (move to different file if this list gets too long.) */

export class VulnerableStatus extends Status {
    constructor(duration: number = 1) {
        super("vulnerable", duration, vuln_icon);
    }

    override getStatusMultipliers(level: number): MultiplierSet {
        // Change this based on whatever balancing you want.
        return { incoming: 1.5 ** level, outgoing: 1 }; // Increases damage taken
    }
}

export class WeakenedStatus extends Status {
    constructor(duration: number = 1) {
        super("weakened", duration);
    }

    getStatusMultipliers(level: number): MultiplierSet {
        return { incoming: 1, outgoing: 0.75 ** level }; // Reduces outgoing damage exponentially
    }
}

// I likely won't use this, but this serves as an example of what PostEffect can do.
export class PoisonStatus extends Status {
    constructor(duration: number = 3) {
        super("poison", duration);
    }

    getStatusMultipliers(_level: number): MultiplierSet {
        return { incoming: 1, outgoing: 1 }; // No damage scaling, but causes poison
    }

    applyPostEffect(self: Actor, _opponent: Actor) {
        // Keeping this constant out of laziness, but 
        // you can easily scale this on effect level.
        self.takeDamage(2);
    }
}

export class PreparedStatus extends Status {
    constructor(duration: number = 1) {
        super("prepared", duration, prep_icon);
    }

    // Prepared should not change these multipliers, instead it triggers 
    // special resulting behavior in each move.
    getStatusMultipliers(_level: number): MultiplierSet {
        console.log("focus check")
        return {incoming: 1, outgoing: 1}
    }
}

