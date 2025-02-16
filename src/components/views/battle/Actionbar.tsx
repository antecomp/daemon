import './actionbar.css'
import Runebuilder from './Runebuilder'
import eject_button from './assets/eject-button.png'
import reset_button from './assets/reset-button.png'
import exec_button from './assets/exec-button.png'
import fch_bar from './assets/f-ch-bar.png'

import ur_bar from './assets/mult_ur.png'
import us_bar from './assets/mult_us.png'
import dr_bar from './assets/mult_dr.png'
import ds_bar from './assets/mult_ds.png'
import placeholder_move_icon from './assets/placeholder_move_icon.png'
import { Attack, Defend, Repeat, Abstract, Prepare, Observe, Heal, Evade } from '@/core/battle/moves/playermoves';
import { createSignal, For } from 'solid-js'
import { MoveData } from '@/core/battle/battle.types'

interface SelectedMoveProps {
    icon?: string // img url
    displayName: string
}

function SelectedMove(props: SelectedMoveProps) {
    return (
        <span class="player-move">
            <div>
                <img src={props.icon}/>
                {props.displayName}
            </div>
        </span>
    )
}

interface ActionbarProps {
    execSequence: (userSelectedSequence: MoveData[]) => void
}

export default function Actionbar(props: ActionbarProps) {

    // Will be gathered from game store later...
    const playerMoveBin = [Attack, Defend, Repeat, Abstract, Prepare, Observe, Heal, Evade];

    const [sequenceBuffer, setSequenceBuffer] = createSignal<MoveData[]>([]);

    const addRune = (toAdd: MoveData) => {
        if(sequenceBuffer().length == 5) return;
        setSequenceBuffer(prev => (prev.some(item => item == toAdd)) ? prev: [...prev, toAdd]);
    }

    const resetRunes = () => {
        setSequenceBuffer([]);
    }


    return (
        <div id="battle-actionbar">
            <div class="left">
                <img src={eject_button} id='eject-button' />
                <Runebuilder availRunes={playerMoveBin} addRune={addRune} sequenceBuffer={sequenceBuffer()}/>
                <div id="rb-buttons">
                    <img src={reset_button} onClick={resetRunes} id='reset-button'/>
                    <img src={exec_button} id='exec-button'/>
                </div>
            </div>
            <div class="right">
                <div class="moves">
                    <For each={sequenceBuffer()}>
                        {(x) => <SelectedMove {...x}/>}
                    </For>
                </div>
                <img src={fch_bar} id="fch-bar" />
                <div id="multbars">
                    <div class="userbars">
                        <img src={ur_bar} class="ur-bar"/>
                        <img src={us_bar} class="us-bar"/>
                    </div>
                    <div class="dbars">
                        <img src={ds_bar} class="ds-bar"/>
                        <img src={dr_bar} class="dr-bar"/>
                    </div>
                </div>
            </div>
        </div>
    )
}