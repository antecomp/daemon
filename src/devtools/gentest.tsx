import 'lume';
import '@/shared/styles/base.css';
import { render } from "solid-js/web";
import { GameOver } from '@/features/gameover/GameOver';
//////////////////////////////////////////////

function Comp() {
    return <>
        <GameOver
            reset={() => alert('ok')}
        />
    </>
}

// chage this out as needed
const domroot = document.getElementById('gentest');
if (domroot) render(() => Comp(), domroot);