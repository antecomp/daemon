import { ManiaStatus, PreparedStatus, VulnerableStatus } from "../engine/statuses";
import { MoveSEConditionalWrapper, MoveSideEffect, PostMoveContext, PostMoveSideEffect } from "./moves.types";

export const RequiresFocus: MoveSEConditionalWrapper<PostMoveSideEffect> = (effect) => {
    // Return a wrapper for effect to determine if the effect itself runs.
    return (context: PostMoveContext) => {
        if(context.damageTaken <= 0) {
            effect(context)
        } else {
            // Indicate loss of focus if subsequent moves require it.
            // context.appendActionMessage(`${context.self.name}'s focus was shattered! Failed ${context.self.currentSequence[context.index].name}.`)
            // ^ - we run RequiresFocus multiple times in a move. We have to delegate this status message somehow!!
            context.sequenceBuffer[context.index]['focusLost'] = true;
        }
    }   
}

export const ApplySelfVulnerable: MoveSideEffect = ({self}) => {
    self.addStatus(new VulnerableStatus(1));
}

export const ApplySelfHeal: MoveSideEffect = ({self, appendActionMessage}) => {
    const healAmount = 2 * (1 + self.getStatusLevel("prepared"));
    self.heal(healAmount);
    if(self.health == self.maxHealth) {
        appendActionMessage(`${self.name}'s health is maxed out!`, "heal");
    } else {
        appendActionMessage(`${self.name} heals for ${healAmount}`, "heal");
    }
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
            appendActionMessage(`${self.name}'s vision narrows.`, "focus")
        break;    
        case 2:
            appendActionMessage(`${self.name} is ready for anything.`, "focus")
    }
}

export const EvadePostEffect: PostMoveSideEffect = ({damageTaken, index, sequenceBuffer, self, appendActionMessage, theirMults: theirMults}) => {
    if(sequenceBuffer[index].evadeSuccessful) {
        // Confirm we actually dodged some incoming damage...
        if(damageTaken === 0 && theirMults.outgoing > 0) {
            self.addStatus(new ManiaStatus(1));
            appendActionMessage(`${self.name} dodges swiftly. ${self.name} feels invigorated!`, "mania");
        }
    }
}