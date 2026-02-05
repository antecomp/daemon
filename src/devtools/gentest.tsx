import 'lume';
import '@/shared/styles/base.css';
import { render } from "solid-js/web";
import BattleCanvas from '@/features/battle/ui/BattleCanvas';
//////////////////////////////////////////////

import shader from '@/assets/background-shaders/checkers.glsl'

function Comp() {
    return <BattleCanvas
        sprite=''
        backgroundShader={shader}
    />
}

// chage this out as needed
const domroot = document.getElementById('gentest');
if (domroot) render(() => Comp(), domroot);