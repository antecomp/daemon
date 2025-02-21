import { MultiplierPipelineStep } from "./moves.types";

export const PreparedAttackBonus: MultiplierPipelineStep = (prevMults, context) => {
    return {
        ...prevMults,
        outgoing: prevMults.outgoing * Math.pow(2, context.self.getStatusLevel("prepared"))
    }
}

export const ReduceIncomingDamage: MultiplierPipelineStep = (prevMults, context) => {
    return {
        ...prevMults,
        incoming: prevMults.incoming * Math.pow(0.5, context.self.getStatusLevel("prepared") + 1)
    }
}

export const EvadeCheck: MultiplierPipelineStep = (prevMults, {self, sequenceBuffer, index, opponent, appendActionMessage}) => {
    const chance = 0.5 + (0.25 * self.getStatusLevel("prepared"));

    // Evade technically fails if we're not attacked (dont apply bonus)
    // Once we add status messages we'll wanna break this into actual cases for it to make sense.
    const success = opponent.currentSequence[index].type == "Aggressive" ?  Math.random() <= chance : false;

    sequenceBuffer[index]['evadeSuccess'] = Number(success); // Used for post-evade bonuses.

    if(success) {
        appendActionMessage(`${self.name} swiftly dissapates the attack!`)
    }

    return {
        ...prevMults,
        incoming: prevMults.incoming * Number(!success) // 1 or 0.
    }
}

export const SuccessfulEvadeAttackBonus: MultiplierPipelineStep = (prevMults, {sequenceBuffer, index, appendActionMessage, self}) => {
    console.log(sequenceBuffer);

    const bonusK = sequenceBuffer[index - 1]?.['evadeSuccess'] ?? 0

    if(bonusK > 0) {
        appendActionMessage(`${self.name} is frenzied and strikes with elegance!`)
    }

    return {
        ...prevMults,
        outgoing: prevMults.outgoing * (2 ** bonusK)
    }
}