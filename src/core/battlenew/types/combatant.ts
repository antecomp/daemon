import { Status } from "./status";

export class Combatant {
    //name: string; // <- is this even needed? UI will be a profile thing, wont read this. No need to track names for logic!
    maxHealth: number;
    health: number;
    /** Stack of statuses applied to the actor, holding multiple instances of the same status (to track several durations). */
    statuses: Map<string, Status[]> = new Map();
    // current sequence should be uneeded! All uses of sequence just pull it out of actor, but don't care about the actor itself.
    // Sequence can stand on its own!
    // only relevant use is context.opponent.currentSquence in some move evals, but we can just incorporate 
    // the two sequences into the context on its own?

    // remove damageSubscribers - obvious reasons.

    // Remove data: was unused except for testing one thing that could be checked by other means.

    constructor(maxHealth: number) {
        this.health = this.maxHealth = maxHealth;
    }

    public takeDamage(amount: number) {
        this.health = Math.max(this.health - amount, 0);
    }

    public heal(amount: number) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    get healthPercent() {
        return this.health / this.maxHealth * 100;
    }

    get isDead() {
        return this.health <= 0;
    }

    /** Add a new status or stack upon existing status */
    public addStatus(status: Status) {
        const statusStack = this.statuses.get(status.name) ?? [];

       // Insert status in sorted order
       let i = statusStack.findIndex(existing => existing.duration > status.duration);
       if(i === -1) { // New status
        statusStack.push(status);
       } else {
        statusStack.splice(i, 0, status);
       }

       this.statuses.set(status.name, statusStack);
    }

    // Reference that short brainstorming page you made.
    // DOnt need tickUpStatus, make tick and remove seperate operations.
    // Flow is now tickButDontRemoveStatuses() -> postEffect() -> removeStaleStatuses();
    // Idea being: move postEffects can now look at all the stale statuses, and spawn an extra instance of the status for every stale version.

    getStatusLevel(type: string): number {
        const statusStack = this.statuses.get(type)
        if (!statusStack) return 0;
        const activeStatuses = statusStack.filter(status => !status.isExpired());
        return activeStatuses.length;
    }

    // return a tupe of a single instance of any status we have (nonExpired), alongside it's level (stack depth, # of instances of status applied, use to scale status output) 
    get activeStatusLevels(): [Status, number][] {
        const out: [Status, number][] = [];
        for (const [_, stack] of this.statuses) {
            const active = stack.filter(s => !s.isExpired());
            if (active.length) out.push([active[0], active.length]);
        }
        return out;
    }

    tickStatuses() {
        for(const [_type, stack] of this.statuses) {
                stack.forEach(status => status.tick());
        }
    }

    reapExpiredStatuses() {
        for(const [type, stack] of this.statuses) {
            const remaining = stack.filter(status => !status.isExpired());
            if(remaining.length > 0) {
                this.statuses.set(type, remaining);
            } else {
                this.statuses.delete(type);
            }
        }
    }

}