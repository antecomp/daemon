import { For } from 'solid-js'
import icon from './assets/placeholder_icon.png'
import './opp-statusbar.css'
import name_postcut from './assets/name-postcut.png'
import sbb_left from './assets/sbb-left.png'
import sbb_right from './assets/sbb-right.png'
import insight_label from './assets/insight-label.png'
import placeholder_move_icon from './assets/placeholder_move_icon.png'
import { MoveData } from '@/core/battle/battle.types'


interface OppStatusBarProps {
    icon: string // img url
    name: string
    health: number
    // sequenceHint?: MoveData[]
    sequenceHint?: [MoveData?, MoveData?, MoveData?, MoveData?, MoveData?]
}

interface OppHintProps {
    icon?: string // url
    displayName?: string
}

function OppHint(props: OppHintProps) {
    return (
        <span class="opp-hint">
            <div>
                {props.icon && <img src={props.icon} alt="" />}
                {props.displayName ?? "???"}
            </div>
        </span>
    )
}


export default function OppStatusBar(props: OppStatusBarProps) {
    return (
        <div id="opp-statusbar-container">
            <img src={props.icon} alt="" id="opp-icon" />
            <div id="opp-bar">
                <div class="nametag">
                    <span>{props.name}</span>
                    <img src={name_postcut} />
                </div>
                <div class="statbar" style={{"--level": `${props.health}%`}}>
                        <img class="front" src={sbb_left} />
                        <div class='middle'></div>
                        <img src={sbb_right}  />
                </div>
            </div>
            <div id="opp-hint-container">
                <img src={insight_label} class='insight-label' />
                <For each={props.sequenceHint}>
                    {(x) => <OppHint {...x}/>}
                </For>
            </div>
        </div>
    )
}