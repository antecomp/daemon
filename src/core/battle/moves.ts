import { Actor } from "./actor";
import { MultiplierSet } from "./battle.types";
import { PreparedEffect, VulnerableEffect } from "./effects";

export abstract class Move {
    name: string = "NULL_MOVE"
    abstract getMultipliers(actor: Actor): MultiplierSet;
    /** Applied *before* interaction - use for in-turn status-effects */
    applyPreEffect(_self: Actor, _opponent: Actor) {};
    /** Applied *after* interaction (and effect ticker) - use for next-turn status effects */
    applyPostEffect(_self: Actor, _opponent: Actor) {};
    /** Applied before interaction - custom logic based on opponent move. */
    applyCounterEffect(_self: Actor, _opponent: Actor, _opponentMove: Move) {}
}

class PassiveMove extends Move {
    name = "Nothing"
    override getMultipliers(_actor: Actor): MultiplierSet {
        return { incoming: 1, outgoing: 0 }; // Passive moves don't deal damage
    }
}

export const NothingMove = new PassiveMove();

export class AggressiveMove extends Move {
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

/** Moves that require "focus" - i.e passive moves that can be broken if attacked.
 * 
 * Maintains temporary "moveIsBroken" in actor data.
 */
class FocusMove extends PassiveMove {
    name = "Focus"
    applyCounterEffect(self: Actor, _opponent: Actor, opponentMove: Move): void {
        if(opponentMove instanceof AggressiveMove) {
            self.data.focusLost = true;
        }
    }
    // Now check for focusLost in postEffect
}

class VulnerableMove extends FocusMove {
    name = "Vulnerable Focus"
    applyPreEffect(self: Actor, _opponent: Actor): void {
        console.log(`${self.name} requires focus to ${this.name}! Vulnerable for this turn!`);
        self.addEffect(new VulnerableEffect(1)); // Applies Vulnerability before execution
    }
}


// Likely when/if we have a larger subset of moves, we will want to move these to a seperate file
// Or potentially even instantiate them per-enemy.


export const Attack = new AggressiveMove(); // Utilize default behavior. Basic Attack.

// Utilize complex imediate instiation w/ override for very specific moves.
// Such as one that *requires* prepared.
export const StrongAttack = new (class extends AggressiveMove {
    name = "Strong Attack"
    damageMultiplier = 5
    override getMultipliers(actor: Actor): MultiplierSet {
        let mults = super.getMultipliers(actor);
        if (actor.getEffectLevel("prepared") > 0) {
            mults.outgoing *= this.damageMultiplier;
        }
        return mults;
    }
})();

// Moves that simply do extra damage, or multiply output in some way
// are pretty simple too...
export const Fireball = new (class extends AggressiveMove {
    name = "Fireball"
    damageMultiplier = 1.25
    override getMultipliers(actor: Actor): MultiplierSet {
        let mults = super.getMultipliers(actor);
        // This scales the already existing mults,
        // So a prepared fireball is 2 * 1.25 (where 2 is gathered from the super call)
        mults.outgoing *= this.damageMultiplier
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



export const Prepare = new (class extends VulnerableMove {
    name = "Prepare"
    applyPostEffect(self: Actor, _opponent: Actor): void {
        console.log(`${self.name} is now Prepared!`);
        if(self.data.focusLost) {
            console.log("Focus Broken, Attacked While Preparing!");
            self.data.focusLost = false;
            return;
        }
        // TODO: If prepared on this turn we actually scale and apply to next turn. (prepare prolong)
        self.addEffect(new PreparedEffect(1)); // Applies Prepared for the next move pairing
        self.data.focusLost = false;
    }
})();

export const Heal = new (class extends VulnerableMove {
    name = "Heal"
    applyPostEffect(self: Actor, _opponent: Actor): void {
        if(self.data.focusLost) {
            console.log('Attacked While Healing! No Health Restored!');
            self.data.focusLost = false;
            return;
        }

        console.log(`${self.name} heals for 5 HP!`);
        self.heal(5); // TODO: Change this to scale based on prepared level
        self.data.focusLost = false;
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