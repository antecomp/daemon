import { PreparedEffect, VulnerableEffect } from "../engine/effects";
import { MoveContext, MoveSEConditionalWrapper, MoveSideEffect } from "./moves.types";

export const RequiresFocus: MoveSEConditionalWrapper = (effect) => {
    // Return a wrapper for effect to determine if the effect itself runs.
    return (context: MoveContext) => {
        if(context.opponent.currentSequence[context.index].type != "Aggressive") {
            effect(context)
        } else {
            // Indicate loss of focus if subsequent moves require it.
            console.log(`Focus lost. Unable to perform ${context.self.currentSequence[context.index].name}`);
            context.sequenceBuffer[context.index]['focusLost'] = true;
        }
    }   
}

export const ApplySelfVulnerable: MoveSideEffect = (context) => {
    context.self.addEffect(new VulnerableEffect(1));
}

export const ApplySelfHeal: MoveSideEffect = ({self}) => {
    const healAmount = 5 * (1 + self.getEffectLevel("prepared"));
    console.log(`${self.name} successfully heals for ${healAmount}!`);
    self.heal(healAmount);
}

export const ExendOpponentVulnerable: MoveSideEffect = ({opponent}) => {
    opponent.tickUpEffect("vulnerable", 1);
}

export const ApplyOpponentVulnerable: MoveSideEffect = ({opponent}) => {
    opponent.addEffect(new VulnerableEffect(1));
}

export const ExtendSelfPrepared: MoveSideEffect = ({self}) => {
    self.tickUpEffect("prepared", 1);
}

export const ApplySelfPrepared: MoveSideEffect = ({self}) => {
    self.addEffect(new PreparedEffect(1));
}