import './actionbar.css'
import Runebuilder from './Runebuilder'
import eject_button from '../assets/eject-button.png'
import reset_button from '../assets/reset-button.png'
import exec_button from '../assets/exec-button.png'
import fch_bar from '../assets/f-ch-bar.png'

import ur_bar from '../assets/mult_ur.png'
import us_bar from '../assets/mult_us.png'
import dr_bar from '../assets/mult_dr.png'
import ds_bar from '../assets/mult_ds.png'
import { Accessor, createSignal, For, onMount } from 'solid-js'
import { MultiplierSet } from '@/core/battle/engine/battle.types'
import { PlayerMoveMeta } from '@/core/battle/moves/moves.types'
import { BattleUIState, useBattleUIState } from '@/core/battle/engine/battle.context'
import { playerMoves } from '@/core/battle/moves/metas/player'
import { requestOverlayAnimation } from '@/core/battle/animation/useOverlayAnim'
import { registerBattleUIRef } from './refRegistry'

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
    execSequence: (userSelectedSequence: PlayerMoveMeta[]) => Promise<void>
    playerHealth: number
    playerMults: Accessor<MultiplierSet>
    opponentMults: Accessor<MultiplierSet>
    currentStatuses: Accessor<{player: string[], opp: string[]}>
}

function mapMultiplier(x: number): number {
    const oldMin = 1 / 5, oldMax = 5;
    const newMin = 0, newMax = 100;

    // Clamp x within the valid range
    x = Math.max(oldMin, Math.min(x, oldMax));

    return ((x - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;

}

export default function Actionbar(props: ActionbarProps) {

    const {battleUIState, setBattleUIState} = useBattleUIState();

    let sequenceVisConRef: HTMLDivElement | undefined = undefined;

    // Will be gathered from game store later...
    const playerMoveBin: PlayerMoveMeta[] = Object.values(playerMoves);

    const [sequenceBuffer, setSequenceBuffer] = createSignal<PlayerMoveMeta[]>([]);

    const addRune = (toAdd: PlayerMoveMeta) => {
        if(sequenceBuffer().length == 5) return;
        if(battleUIState() != BattleUIState.WAITING) return;

        setSequenceBuffer(prev => {
            const rtn = (prev.some(item => item == toAdd)) ? prev: [...prev, toAdd] // Add (enforce unique).
            if(rtn.length == 5) {
                setBattleUIState(BattleUIState.READY)
                console.log(battleUIState());
            }
            return rtn;
        });
    }

    const handleExecClick = async () => {
        if(battleUIState() != BattleUIState.READY) return;
        await props.execSequence(sequenceBuffer());
        setSequenceBuffer([]); // Reset for next round.
    }

    const resetRunes = () => {
        if (battleUIState() == BattleUIState.READY) setBattleUIState(BattleUIState.WAITING);
        setSequenceBuffer([]);
    }

    onMount(() => {
        registerBattleUIRef("sequenceViewPlayer", sequenceVisConRef);
    });


    return (
        <div id="battle-actionbar">
            <div class="left">
                <img src={eject_button} id='eject-button' 
                    onClick={async () => {await requestOverlayAnimation("shield", [0, 0]); console.log("animation complete")}} 
                />
                <Runebuilder availRunes={playerMoveBin} addRune={addRune} sequenceBuffer={sequenceBuffer()}/>
                <div id="rb-buttons">
                    <img 
                        id='reset-button' 
                        src={reset_button} 
                        onClick={resetRunes} 
                        classList={{usable: sequenceBuffer().length > 0}}
                    />
                    <img
                        id='exec-button'
                        src={exec_button}
                        onClick={handleExecClick}
                        classList={{usable: (battleUIState() == BattleUIState.READY)}}
                    />
                </div>
            </div>
            <div class="right">
                <div class="moves" ref={sequenceVisConRef}>
                    <For each={sequenceBuffer()}>
                        {(x) => <SelectedMove {...x}/>}
                    </For>
                </div>
                <img src={fch_bar} id="fch-bar" style={`--level: ${props.playerHealth}%`} />
                <div id="multbars">
                    <div class="userbars">
                        <img src={ur_bar} class="ur-bar" style={`--level: ${mapMultiplier(props.playerMults().incoming)}%`}/>
                        <img src={us_bar} class="us-bar" style={`--level: ${mapMultiplier(props.playerMults().outgoing)}%`}/>
                    </div>
                    <div class="dbars">
                        <img src={ds_bar} class="ds-bar" style={`--level: ${mapMultiplier(props.opponentMults().outgoing)}%`}/>
                        <img src={dr_bar} class="dr-bar" style={`--level: ${mapMultiplier(props.opponentMults().incoming)}%`}/>
                    </div>
                    <div class="player-statuses">
                        <For each={props.currentStatuses().player}>
                            {stat => <img class="status-icon" src={stat} />}
                        </For>
                    </div>
                    <div class="opp-statuses">
                        <For each={props.currentStatuses().opp}>
                            {stat => <img class="status-icon" src={stat}/>}
                        </For>
                    </div>
                </div>
            </div>
            {/* {battleUIState()} */}
        </div>
    )
}