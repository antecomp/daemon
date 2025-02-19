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
        incoming: prevMults.incoming * Math.pow(0.5, context.self.getEffectLevel("prepared"))
    }
}

export const EvadeCheck: MultiplierPipelineStep = (prevMults, {self, sequenceBuffer, index}) => {
    const chance = 0.5 + (0.25 * self.getEffectLevel("prepared"));
    const success = Math.random() <= chance;

    sequenceBuffer[index]['evadeSuccess'] = Number(success); // Used for post-evade bonuses.

    return {
        ...prevMults,
        incoming: prevMults.incoming * Number(success) // 1 or 0.
    }
}

export const SuccessfulEvadeAttackBonus: MultiplierPipelineStep = (prevMults, {sequenceBuffer, index}) => {
    return {
        ...prevMults,
        outgoing: prevMults.outgoing * (2 ** (sequenceBuffer[index - 1]['evadeSuccess'] ?? 0))
    }
}