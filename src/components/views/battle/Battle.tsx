import { onMount } from 'solid-js';
import './battle.css'
import pallas from '@/assets/artwork/characters/pallas.png'
import CornerRect from '@/components/util/corner-rect/CornerRect';
import vtl from './assets/vtl.png'
import vtr from './assets/vtr.png'
import OppStatusBar from './OppStatusbar';

export default function Battle() {

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
    
      onMount(() => {
        drawPattern();
      });
    

    return (
        <div id="battle-container">
            <CornerRect id="battle-view" borderSize={2} borderType='solid white' corners={[vtl, vtr]}>
                <OppStatusBar name='STOLAS' level={65}/>
                <canvas id="battle-bg" width="1065" height="695" ref={canvasRef}></canvas>
                <img src={pallas} alt="" id="battle-sprite" />
            </CornerRect>
        </div>
    )
}