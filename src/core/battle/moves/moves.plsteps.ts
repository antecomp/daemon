import { getBaseMultipliers } from "../engine/battle.logic";
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

export const RepeatStep: MultiplierPipelineStep = (prevMults, context) => {
    if(context.index === 0) return prevMults; // Do Nothing. This should never occur.

    const prevMove = context.self.currentSequence[context.index - 1];
    if (!prevMove) return prevMults; // ANother should-never-happen fallback

    // Basically have to just re-hash how our main pipeline gets the info here.
    let inheritedMults = getBaseMultipliers(prevMove.type);
    if(prevMove.behaviors.multpipeline) {
        inheritedMults = prevMove.behaviors.multpipeline.reduce(
            (mults, step) => step(mults, context),
            inheritedMults
        )
    }

    return inheritedMults;
}