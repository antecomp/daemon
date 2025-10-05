import './move-tooltip-content.css'
import { PlayerRuneName } from "@/core/battlenew/moves/runeRegistry"
import { MoveLexicon } from "@/features/battlenew/lexicon/lexicon.types"

interface MoveTooltipContentProps {
    runeName: PlayerRuneName
    lexicon: MoveLexicon
}

export const MoveTooltipContent = (props: MoveTooltipContentProps) => {

    const entry = props.lexicon[props.runeName]

    return (
        <div class='move-tooltip-content'>
            <div class="header">
                <p>{entry.label}</p>
                <img src={entry.icon}/>
            </div>
            <p>{entry.lore}</p>
        </div>
    )
}