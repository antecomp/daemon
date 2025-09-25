import { Status } from "./status";

/* simple record of a single status instance and a corresponding duration stack */
type StatusEntry = {
    status: Status,
    durationStack: number[]
}

export class Combatant {
    //name: string; // <- is this even needed? UI will be a profile thing, wont read this. No need to track names for logic!
    maxHealth: number;
    health: number;
    private statuses: Map<string, StatusEntry> = new Map();

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
            this.statuses.get(status.name)!.durationStack.push(duration);
        } else {
            this.statuses.set(status.name, {
                status: status,
                durationStack: [duration]
            })
        }
    }

    tickStatuses() {
        for(const [_, entry] of this.statuses) {
            entry.durationStack = entry.durationStack.map(dur => dur -1);
        }
    }

    // getStatusAndLevel(name: string) {
    //     const entry = this.statuses.get(name);
    //     const stat = entry?.status;
    //     const level = entry?.durationStack.filter(dur => dur > 0).length
    //     return [stat, level];
    // }

    /** Returns an array of active (non zero duration) Statuses, along with their level as a tuple */
    get activeStatuses() {
        const rtn = [] as [Status, number][];
        for(const [_, entry] of this.statuses) {
            const stat = entry.status;
            const level = entry.durationStack.filter(dur => dur > 0).length;
            if (level == 0) continue;
            rtn.push([stat, level])
        }
        return rtn;
    }

    // No longer requires immediatePostEffect run, as this will revive any ticked statuses
    // (from 0 to amount) before the reap stage!
    // use the helper here!
    extendStatus(name: string, amount: number) {
        const entry = this.statuses.get(name);
        if (!entry) return;
        entry.durationStack = entry.durationStack.map(dur => dur + amount);
    }

    reapExpiredStatuses() {
        for (const [key, s] of this.statuses) {
            if(!s.durationStack.some(dur => dur >0)) this.statuses.delete(key);
        }
    }

    // Notice how we never have any stuff for stale/expired statuses now,
    // as that logic shouldn't really be relevant to anyone else,
    // they can just call extendStatus and have an expectation of behavior!

}
