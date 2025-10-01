
import './actionbar.css'
import eject_button from '../assets/eject-button.png'
import reset_button from '../assets/reset-button.png'
import exec_button from '../assets/exec-button.png'
import fch_bar from '../assets/f-ch-bar.png'
import ur_bar from '../assets/mult_ur.png'
import us_bar from '../assets/mult_us.png'
import dr_bar from '../assets/mult_dr.png'
import ds_bar from '../assets/mult_ds.png'
import { Accessor } from 'solid-js'
import { DamageMultipliers } from '@/core/battlenew/model/battle'
import { useBattleUIState } from '../Battle'

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

    return (
        <></>
    )
}