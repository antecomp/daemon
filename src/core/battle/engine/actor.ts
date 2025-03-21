import { Status } from "./status.types";
import { Move } from "../moves/moves.types";
import { SEQUENCE_LENGTH } from "./battle.config";


type damageCallback = (damage: number, health: number) => void;
/**
 * Actor is a simple container tracking the health, statuses and move sequence of either the player or an opponent
 * within the battle system.
 * @prop name: Name used for flair text.
 * @prop maxHealth: initial health and health cap upon healing
 * @prop statuses: set by addStatus, a map of status names to multiple status instances (to track unique durations)
 * @prop currentSequence: Holds array for the Actors current move sequence. Iterated over for sequence evaluation. 
 * Can also be referenced directly for move-synergy specific logic (i.e Overwhelms check for move type);
 */
export class Actor {
    name: string;
    maxHealth: number;
    health: number;
    /** Stack of statuses applied to the actor, holding multiple instances of the same status (to track several durations). */
    statuses: Map<string, Status[]> = new Map(); 
    currentSequence: Move[]= [];

    // Observer pattern to trigger callbacks when Actor takes damage.
    
    private damageSubscribers = new Set<damageCallback>();

    // Track custom data and flags for advanced logic
    // Leaving this open for whatever that is needed.
    // Moves and whatever is responsible for maintaining this data tho, be smart :)
    // TODO: This is honestly super lazy and stupid. Expand the class and define a custom schema PLEASE.
    // Since this is only used for debug flags right now I'm leaving it.
    data: {
        [key: string]: any
    } = {};

    constructor(name: string, maxHealth: number) {
        this.name = name;
        this.maxHealth = maxHealth;
        this.health = maxHealth;
    }

    public takeDamage(amount: number) {
        this.health = Math.max(this.health - amount, 0);
        if (amount > 0) this.notifySubscribers(Math.abs(amount));
    }

    public heal(amount: number) {
        this.health = Math.min(this.maxHealth, this.health + amount);
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

    /** Decrease the duration of all statuses by 1, remove any statuses who have reached a >0 duration. */
    public tickAndRemoveStatuses() {
        for(const [type, statusStack] of this.statuses) {
            statusStack.forEach(status => status.tick());

            const remainingStatuses = statusStack.filter(status => status.duration > 0);

            if(remainingStatuses.length > 0) {
                this.statuses.set(type, remainingStatuses);
            } else {
                this.statuses.delete(type);
            }
        }
    }

    /** Increment Duration of all instances of an status. Used for extending statuses to next move eval */
    public tickUpStatus(effectName: string, amount: number) {
        if(this.statuses.has(effectName)) {
            let updatedEffects = this.statuses.get(effectName)?.map(effect => {
                effect.duration += amount;
                return effect;
            }) || [];

            this.statuses.set(effectName, updatedEffects);
            console.log(`${this.name}'s ${effectName} effects have been extended by ${amount} turns.`);
        }
    }
    
    public getStatusLevel(type: string): number {
        return this.statuses.has(type) ? this.statuses.get(type)!.length : 0;
    }

    public setMoveSequence(selectedMoves: Move[]) {
        if (selectedMoves.length > SEQUENCE_LENGTH) {
            throw new Error("Cannot select more than 5 moves in a sequence!");
        }
        this.currentSequence = selectedMoves;
    }

    /** Attach callback that fires whenever Actor takes nonzero damage. */
    public onDamageTaken(callback: damageCallback) {
        this.damageSubscribers.add(callback);
    }

    private notifySubscribers(damage: number) {
        for (const cb of this.damageSubscribers) cb(damage, this.health);
    }

}