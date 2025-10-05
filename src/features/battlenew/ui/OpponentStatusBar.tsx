import './opp-statusbar.css'
import name_postcut from '../assets/name-postcut.png'
import sbb_left from '../assets/sbb-left.png'
import sbb_right from '../assets/sbb-right.png'
import { AssetURL } from '@/shared/types/misc.types';
import { Accessor, For } from 'solid-js';
import { MoveLexicon } from '@/features/battlenew/lexicon/lexicon.types';

interface OpponentStatusBarProps {
    name: string;
    icon: AssetURL;
    health: number;
    planPreview: (string | null)[]; // TODO: Eventually this will be a proper thing with the icon.
    lexicon: MoveLexicon,
    currentlyExecutingMoveIndex: Accessor<number | null>
}

function OppPlanEntry(props: {icon?: AssetURL, label: string, isExecuting: boolean}) {
    return <span class="opp-hint" classList={{executing: props.isExecuting}}>
            <div>
                {props.icon && <img src={props.icon}/>}
                {props.label}
            </div>        
    </span>
}

export default function OpponentStatusBar(props: OpponentStatusBarProps) {
    return (
        <div id="opp-statusbar-container">
            <img src={props.icon} id="opp-icon" />
            <div id="opp-bar">
                <div class="nametag">
                    <span>{props.name}</span>
                    <img src={name_postcut} />
                </div>
                <div class="statbar" style={{'--level': `${props.health}%`}}>
                    <img class="front" src={sbb_left}/>
                    <div class='middle'></div>
                    <img src={sbb_right}/>
                </div>
            </div>
            <div id="opp-hint-container">
                <For each={props.planPreview}>
                    {(plannedMove, idx) => <OppPlanEntry isExecuting={idx() == props.currentlyExecutingMoveIndex()} {...(plannedMove ? props.lexicon[plannedMove] : {label: '???'})}/>}
                </For>
            </div>
        </div>

    )
}