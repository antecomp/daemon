import './move-tooltip-content.css'
import { PlayerRuneName } from "@/core/battle/moves/runeRegistry"
import { MoveLexicon } from '../lexicon/moveLexicon'

import br from '@/assets/ui/corners/s4/tl.png'
import CornerRect from '@/shared/ui/primitives/corner-rect/CornerRect'

interface MoveTooltipContentProps {
    runeName: PlayerRuneName
    lexicon: MoveLexicon
}

export const MoveTooltipContent = (props: MoveTooltipContentProps) => {

    const entry = props.lexicon[props.runeName]

    return (
        <CornerRect width='225px' class='move-tooltip-content' borderSize={1} borderType='solid white' corners={[undefined, undefined, undefined, br]}>
            <div class="header">
                <p>{entry.label}</p>
                <img src={entry.icon}/>
            </div>
            <p>{entry.lore}</p>
        </CornerRect>
    )
}