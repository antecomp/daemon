import { Status } from "./statuses";
import { Move } from "../moves/moves.types";

export class Actor {
    name: string;
    maxHealth: number;
    health: number;
    // Enforce uniqueness of effect with a map, but stack multiple of the same effect in an array.
    statuses: Map<string, Status[]> = new Map(); 
    //availableMoves: Move[]; // Full move pool (uneeded by Actor, moved to wrapper.)
    currentSequence: Move[]= [];

    // Track custom data and flags for advanced logic
    // Leaving this open for whatever that is needed.
    // As an example, Heal uses this to see if we should heal or skip.
    // Moves and whatever is responsible for maintaining this data tho, be smart :)
    data: {
        [key: string]: any
    } = {};

    constructor(name: string, maxHealth: number, /*availableMoves: Move[]*/) {
        this.name = name;
        this.maxHealth = maxHealth;
        this.health = maxHealth;
        //this.availableMoves = availableMoves
    }

    // Returns bool indicating if Actor is alive. Idk if ill end up using this or not.
    // If not I should just make a quick "isDead" method.
    public takeDamage(amount: number): boolean {
        this.health = Math.max(this.health - amount, 0);
        return this.health <= 0;
    }

    public heal(amount: number) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    public addStatus(status: Status) {
        if(!this.statuses.has(status.type)) {
            this.statuses.set(status.type, []);
        }

        let statusStack = this.statuses.get(status.type)!;

        statusStack.push(status);
        // Sort so pop gets the smaller duration one.
        statusStack.sort((a, b) => a.duration - b.duration);
    }

    public tickAndRemoveStatuses() {
        for (const [type, effectStack] of this.statuses) {

            // Tick every effect in an individual stack
            for(let i = 0; i < effectStack.length; i++) {
                effectStack[i].tick();
            }

            // Remove expired...
            while(effectStack.length > 0 && effectStack[0].duration <= 0) {
                effectStack.shift(); // this is why we need to sort.
            }

            if(effectStack.length == 0) {
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
        if (selectedMoves.length > 5) {
            throw new Error("Cannot select more than 5 moves in a sequence!");
        }
        this.currentSequence = selectedMoves;
    }

}