import './styles/move-tooltip-content.css'
import { FALLBACK_MOVE_DISPLAY_ENTRY, MoveLexeme, MoveLexicon } from '../lexicon/moveLexicon'

import br from '@/assets/ui/corners/s4/tl.png'
import CornerRect from '@/shared/ui/primitives/corner-rect/CornerRect'

interface MoveTooltipContentProps {
    runeName: MoveLexeme
    lexicon: MoveLexicon
}

const MOVE_TOOLTIP_SIZE = 225;

export const MoveTooltipContent = (props: MoveTooltipContentProps) => {

    const entry = props.lexicon[props.runeName] ?? {...FALLBACK_MOVE_DISPLAY_ENTRY, label: props.runeName};

    return (
        <CornerRect width={`${MOVE_TOOLTIP_SIZE}px`} class='move-tooltip-content' borderSize={1} borderType='solid white' corners={[undefined, undefined, undefined, br]}>
            <div class="header">
                <p>{entry.label}</p>
                <img src={entry.icon}/>
            </div>
            <p>{entry.description}</p>
            <br />
            <p style={{color: 'gray'}}>{entry.lore}</p>
        </CornerRect>
    )
}