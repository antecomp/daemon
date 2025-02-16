import { createSignal, onMount } from 'solid-js';
import './battle.css'
// import pallas from '@/assets/artwork/characters/pallas.png'
import snake from '@/assets/artwork/dæmons/snaek.png'
import CornerRect from '@/components/util/corner-rect/CornerRect';
import vtl from './assets/vtl.png'
import vtr from './assets/vtr.png'
import OppStatusBar from './OppStatusbar';
import Actionbar from './Actionbar';
import { DVOpponentData, MoveData, MoveDataSequence } from '@/core/battle/battle.types';
import { createMutable, createStore } from 'solid-js/store';
import { Actor } from '@/core/battle/actor';
import { VulnerableEffect } from '@/core/battle/effects';

// function createBattleOpponentStore(baseOpponent: DVOpponentData) {
//     return createStore({
//         ...baseOpponent,
//         actor: new Actor(baseOpponent.name, baseOpponent.maxHealth)
//     })
// }

interface BattleProps {
    opponentData: DVOpponentData
}

const generateHint = (seq: MoveDataSequence): (MoveData | undefined)[] => {
    const indices = new Set<number>

    while (indices.size < 3) {
        indices.add(Math.floor(Math.random() * seq.length));
    }

    return seq.map((item, index) => indices.has(index) ? undefined : item);
}

export default function Battle(props: BattleProps) {

    const opponent = createMutable(new Actor(props.opponentData.name, props.opponentData.maxHealth, props.opponentData.moveBin.map(m => m.instance)));
    const player = createMutable(new Actor("player", 100, []));

    const [insight, setInsight] = createSignal<(MoveData | undefined)[]>([]);

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



    function preSequence() {
        const opponentSequence = props.opponentData.getSequence(opponent, player);
        setInsight(generateHint(opponentSequence));
        opponent.setMoveSequence(opponentSequence.map(movedata => movedata.instance))
    }

    function execSequence(userSelectedSequence: MoveData[]) {
        console.log(userSelectedSequence);
    }


    onMount(() => {
        drawPattern();
        preSequence();
    });

    setTimeout(() => {
        opponent.takeDamage(25)
        opponent.addEffect(new VulnerableEffect()) // Does NOT update UI
        //opponent.effects = new Map(opponent.effects); // lol, this technically will trigger an update.
        console.log(opponent.effects)
        console.log(opponent.health)
    }, 1000);


    return (
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
            <Actionbar execSequence={execSequence} />
            {/* {JSON.stringify([...opponent.effects.entries()])} */}
        </div>
    )
}