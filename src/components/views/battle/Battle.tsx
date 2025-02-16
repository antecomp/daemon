import { createContext, createSignal, onMount, useContext } from 'solid-js';
import './battle.css'
// import pallas from '@/assets/artwork/characters/pallas.png'
import CornerRect from '@/components/util/corner-rect/CornerRect';
import vtl from './assets/vtl.png'
import vtr from './assets/vtr.png'
import OppStatusBar from './OppStatusbar';
import Actionbar from './Actionbar';
import { DVOpponentData, MoveData, MoveDataSequence, MultiplierSet } from '@/core/battle/battle.types';
import { createMutable } from 'solid-js/store';
import { Actor } from '@/core/battle/actor';
import { computeEffectMultipliers } from '@/core/battle/effects';
import sleep from '@/util/sleep';

// function createBattleOpponentStore(baseOpponent: DVOpponentData) {
//     return createStore({
//         ...baseOpponent,
//         actor: new Actor(baseOpponent.name, baseOpponent.maxHealth)
//     })
// }



export enum BattleUIState {
    WAITING, READY, EXECUTING
}

interface BattleUIStateMachine {
    battleUIState: () => BattleUIState;
    setBattleUIState: (newState: BattleUIState) => void
}

const BattleUIStateContext = createContext<BattleUIStateMachine>();
export const useBattleUIState = () => {
    const context = useContext(BattleUIStateContext);
    if (!context) throw new Error("useBattleUIState must be within BattleUIState provider (Battle Component)");
    return context;
}

// Helper function - move this elsewhere during refactor plox.
const generateHint = (seq: MoveDataSequence): (MoveData | undefined)[] => {
    const indices = new Set<number>

    while (indices.size < 3) {
        indices.add(Math.floor(Math.random() * seq.length));
    }

    return seq.map((item, index) => indices.has(index) ? undefined : item);
}

interface BattleProps {
    opponentData: DVOpponentData
}

export default function Battle(props: BattleProps) {

    const [battleUIState, setBattleUIState] = createSignal<BattleUIState>(BattleUIState.WAITING);

    const opponent = createMutable(new Actor(props.opponentData.name, props.opponentData.maxHealth, props.opponentData.moveBin.map(m => m.instance)));
    let opponentSequence: MoveDataSequence // Mutable ref-like for use in multiple UI states. (Hint then full reveal)
    const player = createMutable(new Actor("player", 20, []));

    const [playerMults, setPlayerMults] = createSignal<MultiplierSet>({incoming: 0, outgoing: 0})
    const [opponentMults, setOpponentMults] = createSignal<MultiplierSet>({incoming: 0, outgoing: 0})

    const [insight, setInsight] = createSignal<(MoveData | undefined)[]>([]);



    function preSequence() {
        opponentSequence = props.opponentData.getSequence(opponent, player);
        setInsight(generateHint(opponentSequence));
        opponent.setMoveSequence(opponentSequence.map(movedata => movedata.instance));
        setBattleUIState(BattleUIState.WAITING);
    }

    async function execSequence(userSelectedSequence: MoveData[]) {
        if(opponent.currentSequence.length != 5 ) throw new Error("Opponent sequence not of correct length to evaluate");

        setBattleUIState(BattleUIState.EXECUTING);
        console.log(userSelectedSequence);

        // Reveal Enemy Sequence Entirely.
        setInsight(opponentSequence);

        // Unwrap Player Move Data
        player.setMoveSequence(userSelectedSequence.map(movedata => movedata.instance));
        if(player.currentSequence.length != 5) throw new Error("Player sequence not of correct length to evaluate");


        for(let moveIndex = 0; moveIndex < 5; moveIndex++) {
            (async () => {const playerMove = player.currentSequence[moveIndex];
            const oppMove = opponent.currentSequence[moveIndex];

            playerMove.applyPreEffect(player, opponent);
            oppMove.applyPreEffect(opponent, player);

            playerMove.applyCounterEffect(player, opponent, oppMove);
            oppMove.applyCounterEffect(opponent, player, playerMove);

            // TODO: Visualize Effects Here

            const playerEffectMultipliers = computeEffectMultipliers(player);
            const opponentEffectMultipliers = computeEffectMultipliers(opponent);

            const playerMoveMultipliers = playerMove.getMultipliers(player);
            const opponentMoveMultipliers = oppMove.getMultipliers(opponent);

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
            playerMove.applyPostEffect(player, opponent);
            oppMove.applyPostEffect(opponent, player);

            for (const effectStack of player.effects.values()) {
                effectStack.forEach(effect => effect.applyPostEffect(player, opponent));
            }

            for(const effectStack of opponent.effects.values()) {
                effectStack.forEach(effect => effect.applyPostEffect(opponent, player));
            }})()

            await sleep(3000);
        }

        // Ui Cleanup
        setPlayerMults({outgoing: 0, incoming: 0});
        setOpponentMults({outgoing: 0, incoming: 0});

        // Death Check Goes Here.

        // Loop back.
        preSequence();


    }


    onMount(() => {
        drawPattern();
        preSequence();
    });


    let canvasRef: HTMLCanvasElement | undefined;
    const drawPattern = () => {
        if (!canvasRef) return;
        const ctx = canvasRef.getContext("2d");
        if (!ctx) return;

        const size = 20; // Size of the pattern
        const patternCanvas = document.createElement("canvas");
        patternCanvas.width = size;
        patternCanvas.height = size;
        const pCtx = patternCanvas.getContext("2d");
        if (!pCtx) return;

        // Draw diagonal lines in pattern
        pCtx.strokeStyle = "gray";
        pCtx.lineWidth = 2;
        pCtx.beginPath();
        pCtx.moveTo(0, 0);
        pCtx.lineTo(size, size);
        pCtx.stroke();

        const pattern = ctx.createPattern(patternCanvas, "repeat");
        if (!pattern) return;

        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
    };


    return (
        <BattleUIStateContext.Provider value={{battleUIState, setBattleUIState}}>
            <div id="battle-container">
                <CornerRect id="battle-view" borderSize={2} borderType='solid white' corners={[vtl, vtr]}>
                    <OppStatusBar
                        name={opponent.name.toUpperCase()}
                        health={opponent.health / props.opponentData.maxHealth * 100}
                        icon={props.opponentData.icon}
                        /* placeholder */
                        // sequenceHint={props.opponent.getSequence(opponent.actor, opponent.actor)}
                        // sequenceHint={[...props.opponentData.moveBin] as MoveDataSequence}
                        sequenceHint={insight()}
                    />
                    <canvas id="battle-bg" width="1060" height="695" ref={canvasRef}></canvas>
                    <img src={props.opponentData.sprite} alt="" id="battle-sprite" />
                </CornerRect>
                <Actionbar execSequence={execSequence} playerHealth={player.health / player.maxHealth * 100} {...{playerMults, opponentMults}} />
                {/* {JSON.stringify([...opponent.effects.entries()])} */}
            </div>
        </BattleUIStateContext.Provider>
    )
}