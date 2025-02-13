import { Effect } from "./effects";
import { Move } from "./moves";

export class Actor {
    name: string;
    maxHealth: number;
    health: number;
    // Enforce uniqueness of effect with a map, but stack multiple of the same effect in an array.
    effects: Map<string, Effect[]> = new Map(); 
    moves: Move[]; // Full move pool
    currentSequence: Move[] = [];

    constructor(name: string, maxHealth: number, moves: Move[]) {
        this.name = name;
        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.moves = moves;
    }

    // Returns bool indicating if Actor is alive. Idk if ill end up using this or not.
    // If not I should just make a quick "isDead" method.
    public takeDamage(amount: number): boolean {
        this.health -= amount;
        return this.health <= 0;
    }

    public heal(amount: number) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    public addEffect(effect: Effect) {
        if(!this.effects.has(effect.type)) {
            this.effects.set(effect.type, []);
        }

        let effectStack = this.effects.get(effect.type)!;

        effectStack.push(effect);
        // Sort so pop gets the smaller duration one.
        effectStack.sort((a, b) => a.duration - b.duration);
    }

    public tickAndRemoveEffects() {
        for (const [type, effectStack] of this.effects) {

            // Tick every effect in an individual stack
            for(let i = 0; i < effectStack.length; i++) {
                effectStack[i].tick();
            }

            // Remove expired...
            while(effectStack.length > 0 && effectStack[0].duration <= 0) {
                effectStack.shift(); // this is why we need to sort.
            }

            if(effectStack.length == 0) {
                this.effects.delete(type);
            }
        }
    }
    
    public getEffectLevel(type: string): number {
        return this.effects.has(type) ? this.effects.get(type)!.length : 0;
    }

    public setMoveSequence(selectedMoves: Move[]) {
        if (selectedMoves.length > 5) {
            throw new Error("Cannot select more than 5 moves in a sequence!");
        }
        this.currentSequence = selectedMoves;
    }

}