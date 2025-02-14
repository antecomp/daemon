import { For } from 'solid-js'
import icon from './assets/placeholder_icon.png'
import './opp-statusbar.css'
import name_postcut from './assets/name-postcut.png'
import sbb_left from './assets/sbb-left.png'
import sbb_right from './assets/sbb-right.png'
import insight_label from './assets/insight-label.png'
import placeholder_move_icon from './assets/placeholder_move_icon.png'


interface OppStatusBarProps {
    icon?: string // img url
    name: string
    level: number
    //sequenceHint?: 
}

interface OppHintProps {
    icon?: string // url
    text: string
}

function OppHint(props: OppHintProps) {
    return (
        <span class="opp-hint">
            <div>
                <img src={props.icon} alt="" />
                {props.text}
            </div>
        </span>
    )
}


export default function OppStatusBar(props: OppStatusBarProps) {
    return (
        <div id="opp-statusbar-container">
            <img src={icon} alt="" id="opp-icon" />
            <div id="opp-bar">
                <div class="nametag">
                    <span>{props.name}</span>
                    <img src={name_postcut} />
                </div>
                <div class="statbar" style={{"--level": `${props.level}%`}}>
                        <img class="front" src={sbb_left} />
                        <div class='middle'></div>
                        <img src={sbb_right}  />
                </div>
            </div>
            <div id="opp-hint-container">
                <img src={insight_label} class='insight-label' />
                <For each={[
                    {
                        icon: placeholder_move_icon,
                        text: "Move"
                    },
                    {
                        text: "?"
                    },
                    {
                        text: "?"
                    },
                    {
                        icon: placeholder_move_icon,
                        text: "Sloppa"
                    },
                    {
                        text: "?"
                    },
                ]}>
                    {(x) => <OppHint {...x}/>}
                </For>
            </div>
        </div>
    )
}