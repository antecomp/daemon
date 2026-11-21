import 'lume';
import '@/shared/styles/base.css';
import { render } from "solid-js/web";
import Hermes from '@/features/hermes/Hermes';
//////////////////////////////////////////////
//import dia from '../tests/dialogues/basic.bny';
import dia from '../scenes/TheGem/data/man.bny'


function Comp() {
    return <>
        <Hermes
            program={dia}
            onClose={() => window.location.reload()}
        />
    </>
}

// chage this out as needed
const domroot = document.getElementById('gentest');
if (domroot) render(() => Comp(), domroot);