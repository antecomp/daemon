import { For, onMount } from 'solid-js'
import './opp-statusbar.css'
import name_postcut from '../assets/name-postcut.png'
import sbb_left from '../assets/sbb-left.png'
import sbb_right from '../assets/sbb-right.png'
// import insight_label from '../assets/insight-label.png'
import { MoveMeta } from '@/core/battle/moves/moves.types'
import { registerBattleUIRef } from './refRegistry'


interface OppStatusBarProps {
    icon: string // img url
    name: string
    health: number
    // sequenceHint?: MoveData[]
    sequenceHint?: (MoveMeta | undefined)[]
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

    let sequenceViewOpponentRef: HTMLDivElement | undefined = undefined;
    onMount(() => {
        registerBattleUIRef('sequenceViewOpponent', sequenceViewOpponentRef);
    })

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
            <div id="opp-hint-container" ref={sequenceViewOpponentRef}>
                {/* <img src={insight_label} class='insight-label' /> */}
                <For each={props.sequenceHint}>
                    {(x) => <OppHint {...x}/>}
                </For>
            </div>
        </div>
    )
}