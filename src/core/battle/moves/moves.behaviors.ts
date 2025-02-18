/**
 * Composable Behaviors To Be Inserted Into Move Pipelines.
 * 
 * TODO: Seperate These Into MultPipeline File and SideEffect File.
 */

import { PreparedEffect, VulnerableEffect } from "../engine/effects";
import { getBaseMultipliers, MoveSEConditionalWrapper, MoveSideEffect, MultiplierPipelineStep } from "./moves.types";

export const PreparedAttackBonus: MultiplierPipelineStep = (prevMultipliers, self) => {
    return {
        ...prevMultipliers,
        outgoing: prevMultipliers.outgoing * Math.pow(2, self.getEffectLevel("prepared"))
    }
}

export const ReduceDamage: MultiplierPipelineStep = (prevMults, self) => {
    return {
        ...prevMults,
        incoming: prevMults.incoming * Math.pow(0.5, self.getEffectLevel("prepared") + 1)
    }
}

export const RepeatStep: MultiplierPipelineStep = (prevMults, self, index) => {
    if(index === 0) return prevMults; // Do Nothing (Inherit From Base). This should never happen.
    
    const prevMove = self.currentSequence[index - 1];
    if (!prevMove) return prevMults; // Another should-not-happen-gaurd

    let inheritedMults = getBaseMultipliers(prevMove.type);

    if(prevMove.behaviors.multipliers) {
        inheritedMults = prevMove.behaviors.multipliers.reduce(
            (mults, step) => step(mults, self, index -1),
            inheritedMults
        )
    }

    return inheritedMults;
}

///////////////////////////////////////////////////////////////////////////////////////////////

// Evade + Counter logic makes me want to eat rocks tbh.




///////////////////////////////////////////////////////////////////////////////////////////////

export const RequireFocus: MoveSEConditionalWrapper = (self, opponent, index, SE) => {
    if(opponent.currentSequence[index].type != "Aggressive") {
        return SE
    } else {
        console.log(`Focus lost, unable to perform ${self.currentSequence[index].name}`)
        return undefined;
    }
}

export const ApplySelfVulnerable: MoveSideEffect = (self) => {
    self.addEffect(new VulnerableEffect(1));
}

// Wrap this in RequireFocus.
export const ApplySelfHeal: MoveSideEffect = (self) => {
    const healAmount = 5 * (1 + self.getEffectLevel("prepared"));
    console.log(`${self.name} successfully heals for ${healAmount}!`);
    self.heal(healAmount);
}


// Kinda disgusting design pattern but uhhh. Idk maybe ill think of something less stupid later....
// This accounts for "stacking and extending" status effects.
// tldr; if Opponent already vulnerable, we want to "push" that effect into the turn after this one.
// Pre-tick up to avoid expiration (extend). Use as a preEffect
export const ExtendOpponentVulnerable: MoveSideEffect = (_self, opponent) => opponent.tickUpEffect("vulnerable", 1);

// Now as a postEffect we can just apply vuln normally (stack)
export const ApplyOpponentVulnerable: MoveSideEffect = (_self, opponent) => opponent.addEffect(new VulnerableEffect(1));


// Similar idea for stacking preperation levels...
// (Both of these need to be wrapped in a RequireFocus)
export const ExtendSelfPrepared: MoveSideEffect = (self) => {self.tickUpEffect("prepared", 1);}
export const ApplySelfPrepared: MoveSideEffect = (self) => self.addEffect(new PreparedEffect(1));







// Kinda Yucky But Idk What We Could Do Instead.
export const RepeatPreEffect: MoveSideEffect = (self, opponent, index) => {
    if (index === 0) return; // Should never happen

    const prevMove = self.currentSequence[index - 1];
    if (!prevMove?.behaviors?.preEffect) return; // Safety check

    console.log(`${self.name} is repeating ${prevMove.name}'s pre-effect.`);
    prevMove.behaviors.preEffect.forEach(effect => effect && effect(self, opponent, index));
};

export const RepeatPostEffect: MoveSideEffect = (self, opponent, index) => {
    if (index === 0) return; // Should never happen

    const prevMove = self.currentSequence[index - 1];
    if (!prevMove?.behaviors?.postEffect) return; // Safety check

    console.log(`${self.name} is repeating ${prevMove.name}'s post-effect.`);
    prevMove.behaviors.postEffect.forEach(effect => effect && effect(self, opponent, index));
};
