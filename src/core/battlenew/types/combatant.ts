import { Status } from "./status";

export class Combatant {
    //name: string; // <- is this even needed? UI will be a profile thing, wont read this. No need to track names for logic!
    maxHealth: number;
    health: number;
    statuses: Map<string, {
        status: Status,
        durationStack: number[]
    }> = new Map();

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

    addStatus(status: Status, duration: number) {
        if(this.statuses.has(status.name)) {
            // Any reason to push in sorted order? I don't think so.
            // Would spent more time sorting than just the O(N) checks lol.
            this.statuses.get(status.name)!.durationStack.push(duration);
        } else {
            this.statuses.set(status.name, {
                status: status,
                durationStack: [duration]
            })
        }
    }

    tickStatuses() {
        for(const [_, s] of this.statuses) {
            s.durationStack = s.durationStack.map(dur => dur -1);
        }
    }

    // getStatusAndLevel(name: string) {
    //     const entry = this.statuses.get(name);
    //     const stat = entry?.status;
    //     const level = entry?.durationStack.filter(dur => dur > 0).length
    //     return [stat, level];
    // }

    /** Returns an array of active (non zero duration) Statuses, along with their level as a tuple */
    get activeStatuses {
        const rtn = [] as [Status, number][];
        for(const [_, s] of this.statuses) {
            const stat = s.status;
            const level = s.durationStack.filter(dur => dur > 0).length;
            if (level == 0) continue;
            rtn.push([stat, level])
        }
        return rtn;
    }

    // Reference that short brainstorming page you made.
    // DOnt need tickUpStatus, make tick and remove seperate operations.
    // Flow is now tickButDontRemoveStatuses() -> postEffect() -> removeStaleStatuses();
    // Idea being: move postEffects can now look at all the stale statuses, and spawn an extra instance of the status for every stale version.

}