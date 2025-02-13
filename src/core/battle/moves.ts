import { Actor } from "./actor";
import { MultiplierSet } from "./battle.types";
import { PreparedEffect, VulnerableEffect } from "./effects";

export abstract class Move {
    name: string = "NULL_MOVE (OH FUCK DEBUG TIME)"
    abstract getMultipliers(actor: Actor): MultiplierSet;
    applyPreEffect(_self: Actor, _opponent: Actor) {};
    applyPostEffect(_self: Actor, _opponent: Actor) {};
}

class PassiveMove extends Move {
    override getMultipliers(_actor: Actor): MultiplierSet {
        return { incoming: 1, outgoing: 0 }; // Passive moves don't deal damage
    }
}

class AggressiveMove extends Move {
    name = "Generic Attack"
    override getMultipliers(actor: Actor): MultiplierSet {
        const incoming = 1;
        // Scale outgoing damaged by prepared status. 
        // (Any aggresive move will be scaled by prepare)
        let outgoing = 1 * Math.pow(2, actor.getEffectLevel("prepared"));

        // Below is an example of what NOT to do. Ref weakened. It already scales!
        // Never do this when the behavior is *consistent across move types* (Aggressive/Passive)
        //outgoing *= Math.pow(0.5, actor.getEffectLevel("weakened"));
        return { incoming, outgoing}; // Default attack multiplier
    }
}


// Likely when/if we have a larger subset of moves, we will want to move these to a seperate file
// Or potentially even instantiate them per-enemy.


export const Attack = new AggressiveMove(); // Utilize default behavior. Basic Attack.

// Utilize complex imediate instiation w/ override for very specific moves.
// Such as one that *requires* prepared.
export const StrongAttack = new (class extends AggressiveMove {
    name = "Strong Attack"
    override getMultipliers(actor: Actor): MultiplierSet {
        let mults = super.getMultipliers(actor);
        if (actor.getEffectLevel("prepared") > 0) {
            mults.outgoing *= 5;
        }
        return mults;
    }
})();

// Moves that simply do extra damage, or multiply output in some way
// are pretty simple too...
export const Fireball = new (class extends AggressiveMove {
    name = "Fireball"
    override getMultipliers(actor: Actor): MultiplierSet {
        let mults = super.getMultipliers(actor);
        // This scales the already existing mults,
        // So a prepared fireball is 2 * 1.25 (where 2 is gathered from the super call)
        mults.outgoing *= 1.25 
        return mults;
    }
})()


/// Passive Moves
export const Defend = new(class extends PassiveMove {
    name = "Defend"
    override getMultipliers(actor: Actor): MultiplierSet {
        let {incoming, outgoing} = super.getMultipliers(actor);
        incoming *= Math.pow(0.5, actor.getEffectLevel("prepared") + 1);
        return {incoming, outgoing}
    }
})()



export const Prepare = new (class extends PassiveMove {
    name = "Prepare"
    applyPreEffect(self: Actor, _opponent: Actor): void {
        console.log(`${self.name} becomes Vulnerable due to Preparing!`);
        self.addEffect(new VulnerableEffect(1)); // Applies Vulnerability before execution
    }

    applyPostEffect(self: Actor, _opponent: Actor): void {
        console.log(`${self.name} is now Prepared!`);
        self.addEffect(new PreparedEffect(1)); // Applies Prepared for the next move pairing
    }
})();

export const Heal = new (class extends PassiveMove {
    name = "Heal"
    applyPreEffect(self: Actor, _opponent: Actor): void {
        console.log(`${self.name} is temporarily Vulnerable while healing!`);
        self.addEffect(new VulnerableEffect(1)); // Applies Vulnerability before execution
    }

    applyPostEffect(self: Actor, _opponent: Actor): void {
        console.log(`${self.name} heals for 20 HP!`);
        self.heal(20); // Change this to scale based on prepared level
    }
})();

export const Observe = new (class extends PassiveMove {
    name = "Observe"
    applyPostEffect(_self: Actor, opponent: Actor): void {
        opponent.addEffect(new VulnerableEffect(1));
    }
})();

export const Evade = new (class extends PassiveMove {
    name = "Evade"
    override getMultipliers(actor: Actor): MultiplierSet {
        let {outgoing} = super.getMultipliers(actor);
        let chance = 0.5 + (0.25 * actor.getEffectLevel("prepared"));
        return {
            outgoing,
            incoming: Number(Math.random() <= chance) // Total evasion chance.
        }
    }
})();