import 'lume';
import '@/shared/styles/base.css';
import { render } from "solid-js/web";
import { onMount } from 'solid-js';
//////////////////////////////////////////////

import shader from '@/assets/background-shaders/checkers.glsl'
import createShaderPlane from '@/shared/hooks/createShaderPlane';

function Comp() {
    let canvasRef!: HTMLCanvasElement;
    onMount(() => createShaderPlane(canvasRef, shader));
    return <canvas ref={canvasRef} width={800} height={600}/>
}

// chage this out as needed
const domroot = document.getElementById('gentest');
if (domroot) render(() => Comp(), domroot);