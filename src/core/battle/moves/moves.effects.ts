import { PreparedStatus, VulnerableStatus } from "../engine/statuses";
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

export const ApplySelfVulnerable: MoveSideEffect = ({self}) => {
    console.log("Attempting self vuln")
    self.addStatus(new VulnerableStatus(1));
    console.log(self.statuses)
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

export const ApplySelfPrepared: MoveSideEffect = ({self}) => {
    self.addStatus(new PreparedStatus(1));
}