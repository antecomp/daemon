import { Status } from "./status";

/* simple record of a single status instance and a corresponding duration stack */
type StatusEntry = {
    status: Status,
    durationStack: number[]
}


/**
 * The `Combatant` class tracks the health and status effects of a combatant in the battle system. It provides methods for taking damage,
 * healing, adding and extending status effects, and ticking or reaping expired statuses.
 * 
 * @remarks
 * Statuses are handled in a "stack" of durations, where each time the same status is applied it's duration is individually tracked.
 * The 'level' of a status is then determined by how many simulatenous instances of said status are currently in the duration stack and nonzero
 * 
 *
 * @example
 * ```typescript
 * const c = new Combatant(100);
 * c.takeDamage(20);
 * c.heal(10);
 * c.addStatus(new Status, 3);
 * c.tickStatuses();
 * c.reapExpiredStatuses();
 * ```
 */
export class Combatant {
    readonly maxHealth: number;
    private _health: number;
    private statuses: Map<string, StatusEntry> = new Map();

    constructor(maxHealth: number) {
        this._health = this.maxHealth = maxHealth;
    }

    public takeDamage(amount: number) {
        this._health = Math.max(this._health - amount, 0);
    }

    public heal(amount: number) {
        this._health = Math.min(this.maxHealth, this._health + amount);
    }

    get healthPercent() {
        return this._health / this.maxHealth * 100;
    }

    get health() {
        return this._health;
    }

    get isDead() {
        return this._health <= 0;
    }


    /**
     * Adds a status effect to the combatant with a specified duration.
     * If the status already exists, the duration is added to its duration stack.
     * Otherwise, the status is initialized with the given duration.
     *
     * @param status - The status effect to add.
     * @param duration - The duration of the status effect (default is 1).
     */
    addStatus(status: Status, duration: number = 1) {
        if (this.statuses.has(status.name)) {
            this.statuses.get(status.name)!.durationStack.push(duration);
        } else {
            this.statuses.set(status.name, {
                status: status,
                durationStack: [duration]
            })
        }
    }

    tickStatuses() {
        for (const [_, entry] of this.statuses) {
            entry.durationStack = entry.durationStack.map(dur => dur - 1);
        }
    }

    /**
     * Retrieves the status object and its active level for a given status name.
     *
     * @param name - The name of the status to look up.
     * @returns A tuple containing the status object (or `undefined` if not found) and the number of active duration stacks (level).
     */
    getStatusAndLevel(name: string) {
        const entry = this.statuses.get(name);
        const stat = entry?.status;
        const level = entry?.durationStack.filter(dur => dur > 0).length
        return [stat, level];
    }

    /** Returns an array of active (non zero duration) Statuses, along with their level as a tuple */
    get activeStatuses() {
        const rtn = [] as [Status, number][];
        for (const [_, entry] of this.statuses) {
            const stat = entry.status;
            const level = entry.durationStack.filter(dur => dur > 0).length;
            if (level == 0) continue;
            rtn.push([stat, level])
        }
        return rtn;
    }

    getStatusLevel(name: string): number {
        const entry = this.statuses.get(name);
        if (!entry) return 0;
        else return entry.durationStack.filter(dur => dur > 0).length
    }

    // kinda jank but needed for PostEffects that need to know the status level before ticking.
    // better than the whole immediatePostEffect mess.
    // Avoid using this unless you know exactly why you need this. This is a goofy hack
    // to fix a logical error that arises from the whole status ticking thing.
    getStatusLevelIncludingExpired(name: string): number {
        const entry = this.statuses.get(name);
        if (!entry) return 0;
        return entry.durationStack.filter(dur => dur >= 0).length;
    }

    /**
     * Extends the duration of an existing status effect on the combatant.
     *
     * @param status - The status to extend, specified as a string key or a Status object.
     * @param amount - The amount to add to each duration in the status's duration stack. Defaults to 1.
     * 
     * @remarks
     * If the specified status does not exist on the combatant, this method does nothing.
     */
    extendStatus(status: string | Status, amount: number = 1) {
        const key = (typeof status === 'string') ? status : status.name
        const entry = this.statuses.get(key);
        if (!entry) return;
        entry.durationStack = entry.durationStack.map(dur => dur + amount);
    }

    /**
     * Removes expired statuses from the `statuses` map.
     * Iterates through all statuses and deletes any status whose `durationStack`
     * does not contain any positive duration values (i.e., all durations are zero or less).
     *
     * @remarks
     * This method is intended to clean up statuses that are no longer active
     * based on their duration stacks.
     */
    reapExpiredStatuses() {
        const keysToDelete = [];
        for (const [key, s] of this.statuses) {
            if (!s.durationStack.some(dur => dur > 0)) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) this.statuses.delete(key);
    }
}
