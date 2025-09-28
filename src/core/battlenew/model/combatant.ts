import { Status } from "./status";

/* simple record of a single status instance and a corresponding duration stack */
type StatusEntry = {
    status: Status,
    durationStack: number[]
}

export class Combatant {
    maxHealth: number;
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

    addStatus(status: Status, duration: number = 1) {
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

    getStatusAndLevel(name: string) {
        const entry = this.statuses.get(name);
        const stat = entry?.status;
        const level = entry?.durationStack.filter(dur => dur > 0).length
        return [stat, level];
    }

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

    getStatusLevel(name: string): number {
        const entry = this.statuses.get(name);
        if(!entry) return 0;
        else return entry.durationStack.filter(dur => dur > 0).length
    }

    extendStatus(status: string | Status, amount: number = 1) {
        const key = (typeof status === 'string') ? status : status.name
        const entry = this.statuses.get(key);
        if (!entry) return;
        entry.durationStack = entry.durationStack.map(dur => dur + amount);
    }

    reapExpiredStatuses() {
        for (const [key, s] of this.statuses) {
            if(!s.durationStack.some(dur => dur >0)) this.statuses.delete(key);
        }
    }
}
