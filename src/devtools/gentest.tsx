import 'lume';
import '@/shared/styles/base.css';
import { render } from "solid-js/web";
import Hermes from '@/features/hermes/HermesRewrite';
//////////////////////////////////////////////
import dia from '../tests/dialogues/basic.bny';
import sleep from '@/shared/utils/sleep';


function Comp() {
    return <>
        <Hermes
            program={dia}
            ctx={{
                onYield: async () => { await sleep(2000); return { advance: true } }
            }}
        />
    </>
}

// chage this out as needed
const domroot = document.getElementById('gentest');
if (domroot) render(() => Comp(), domroot);