import './opp-statusbar.css'
import name_postcut from '../assets/name-postcut.png'
import sbb_left from '../assets/sbb-left.png'
import sbb_right from '../assets/sbb-right.png'
import { AssetURL } from '@/shared/types/misc.types';
import { Accessor, For, JSX } from 'solid-js';
import { MoveLexemes, MoveLexicon } from '../lexicon/moveLexicon';
import { createBattleRefAttacher } from '../animation/uiAnimations/battleUIRefRegistry';
import { keyInObject } from '@/shared/utils/keyInObject';
import { createTooltip } from '@/shared/hooks/createTooltip';
import { MoveTooltipContent } from './MoveTooltipContent';

interface OpponentStatusBarProps {
    name: string;
    icon: AssetURL;
    health: number;
    planPreview: (string | null)[];
    lexicon: MoveLexicon,
    currentlyExecutingMoveIndex: Accessor<number | null>
}


const OBFUSCATED_MOVE_STRING = `???`;

function OppPlanEntry(props: {
    lexicon: MoveLexicon, 
    moveName: string | null, 
    isExecuting: boolean,
    showTooltip: (content: () => JSX.Element) => void,
    hideTooltip: () => void
}) {
    const entry = props.moveName && keyInObject(props.lexicon, props.moveName)
        ? props.lexicon[props.moveName]
        : null

    if (!entry) {
        return <span class="opp-hint"><div>{OBFUSCATED_MOVE_STRING}</div></span>
    }

    return (
        <span class="opp-hint" classList={{executing: props.isExecuting}}>
            <div
                onMouseEnter={() => props.showTooltip(() => <MoveTooltipContent runeName={props.moveName as MoveLexemes} lexicon={props.lexicon}/>)}
                onMouseOut={() => props.hideTooltip()}
            >
                <img src={entry.icon}/>
                {entry.label}
            </div>
        </span>
    )
}

export default function OpponentStatusBar(props: OpponentStatusBarProps) {

    const sequenceViewOpponentRef = createBattleRefAttacher('sequenceViewOpponent');

    const {showTooltip, hideTooltip, TooltipComponent } = createTooltip();

    return (
        <>
        <TooltipComponent/>
        <div id="opp-statusbar-container">
            <img src={props.icon} id="opp-icon"/>
            <div id="opp-bar">
                <div class="nametag">
                    <span>{props.name.toUpperCase()}</span>
                    <img src={name_postcut} />
                </div>
                <div class="statbar" style={{'--level': `${props.health}%`}}>
                    <img class="front" src={sbb_left}/>
                    <div class='middle'></div>
                    <img src={sbb_right}/>
                </div>
            </div>
            <div id="opp-hint-container" ref={sequenceViewOpponentRef}>
                <For each={props.planPreview}>
                    {(plannedMove, idx) => <OppPlanEntry lexicon={props.lexicon} isExecuting={idx() === props.currentlyExecutingMoveIndex()} moveName={plannedMove} {...{showTooltip, hideTooltip}}/>}
                </For>
            </div>
        </div>
        </>
    )
}