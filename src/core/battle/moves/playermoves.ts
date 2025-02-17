import { MultiplierSet, PlayerMoveData } from "../engine/battle.types";
import apprentice_icon from './icons/apprentice.png'
import candle_icon from './icons/candle.png'
import chain_icon from './icons/chains.png'
import hourglass_icon from './icons/hourglass.png'
import mage_icon from './icons/mage.png'
import prae_icon from './icons/PRAETORIAN.png'
import priestess_icon from './icons/priestess.png'
import trickster_icon from './icons/trickster.png'
import lantern_icon from './icons/lantern.png'

import apprentice_icon_ex from './icons/apprentice_ex.png'
import candle_icon_ex from './icons/candle_ex.png'
import chain_icon_ex from './icons/chain_ex.png'
import hourglass_icon_ex from './icons/hourglass_ex.png'
import mage_icon_ex from './icons/mage_ex.png'
import prae_icon_ex from './icons/prae_ex.png'
import priestess_icon_ex from './icons/priestess_ex.png'
import trickster_icon_ex from './icons/trickster_ex.png'
import lantern_icon_ex from './icons/lantern.png'
import { AggressiveMove, Move, NothingMove, PassiveMove, VulnerableMove } from "../engine/moves";
import { Actor } from "../engine/actor";
import { PreparedEffect, VulnerableEffect } from "../engine/effects";

export const Attack: PlayerMoveData = {
    displayName: "Candlelight",
    icon: candle_icon,
    rbIcon: candle_icon_ex,
    instance: new AggressiveMove()
}

export const Defend: PlayerMoveData = {
    displayName: "Praetorian",
    icon: prae_icon,
    rbIcon: prae_icon_ex,
    instance: new(class extends PassiveMove {
            override getMultipliers(actor: Actor, sequence: Move[], index: number): MultiplierSet {
                let {incoming, outgoing} = super.getMultipliers(actor, sequence, index);
                incoming *= Math.pow(0.5, actor.getEffectLevel("prepared") + 1);
                return {incoming, outgoing}
            }
    })()
}

export const Repeat: PlayerMoveData = {
    displayName: "Apprentice",
    icon: apprentice_icon,
    rbIcon: apprentice_icon_ex,
    instance: new (class extends PassiveMove { /* extending passive move as a "do nothing" fallback */
        name="Repeat"
        canPerform(partialSequence: Move[]): boolean {
            return partialSequence.length > 0
        }
        applyCounterEffect(_self: Actor, _opponent: Actor, _opponentMove: Move, sequence: Move[], index: number): void {
            if(index == 0) {
                console.error("Repeat performed on first move. This should never happen. Falling back to PassiveMove.")
                super.applyCounterEffect(_self, _opponent, _opponentMove, sequence, index);
                return;
            }

            // Should the index passed to the function be index - 1?
            sequence[index - 1].applyCounterEffect(_self, _opponent, _opponentMove, sequence, index);
        }
        // TODO, remaining functions to call neighbor, similar structure as above
        applyPreEffect(_self: Actor, _opponent: Actor, sequence: Move[], index: number): void {
            if(index == 0) {
                super.applyPreEffect(_self, _opponent, sequence, index);
                return;
            }
            sequence[index - 1].applyPreEffect(_self, _opponent, sequence, index);
        }

        applyPostEffect(_self: Actor, _opponent: Actor, sequence: Move[], index: number): void {
            if(index == 0) {
                super.applyPostEffect(_self, _opponent, sequence, index)
                return;
            }
            sequence[index - 1].applyPostEffect(_self, _opponent, sequence, index);
        }
        getMultipliers(_actor: Actor, sequence: Move[], index: number): MultiplierSet {
            if(index == 0) {
                return super.getMultipliers(_actor, sequence, index);
            }
            return sequence[index - 1].getMultipliers(_actor, sequence, index);
        }
    })()
}

// Abstract - Double enemy multipliers (maybe for some amount of turns?), both incoming and outgoing - can be helpful or harmful so you have to predict how the enemy will act
export const Abstract: PlayerMoveData = {
    displayName: "Abstract",
    icon: chain_icon,
    rbIcon: chain_icon_ex,
    instance: NothingMove
}

export const Prepare: PlayerMoveData = {
    displayName: "Hourglass",
    icon: hourglass_icon,
    rbIcon: hourglass_icon_ex,
    instance: new (class extends VulnerableMove {
        name = "Prepare"
        applyPostEffect(self: Actor, _opponent: Actor): void {
            if(self.data.focusLost) {
                console.log("Focus Broken, Attacked While Preparing!");
                self.data.focusLost = false;
                return;
            }
            console.log("Prepared!")
            // TODO: If prepared on this turn we actually scale and apply to next turn. (prepare prolong)
            self.addEffect(new PreparedEffect(1)); // Applies Prepared for the next move pairing
            self.data.focusLost = false;
        }
    })()
}

export const Observe: PlayerMoveData = {
    displayName: "Lantern",
    icon: mage_icon,
    rbIcon: mage_icon_ex,
    instance: new (class extends PassiveMove {
        name = "Observe"
        applyPostEffect(_self: Actor, opponent: Actor): void {
            opponent.addEffect(new VulnerableEffect(1));
        }
    })()
}

export const Heal: PlayerMoveData = {
    displayName: "Priestess",
    icon: priestess_icon,
    rbIcon: priestess_icon_ex,
    instance: new (class extends VulnerableMove {
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
    })()
}

export const Evade: PlayerMoveData = {
    displayName: "Trickster",
    icon: trickster_icon,
    rbIcon: trickster_icon_ex,
    instance: new (class extends PassiveMove {
        name = "Evade"
        override getMultipliers(actor: Actor, sequence: Move[], index: number): MultiplierSet {
            let {outgoing} = super.getMultipliers(actor, sequence, index);
            let chance = 0.5 + (0.25 * actor.getEffectLevel("prepared"));
            return {
                outgoing,
                incoming: Number(Math.random() <= chance) // Total evasion chance.
            }
        }
    })()
}