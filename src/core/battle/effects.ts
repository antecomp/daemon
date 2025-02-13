import { Actor } from "./actor";
import { MultiplierSet } from "./battle.types";

export abstract class Effect {
    type: string;
    duration: number;

    constructor(type: string, duration: number = 1) {
        this.type = type;
        this.duration = duration;
    }

    /** Applies effect multipliers based on level, where level = stack depth (amount of times effect applied) */
    abstract getEffectMultipliers(level: number): MultiplierSet;

    applyPostEffect(_self: Actor, _opponent: Actor) {/* noop */};

    /** Reduce duration */
    tick(): boolean {
        this.duration--;
        return this.duration <= 0;
    }
}

export function computeEffectMultipliers(actor: Actor): MultiplierSet {
    let incoming = 1;
    let outgoing = 1;

    for (const [_type, effectStack] of actor.effects) {
        const stackCount = effectStack.length;
        if (stackCount > 0) {
            const effectMultipliers = effectStack[0].getEffectMultipliers(stackCount);
            incoming *= effectMultipliers.incoming;
            outgoing *= effectMultipliers.outgoing;
        }
    }

    return { incoming, outgoing };
}












/* Effects Themselves............... (move to different file?) */

export class VulnerableEffect extends Effect {
    constructor(duration: number = 1) {
        super("vulnerable", duration);
    }

    override getEffectMultipliers(level: number): MultiplierSet {
        return { incoming: 1.5 ** level, outgoing: 1 }; // Increases damage taken
    }
}

export class WeakenedEffect extends Effect {
    constructor(duration: number = 1) {
        super("weakened", duration);
    }

    override getEffectMultipliers(level: number): MultiplierSet {
        return { incoming: 1, outgoing: 0.75 ** level }; // Reduces outgoing damage exponentially
    }
}

// I likely won't use this, but this serves as an example of what PostEffect can do.
export class PoisonEffect extends Effect {
    constructor(duration: number = 3) {
        super("poison", duration);
    }

    override getEffectMultipliers(_level: number): MultiplierSet {
        return { incoming: 1, outgoing: 1 }; // No damage scaling, but causes poison
    }

    override applyPostEffect(self: Actor, _opponent: Actor) {
        // Keeping this constant out of laziness, but 
        // you can easily scale this on effect level.
        self.takeDamage(2);
    }
}

export class PreparedEffect extends Effect {
    constructor(duration: number = 1) {
        super("prepared", duration);
    }

    // Prepared should not change these multipliers, instead it triggers 
    // special resulting behavior in each move.
    override getEffectMultipliers(_level: number): MultiplierSet {
        return {incoming: 1, outgoing: 1}
    }
}

