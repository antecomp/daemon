import './styles/opp-statusbar.css'
import name_postcut from '../assets/name-postcut.png'
import sbb_left from '../assets/sbb-left.png'
import sbb_right from '../assets/sbb-right.png'
import { AssetURL } from '@/shared/types/misc.types';
import { Accessor, createEffect, For, JSX, on } from 'solid-js';
import { MoveLexeme, MoveLexicon } from '../lexicon/moveLexicon';
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
                onMouseEnter={() => props.showTooltip(() => <MoveTooltipContent runeName={props.moveName as MoveLexeme} lexicon={props.lexicon}/>)}
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

    const opponentStatusBarRef = createBattleRefAttacher('opponentStatusbar');

    // Hide tooltip when plan updates.
    createEffect(on(() => props.planPreview, () => hideTooltip()));

    return (
        <>
        <TooltipComponent/>
        <div class="opp-statusbar-container" ref={opponentStatusBarRef}>
            <img src={props.icon} class="opp-icon"/>
            <div class="opp-bar">
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
            <div class="opp-hint-container" ref={sequenceViewOpponentRef}>
                <For each={props.planPreview}>
                    {(plannedMove, idx) => <OppPlanEntry lexicon={props.lexicon} isExecuting={idx() === props.currentlyExecutingMoveIndex()} moveName={plannedMove} {...{showTooltip, hideTooltip}}/>}
                </For>
            </div>
        </div>
        </>
    )
}