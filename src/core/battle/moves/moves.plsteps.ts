import { MultiplierPipelineStep} from "./moves.types";

export const PreparedAttackBonus: MultiplierPipelineStep = (prevMults, {self, appendActionMessage}) => {

    switch(self.getStatusLevel("prepared")) {
        case 1:
            appendActionMessage(`${self.name} attacks with purpose.`)
            break;
        case 2:
            appendActionMessage(`${self.name} attacks with majesty.`)
    }

    return {
        ...prevMults,
        outgoing: prevMults.outgoing * Math.pow(2, self.getStatusLevel("prepared"))
    }
}

export const ReduceIncomingDamage: MultiplierPipelineStep = (prevMults, context) => {
    return {
        ...prevMults,
        incoming: prevMults.incoming * Math.pow(0.5, context.self.getStatusLevel("prepared") + 1)
    }
}

export const EvadeCheck: MultiplierPipelineStep = (prevMults, {self, sequenceBuffer, index}) => {
    const chance = 0.5 + (0.25 * self.getStatusLevel("prepared"));


    // Just change mults outright. We will see if we actually missed anything later.
    const success = Math.random() <= chance;

    if(success) {
        sequenceBuffer[index].evadeSuccessful = true; 
    }

    return {
        ...prevMults,
        incoming: prevMults.incoming * Number(!success) // 1 or 0.
    }
}