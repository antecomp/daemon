import { AssetURL } from '@/extra.types'
import './move-tooltip-content.css'

interface MoveTooltipContentProps {
    icon: AssetURL
    displayName: string
    description: string
    rb?: true
}

export const MoveTooltipContent = (props: MoveTooltipContentProps) => {
    return (
        <div class='move-tooltip-content'>
            <div class="header">
                <p>{props.displayName}</p>
                <img src={props.icon}/>
            </div>
            <p>{props.description}</p>
        </div>
    )
}