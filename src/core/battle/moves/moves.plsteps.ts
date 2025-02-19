import { MultiplierPipelineStep } from "./moves.types";

export const PreparedAttackBonus: MultiplierPipelineStep = (prevMults, context) => {
    return {
        ...prevMults,
        outgoing: prevMults.outgoing * Math.pow(2, context.self.getEffectLevel("prepared"))
    }
}

export const ReduceIncomingDamage: MultiplierPipelineStep = (prevMults, context) => {
    return {
        ...prevMults,
        incoming: prevMults.incoming * Math.pow(0.5, context.self.getEffectLevel("prepared") + 1)
    }
}

export const EvadeCheck: MultiplierPipelineStep = (prevMults, {self, sequenceBuffer, index, opponent}) => {
    const chance = 0.5 + (0.25 * self.getEffectLevel("prepared"));

    // Evade technically fails if we're not attacked (dont apply bonus)
    // Once we add status messages we'll wanna break this into actual cases for it to make sense.
    const success = opponent.currentSequence[index].type == "Aggressive" ?  Math.random() <= chance : false;

    console.log(index);

    console.log(sequenceBuffer);
    sequenceBuffer[index]['evadeSuccess'] = Number(success); // Used for post-evade bonuses.

    return {
        ...prevMults,
        incoming: prevMults.incoming * Number(!success) // 1 or 0.
    }
}

export const SuccessfulEvadeAttackBonus: MultiplierPipelineStep = (prevMults, {sequenceBuffer, index}) => {
    console.log(sequenceBuffer);

    let bonusK = 0;
    if(sequenceBuffer[index - 1]) {
        bonusK = sequenceBuffer[index - 1]['evadeSuccess'] ?? 0
    }

    return {
        ...prevMults,
        outgoing: prevMults.outgoing * (2 ** bonusK)
    }
}