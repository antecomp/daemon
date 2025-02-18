import { createMutable } from "solid-js/store";
import { Actor } from "./actor";
import { DVOpponentData, MoveData, MoveDataSequence, MultiplierSet } from "./battle.types";
import { BattleUIState } from "./battle.context";
import { createSignal } from "solid-js";
import sleep from "@/util/sleep";
import { computeEffectMultipliers } from "./effects";


const generateHint = (seq: MoveDataSequence): (MoveData | undefined)[] => {
    const indices = new Set<number>

    while (indices.size < 3) {
        indices.add(Math.floor(Math.random() * seq.length));
    }

    return seq.map((item, index) => indices.has(index) ? undefined : item);
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

    async function executeRound(userSelectedSequence: MoveData[]) { 
        // We should never see this lol
        if(opponent.currentSequence.length != 5 ) throw new Error("Opponent sequence not of correct length to evaluate");

        setBattleUIState(BattleUIState.EXECUTING);

        setInsight(opponentSequence);

        player.setMoveSequence(userSelectedSequence.map(movedata => movedata.instance));
        if(player.currentSequence.length != 5) throw new Error("Player sequence not of correct length to evaluate");

        // TODO: Advanced Move Pre-eval, stuff like repeat.
        //  Maybe make more robust with some strange self-mutate property for moves?

        for(let moveIndex = 0; moveIndex < 5; moveIndex++) {
            const playerMove = player.currentSequence[moveIndex];
            const oppMove = opponent.currentSequence[moveIndex];

            playerMove.applyPreEffect(player, opponent, player.currentSequence, moveIndex);
            oppMove.applyPreEffect(opponent, player, opponent.currentSequence, moveIndex);

            playerMove.applyCounterEffect(player, opponent, oppMove, player.currentSequence, moveIndex);
            oppMove.applyCounterEffect(opponent, player, playerMove, opponent.currentSequence, moveIndex);

            // TODO: Visualize Effects Here

            const playerEffectMultipliers = computeEffectMultipliers(player);
            const opponentEffectMultipliers = computeEffectMultipliers(opponent);

            const playerMoveMultipliers = playerMove.getMultipliers(player, player.currentSequence, moveIndex);
            const opponentMoveMultipliers = oppMove.getMultipliers(opponent, opponent.currentSequence, moveIndex);

            const playerFinalMultipliers: MultiplierSet = {
                incoming: playerEffectMultipliers.incoming * playerMoveMultipliers.incoming,
                outgoing: playerEffectMultipliers.outgoing * playerMoveMultipliers.outgoing
            }
            setPlayerMults(playerFinalMultipliers); // Visualize.

            const opponentFinalMultipliers: MultiplierSet = {
                incoming: opponentEffectMultipliers.incoming * opponentMoveMultipliers.incoming,
                outgoing: opponentEffectMultipliers.outgoing * opponentMoveMultipliers.outgoing
            }
            setOpponentMults(opponentFinalMultipliers); // Visualize.

            // Delay before damage dealt. (see multipliers then apply)
            await sleep(1000);

            opponent.takeDamage(playerFinalMultipliers.outgoing * opponentFinalMultipliers.incoming);
            player.takeDamage(opponentFinalMultipliers.outgoing * playerFinalMultipliers.incoming);

            player.tickAndRemoveEffects();
            opponent.tickAndRemoveEffects();

            // Apply PostEffects AFTER ticking down (so duration 1 actually makes sense.)
            playerMove.applyPostEffect(player, opponent, player.currentSequence, moveIndex);
            oppMove.applyPostEffect(opponent, player, opponent.currentSequence, moveIndex);


            // This should be above the ticker?
            // for (const effectStack of player.effects.values()) {
            //     effectStack.forEach(effect => effect.applyPostEffect(player, opponent));
            // }

            // for(const effectStack of opponent.effects.values()) {
            //     effectStack.forEach(effect => effect.applyPostEffect(opponent, player));
            // }

            setPlayerMults({outgoing: 0, incoming: 0});
            setOpponentMults({outgoing: 0, incoming: 0});

            await sleep(3000);

        }

        // Ui Cleanup
        setPlayerMults({outgoing: 0, incoming: 0});
        setOpponentMults({outgoing: 0, incoming: 0});

        // TODO TODO TODO: Death Check Goes Here.

        // Loop back to setup (generate new enemy move and wait...)
        setupRound();
        console.log(player, opponent);
    }

    return { playerMults, opponentMults, battleUIState, setBattleUIState, player, opponent, setupRound, executeRound, insight };
}