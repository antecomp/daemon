/**
 * Composable Behaviors To Be Inserted Into Move Pipelines.
 */

import { VulnerableEffect } from "../engine/effects";
import { getBaseMultipliers, MoveSideEffect, MultiplierPipelineStep } from "./moves.types";

export const PreparedBonus: MultiplierPipelineStep = (prevMultipliers, self) => {
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


/////////////////////////////////////////////////////////////////////////////////////////////

export const VulnerableOnFocus: MoveSideEffect = (self) => {
    console.log(`${self.name} Applying vulnerable to self for interact`);
    self.addEffect(new VulnerableEffect(1));
}

export const CheckFocusBreak: MoveSideEffect = (self, opponent, index) => {
    if(opponent.currentSequence[index].type == "Aggressive") {
        self.data.focusLost = true;
    }
}

export const ApplyHeal: MoveSideEffect = (self) => {
    if(self.data.focusLost) {
        console.log(`${self.name} was attacked while healing—no health restored.`);
        self.data.focusLost = false;
        return;
    }

    const healAmount = 5 * (1 + self.getEffectLevel("prepared"));
    console.log(`${self.name} successfully heals for ${healAmount}!`);
    self.heal(healAmount);
}


export const ApplyVulnerableWithRefresh: MoveSideEffect = (self, opponent, index) => {
    // TODO: Carryover effect logic. (Get Vulnerable level from opponent?) - dont do the prevMove check
}


// Kinda Yucky But Idk What We Could Do Instead.
export const RepeatPreEffect: MoveSideEffect = (self, opponent, index) => {
    if (index === 0) return; // Should never happen

    const prevMove = self.currentSequence[index - 1];
    if (!prevMove?.behaviors?.preEffect) return; // Safety check

    console.log(`${self.name} is repeating ${prevMove.name}'s pre-effect.`);
    prevMove.behaviors.preEffect.forEach(effect => effect(self, opponent, index));
};

export const RepeatCounterEffect: MoveSideEffect = (self, opponent, index) => {
    if (index === 0) return; // Should never happen

    const prevMove = self.currentSequence[index - 1];
    if (!prevMove?.behaviors?.counterEffect) return; // Safety check

    console.log(`${self.name} is repeating ${prevMove.name}'s counter-effect.`);
    prevMove.behaviors.counterEffect.forEach(effect => effect(self, opponent, index));
};

export const RepeatPostEffect: MoveSideEffect = (self, opponent, index) => {
    if (index === 0) return; // Should never happen

    const prevMove = self.currentSequence[index - 1];
    if (!prevMove?.behaviors?.postEffect) return; // Safety check

    console.log(`${self.name} is repeating ${prevMove.name}'s post-effect.`);
    prevMove.behaviors.postEffect.forEach(effect => effect(self, opponent, index));
};
