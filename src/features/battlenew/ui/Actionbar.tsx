
import './actionbar.css'
import eject_button from '../assets/eject-button.png'
import reset_button from '../assets/reset-button.png'
import exec_button from '../assets/exec-button.png'
import fch_bar from '../assets/f-ch-bar.png'
import ur_bar from '../assets/mult_ur.png'
import us_bar from '../assets/mult_us.png'
import dr_bar from '../assets/mult_dr.png'
import ds_bar from '../assets/mult_ds.png'
import { Accessor, createSignal, For } from 'solid-js'
import { BattleOutcome, DamageMultipliers } from '@/core/battlenew/model/battle'
import { BattleUIState, useBattleUIState } from '../Battle'
import { PlannedSequence } from '@/core/battlenew/model/plannedmove'
import { MoveLexicon } from '@/core/battlenew/lexicon/lexicon.types'
import Runebuilder from './Runebuilder'

interface SelectedMoveProps {
    icon?: string // img url
    name: string
}

function SelectedMove(props: SelectedMoveProps) {
    return (
        <span class="player-move">
            <div>
                <img src={props.icon}/>
                {props.name}
            </div>
        </span>
    )
}

interface ActionbarProps {
    executeRound: (playerPlan: PlannedSequence) => Promise<void>
    playerHealthPercentage: Accessor<number>,
    playerMults: Accessor<DamageMultipliers>,
    opponentMults: Accessor<DamageMultipliers>,
    // currentStatuses
    forceBattleResolve: (outcome: BattleOutcome) => Promise<void>
    lexicon: MoveLexicon
}

// Scaling from a multiplier range of 1/5 to 5 to a nice percentage amount for visualization
// Clamps <1/5 to 0% and >5 to 100%
function mapMultiplier(multiplier: number): number {
    const oldMin = 1 / 5, oldMax = 5;
    const newMin = 0, newMax = 100;

    // Clamp x within the valid range
    multiplier = Math.max(oldMin, Math.min(multiplier, oldMax));

    return ((multiplier - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;

}

export default function Actionbar(props: ActionbarProps) {
    const {battleUIState, setBattleUIState} = useBattleUIState();

    const handleEject = () => {
        if(battleUIState() == BattleUIState.READY || battleUIState() == BattleUIState.WAITING) {
            props.forceBattleResolve(BattleOutcome.PlayerEject);
        }
    }

    // Just buffer the plans by name, then we will map to the actual logical object from some bank
    const [planBuffer, setPlanBuffer] = createSignal<string[]>([]);
    const appendToPlan = (toAdd: string) => {
        if(battleUIState() != BattleUIState.WAITING) return;

        setPlanBuffer(prev => {
            // Validate Before Adding

            // Add (Return Updated)

            // Run state update side effect if appropriate (sequence ready)

            return prev; // noop
        })
    }

    const handleExecClick = async () => {
        // todo
    }

    const resetPlan = () => {
        // check if battle state allows this
        // set plan buffer to []
    }

    return (
        <div id="battle-actionbar">
            <div class="left">
                <img src={eject_button} id="eject-button"
                    onClick={handleEject}
                />
            </div>
            <Runebuilder
                lexicon={props.lexicon}
                appendToPlan={appendToPlan}
                planBuffer={planBuffer()}
            />
            <div id="rb-buttons">
                <img
                    id='reset-button'
                    src={reset_button}
                    onClick={resetPlan} 
                    classList={{usable: planBuffer().length > 0}}
                />
                <img
                    id='exec-button'
                    src={exec_button}
                    classList={{ usable: (battleUIState() == BattleUIState.READY) }}
                    onClick={handleExecClick}
                />
            </div>
            <div class="right">
                <div class="moves">
                    {/* <For each={sequenceBuffer()}>
                        {(x) => <SelectedMove {...x} />}
                    </For> */}
                </div>
                <img src={fch_bar} id="fch-bar" style={`--level: ${props.playerHealthPercentage()}%`} />
                <div id="multbars">
                    <div class="userbars">
                        <img src={ur_bar} class="ur-bar" style={`--level: ${mapMultiplier(props.playerMults().incoming)}%`} />
                        <img src={us_bar} class="us-bar" style={`--level: ${mapMultiplier(props.playerMults().outgoing)}%`} />
                    </div>
                    <div class="dbars">
                        <img src={ds_bar} class="ds-bar" style={`--level: ${mapMultiplier(props.opponentMults().outgoing)}%`} />
                        <img src={dr_bar} class="dr-bar" style={`--level: ${mapMultiplier(props.opponentMults().incoming)}%`} />
                    </div>
                    <div class="player-statuses">
                        {/* <For each={props.currentStatuses().player}>
                            {stat => <img class="status-icon" src={stat} />}
                        </For> */}
                    </div>
                    <div class="opp-statuses">
                        {/* <For each={props.currentStatuses().opp}>
                            {stat => <img class="status-icon" src={stat} />}
                        </For> */}
                    </div>
                </div>
            </div>
        </div>
    )
}