import { ManiaStatus, PreparedStatus, VulnerableStatus } from "../engine/statuses";
import { MoveSEConditionalWrapper, MoveSideEffect, PostMoveContext, PostMoveSideEffect } from "./moves.types";

export const RequiresFocus: MoveSEConditionalWrapper<PostMoveSideEffect> = (effect) => {
    // Return a wrapper for effect to determine if the effect itself runs.
    return (context: PostMoveContext) => {
        if(context.damageTaken <= 0) {
            effect(context)
        } else {
            // Indicate loss of focus if subsequent moves require it.
            context.appendActionMessage(`${context.self.name}'s focus was shattered! Failed ${context.self.currentSequence[context.index].name}.`)
            context.sequenceBuffer[context.index]['focusLost'] = true;
        }
    }   
}

export const ApplySelfVulnerable: MoveSideEffect = ({self}) => {
    self.addStatus(new VulnerableStatus(1));
}

export const ApplySelfHeal: MoveSideEffect = ({self, appendActionMessage}) => {
    const healAmount = 5 * (1 + self.getStatusLevel("prepared"));
    appendActionMessage(`${self.name} heals for ${healAmount}`);
    self.heal(healAmount);
}

export const ExtendOpponentVulnerable: MoveSideEffect = ({opponent}) => {
    opponent.tickUpStatus("vulnerable", 1);
}

export const ApplyOpponentVulnerable: MoveSideEffect = (context) => {
    console.log("Attempting to apply opp vuln")
    context.opponent.addStatus(new VulnerableStatus(1));
}

export const ExtendSelfPrepared: MoveSideEffect = ({self}) => {
    self.tickUpStatus("prepared", 1);
}

export const ApplySelfPrepared: MoveSideEffect = ({self, appendActionMessage}) => {
    self.addStatus(new PreparedStatus(1));
    switch(self.getStatusLevel("prepared")) {
        case 1:
            appendActionMessage(`${self.name}'s vision narrows.`)
        break;    
        case 2:
            appendActionMessage(`${self.name} is ready for anything.`)
    }
}

export const EvadePostEffect: PostMoveSideEffect = ({damageTaken, index, sequenceBuffer, self, appendActionMessage}) => {
    if(sequenceBuffer[index].evadeSuccessful) {
        // Confirm we actually dodged some incoming damage...
        if(damageTaken === 0) {
            self.addStatus(new ManiaStatus(1));
            appendActionMessage(`${self.name} dodges swiftly. ${self.name} feels invigorated!`);
        }
    }
}