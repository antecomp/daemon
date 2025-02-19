import { createMutable } from "solid-js/store";
import { Actor } from "./actor";
import { DVOpponentData, MoveData, MoveDataSequence, MultiplierSet } from "./battle.types";
import { BattleUIState } from "./battle.context";
import { createSignal } from "solid-js";
import sleep from "@/util/sleep";
import { computeEffectMultipliers } from "./effects";
import { Move, MoveContext, movetype } from "../moves/moves.types";


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

export function performMultPipeline(initialMultipliers: MultiplierSet, move: Move, context: MoveContext): MultiplierSet {
    if (!move.behaviors.multpipeline) return initialMultipliers; // No multipliers to apply.

    return move.behaviors.multpipeline.reduce(
        (currentMults, step) => step(currentMults, context), 
        initialMultipliers
    );
}

export function combineMultiplierSets(...sets: MultiplierSet[]) {
    return sets.reduce((acc: MultiplierSet, set) => {
        return {
            outgoing: acc.outgoing * set.outgoing,
            incoming: acc.incoming * set.incoming
        }
    }, {incoming: 1, outgoing: 1})
}


export function useBattleLogic(opponentData: DVOpponentData) {
    const [battleUIState, setBattleUIState] = createSignal(BattleUIState.WAITING);

    // This should be extracted from game store later?
    const player = createMutable(new Actor("player", 20, []));

    const opponent = createMutable(new Actor(opponentData.name, opponentData.maxHealth, opponentData.moveBin));
    let opponentSequence: MoveDataSequence // Mutable ref-like for use in multiple UI states. (Hint then full reveal)

    const [insight, setInsight] = createSignal<(MoveData | undefined)[]>([]);

    const [playerMults, setPlayerMults] = createSignal<MultiplierSet>({incoming: 0, outgoing: 0})
    const [opponentMults, setOpponentMults] = createSignal<MultiplierSet>({incoming: 0, outgoing: 0})


    function setupRound() { 
        opponentSequence = opponentData.getSequence(opponent, player);
        setInsight(generateHint(opponentSequence));
        opponent.setMoveSequence(opponentSequence);
        setBattleUIState(BattleUIState.WAITING);
    }


    async function executeRound(userSelectedSequence: Move[]) {
        if(opponent.currentSequence.length != 5) throw new Error("Opponent sequence not of correct length to evaluate");

        setBattleUIState(BattleUIState.EXECUTING);

        setInsight(opponentSequence);

        player.setMoveSequence(userSelectedSequence);
        if(player.currentSequence.length != 5) throw new Error("Player sequence not of correct length to evaluate");
        
        // Likely want to do some work to generalize this so we dont have to write double of everything.
        for(let moveIndex = 0; moveIndex < 5; moveIndex++) {
            const playerMove = player.currentSequence[moveIndex];
            const playerMoveContext: MoveContext = {
                self: player,
                opponent: opponent,
                index: moveIndex,
                sequence: player.currentSequence,
                sequenceBuffer: {}
            }
            const oppMove = opponent.currentSequence[moveIndex];
            const oppMoveContext: MoveContext = {
                self: opponent,
                opponent: player,
                index: moveIndex,
                sequence: opponent.currentSequence,
                sequenceBuffer: {}
            }

            playerMove.behaviors.preEffects?.forEach(effect => effect(playerMoveContext));
            oppMove.behaviors.preEffects?.forEach(effect => effect(oppMoveContext));

            // Todo: Visualize Effects Here

            const playerMoveMultipliers = performMultPipeline(
                getBaseMultipliers(playerMove.type),
                playerMove,
                playerMoveContext
            )

            const opponentMoveMultipliers = performMultPipeline(
                getBaseMultipliers(oppMove.type),
                oppMove,
                oppMoveContext
            )

            const playerEffectMultipliers = computeEffectMultipliers(player);
            const oppEffectMultipliers = computeEffectMultipliers(opponent);

            const playerFinalMultipliers = combineMultiplierSets(playerEffectMultipliers, playerMoveMultipliers);
            const opponentFinalMultipliers = combineMultiplierSets(oppEffectMultipliers, opponentMoveMultipliers);

            // Update signal to visualize new mults in UI
            setPlayerMults(playerFinalMultipliers); 
            setOpponentMults(opponentFinalMultipliers);

            // Delay before damage dealt. (see multipliers then apply)
            await sleep(1000);

            opponent.takeDamage(playerFinalMultipliers.outgoing * opponentFinalMultipliers.incoming);
            player.takeDamage(playerFinalMultipliers.incoming * opponentFinalMultipliers.outgoing);


            // Move this as a method of Actor???
            for (const effectStack of player.effects.values()) {
                effectStack.forEach(effect => effect.applyPostEffect(player, opponent));
            }

            for (const effectStack of opponent.effects.values()) {
                effectStack.forEach(effect => effect.applyPostEffect(opponent, player));
            }

            player.tickAndRemoveEffects();
            opponent.tickAndRemoveEffects();

            playerMove.behaviors.postEffects?.forEach(effect => effect(playerMoveContext));
            oppMove.behaviors.postEffects?.forEach(effect => effect(oppMoveContext));

            // Reset signal for UI
            setPlayerMults({incoming: 0, outgoing: 0});
            setOpponentMults({incoming: 0, outgoing: 0})

            await sleep(3000); // Wait before doing next move.
        }

        // TODO: Death Check

        // Loop back to setup.
        setupRound();
        console.log(player, opponent);
    }

    return { playerMults, opponentMults, battleUIState, setBattleUIState, player, opponent, setupRound, executeRound, insight };
}