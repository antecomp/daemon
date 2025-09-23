import { Status } from "./status";

export class Actor {
    name: string;
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

    constructor(name: string, maxHealth: number) {
        this.name = name;
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

    /** Add a new status or stack upon existing status */
    public addStatus(status: Status) {
        const statusStack = this.statuses.get(status.type) ?? [];

       // Insert status in sorted order
       let i = statusStack.findIndex(existing => existing.duration > status.duration);
       if(i === -1) { // New status
        statusStack.push(status);
       } else {
        statusStack.splice(i, 0, status);
       }

       this.statuses.set(status.type, statusStack);
    }

    // Reference that short brainstorming page you made.
    // Flow is now tickButDontRemoveStatuses() -> postEffect() -> removeStaleStatuses();
    // Idea being: move postEffects can now look at all the stale statuses, and spawn an extra instance of the status for every stale version.

    getStatusLevel(type: string): number {
        const statusStack = this.statuses.get(type)
        if (!statusStack) return 0;
        const activeStatuses = statusStack.filter(status => !status.isExpired());
        return activeStatuses.length;
    }
}