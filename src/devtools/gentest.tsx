import 'lume';
import '@/shared/styles/base.css';
import { render } from "solid-js/web";
import Hermes from '@/features/hermes/HermesRewrite';
//////////////////////////////////////////////
import dia from '../tests/dialogues/basic.bny';


function Comp() {
    return <>
        <Hermes
            program={dia}
            ctx={{
                
            }}
        />
    </>
}

// chage this out as needed
const domroot = document.getElementById('gentest');
if (domroot) render(() => Comp(), domroot);