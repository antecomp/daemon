import { Actor } from "../engine/actor";
import { MultiplierSet } from "../engine/battle.types";


/**
 * Represents an abstract status effect in the battle engine.
 * 
 * A `Status` defines a type of effect that can be applied to an actor in the game,
 * with a specific duration and optional icon.
 * - Statuses can change the damage multipliers for an actor (as provided by their getStatusMultipliers method)
 * - Statuses can also perform a (post damage eval) side effect callback, defined by their applyPostEffect method.
 */
export abstract class Status {
    type: string;
    icon?: string;
    duration: number;

    constructor(type: string, duration: number = 1, icon?: string) {
        this.type = type;
        this.duration = duration;
        this.icon = icon;
    }

    /** Applies effect multipliers based on level, where level = stack depth (amount of times effect applied) */
    abstract getStatusMultipliers(level: number): MultiplierSet;

    applyPostEffect?: (self: Actor, opponent: Actor, level: number) => void;

    // Not implemented because I don't have an explicit use case yet, but feel free to add a applyPreEffect.

    /** Reduce duration */
    tick(): boolean {
        this.duration--;
        return this.duration <= 0;
    }
}
