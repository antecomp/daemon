import { Actor } from "../engine/actor";
import { MultiplierSet } from "../engine/battle.types";
import { PreparedEffect, VulnerableEffect } from "../engine/effects";
import { AggressiveMove, Move, PassiveMove, VulnerableMove } from "../engine/moves";

export const AttackMove = AggressiveMove;

export const DefendMove = class extends PassiveMove {
    override getMultipliers(actor: Actor, sequence: Move[], index: number): MultiplierSet {
        let { incoming, outgoing } = super.getMultipliers(actor, sequence, index);
        incoming *= Math.pow(0.5, actor.getEffectLevel("prepared") + 1);
        return { incoming, outgoing }
    }
}

export const RepeatMove = class extends PassiveMove {
    name = "Repeat"
    canPerform(partialSequence: Move[]): boolean {
        return partialSequence.length > 0
    }
    applyCounterEffect(_self: Actor, _opponent: Actor, _opponentMove: Move, sequence: Move[], index: number): void {
        if (index == 0) {
            console.error("Repeat performed on first move. This should never happen. Falling back to PassiveMove.")
            super.applyCounterEffect(_self, _opponent, _opponentMove, sequence, index);
            return;
        }

        // Should the index passed to the function be index - 1?
        sequence[index - 1].applyCounterEffect(_self, _opponent, _opponentMove, sequence, index);
    }
    
    applyPreEffect(_self: Actor, _opponent: Actor, sequence: Move[], index: number): void {
        if (index == 0) {
            super.applyPreEffect(_self, _opponent, sequence, index);
            return;
        }
        sequence[index - 1].applyPreEffect(_self, _opponent, sequence, index);
    }

    applyPostEffect(_self: Actor, _opponent: Actor, sequence: Move[], index: number): void {
        if (index == 0) {
            super.applyPostEffect(_self, _opponent, sequence, index)
            return;
        }
        sequence[index - 1].applyPostEffect(_self, _opponent, sequence, index);
    }
    getMultipliers(_actor: Actor, sequence: Move[], index: number): MultiplierSet {
        if (index == 0) {
            return super.getMultipliers(_actor, sequence, index);
        }
        return sequence[index - 1].getMultipliers(_actor, sequence, index);
    }
}

export const AbstractionMove = class extends PassiveMove {
    // todo
}

export const PrepareMove = class extends VulnerableMove {
    name = "Prepare"
    applyPostEffect(self: Actor, _opponent: Actor): void {
        if (self.data.focusLost) {
            console.log("Focus Broken, Attacked While Preparing!");
            self.data.focusLost = false;
            return;
        }
        console.log("Prepared!")
        // TODO: If prepared on this turn we actually scale and apply to next turn. (prepare prolong)
        self.addEffect(new PreparedEffect(1)); // Applies Prepared for the next move pairing
        self.data.focusLost = false;
    }
}

export const ObserveMove = class extends PassiveMove {
    name = "Observe"
    applyPostEffect(_self: Actor, opponent: Actor): void {
        opponent.addEffect(new VulnerableEffect(1));
    }
}

export const HealMove = class extends VulnerableMove {
    name = "Heal"
    applyPostEffect(self: Actor, _opponent: Actor): void {
        if (self.data.focusLost) {
            console.log('Attacked While Healing! No Health Restored!');
            self.data.focusLost = false;
            return;
        }
        self.heal(5 * (1 + self.getEffectLevel("prepared")))
        self.data.focusLost = false;
    }
}

export const EvadeMove = class extends PassiveMove {
    name = "Evade"
    override getMultipliers(actor: Actor, sequence: Move[], index: number): MultiplierSet {
        let { outgoing } = super.getMultipliers(actor, sequence, index);
        let chance = 0.5 + (0.25 * actor.getEffectLevel("prepared"));
        return {
            outgoing,
            incoming: Number(Math.random() <= chance) // Total evasion chance.
        }
    }
}