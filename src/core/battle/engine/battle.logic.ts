import { createMutable } from "solid-js/store";
import { Actor } from "./actor";
import { DVOpponentData, MoveData, MoveDataSequence, MultiplierSet } from "./battle.types";
import { BattleUIState } from "./battle.context";
import { createSignal } from "solid-js";
import sleep from "@/util/sleep";
import { computeEffectMultipliers } from "./effects";
import { Move, MoveContext, movetype, SequenceBuffer } from "../moves/moves.types";


const generateHint = (seq: MoveDataSequence): (MoveData | undefined)[] => {
    const indices = new Set<number>

    while (indices.size < 3) {
        indices.add(Math.floor(Math.random() * seq.length));
    }

    return seq.map((item, index) => indices.has(index) ? undefined : item);
}

export function getBaseMultipliers(type: movetype): MultiplierSet {
    return {
        "Aggressive":   {incoming: 1, outgoing: 1},
        "Passive":      {incoming: 1, outgoing: 0}
    }[type]
}

export function performMultPipeline(initialMultipliers: MultiplierSet, context: MoveContext): MultiplierSet {
    if (!context.move.behaviors.multpipeline) return initialMultipliers; // No multipliers to apply.

    return context.move.behaviors.multpipeline.reduce(
        (currentMults, behavior) => behavior(currentMults, context), 
        initialMultipliers
    );
}


export function useBattleLogic(opponentData: DVOpponentData) {
    const [battleUIState, setBattleUIState] = createSignal(BattleUIState.WAITING);

    // This should be extracted from game store later?
    const player = createMutable(new Actor("player", 20, []));

    const opponent = createMutable(new Actor(opponentData.name, opponentData.maxHealth, opponentData.moveBin.map(m => m.instance)));
    let opponentSequence: MoveDataSequence // Mutable ref-like for use in multiple UI states. (Hint then full reveal)

    const [insight, setInsight] = createSignal<(MoveData | undefined)[]>([]);

    const [playerMults, setPlayerMults] = createSignal<MultiplierSet>({incoming: 0, outgoing: 0})
    const [opponentMults, setOpponentMults] = createSignal<MultiplierSet>({incoming: 0, outgoing: 0})


    function setupRound() { 
        opponentSequence = opponentData.getSequence(opponent, player);
        setInsight(generateHint(opponentSequence));
        opponent.setMoveSequence(opponentSequence.map(movedata => movedata.instance));
        setBattleUIState(BattleUIState.WAITING);
    }


    async function executeRound() {

    }

    return { playerMults, opponentMults, battleUIState, setBattleUIState, player, opponent, setupRound, executeRound, insight };
}