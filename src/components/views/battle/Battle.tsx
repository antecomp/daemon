import { onMount } from 'solid-js';
import './ui/battle.css'
// import pallas from '@/assets/artwork/characters/pallas.png'
import CornerRect from '@/components/util/corner-rect/CornerRect';
import vtl from './assets/vtl.png'
import vtr from './assets/vtr.png'
import OppStatusBar from './ui/OppStatusbar';
import Actionbar from './ui/Actionbar';
import { DVOpponentData } from '@/core/battle/engine/battle.types';
import { BattleUIStateContext } from '@/core/battle/engine/battle.context';
import { useBattleLogic } from '@/core/battle/engine/battle.logic';

interface BattleProps {
    opponentData: DVOpponentData
}

export default function Battle(props: BattleProps) {

    // Hook with a bigass return to handle battle logic and pass back needed UI changes.
    const { playerMults, opponentMults, battleUIState, setBattleUIState, player, opponent, setupRound, executeRound, insight } = useBattleLogic(props.opponentData);

    onMount(() => {
        drawPattern();
        setupRound();
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
                <Actionbar execSequence={executeRound} playerHealth={player.health / player.maxHealth * 100} {...{playerMults, opponentMults}} />
                {/* {JSON.stringify([...opponent.effects.entries()])} */}
            </div>
        </BattleUIStateContext.Provider>
    )
}