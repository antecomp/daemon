import ai_plain_icon from '@/features/battle/assets/icons/battle-alerts/plain.png'
import ai_heal_icon from '@/features/battle/assets/icons/battle-alerts/heal.png'
import ai_focus_icon from '@/features/battle/assets/icons/battle-alerts/focus.png'
import ai_mania_icon from '@/features/battle/assets/icons/battle-alerts/mania.png'
import { AssetURL } from '@/shared/types/misc.types'
import { Side, Sides } from '@/core/battlenew/utils/sides.utils'
import { MoveLexicon } from '../lexicon/lexicon.types'
import { BattleEventPayload } from '@/core/battlenew/events/battleEvent.types'
import { OpponentProfile } from './battleProfiles'
import { capitalizeFirstLetter } from '@/shared/utils/stringUtils'

export const actionIcons = {
    "default": ai_plain_icon,
    "heal": ai_heal_icon,
    "focus": ai_focus_icon,
    "mania": ai_mania_icon
}

type availableActionIcons = keyof typeof actionIcons;

export interface ActionMessage {
    iconName?: availableActionIcons
    text: string
}
export type ActionMessageAppender = (text: string, iconName?: availableActionIcons) => void;

function nameOfAffected(perspective: Side, profile: OpponentProfile) {
    return perspective == 'player' ? 'Arda' : profile.display.name
}

export function generateActionMessageFromMoveEmission(data: BattleEventPayload['MoveEmission'], opponentProfile: OpponentProfile, lexicons: Sides<MoveLexicon>, appendActionMessage: ActionMessageAppender) {
    const {moveName, signal, perspective} = data;

    switch(signal.type) {
        case 'effect:heal':
            const {amount, capped} = signal.payload
            if(capped) {
                appendActionMessage(`${nameOfAffected(perspective, opponentProfile)}'s health is maxxed out!`, 'heal');
            } else {
                appendActionMessage(`${nameOfAffected(perspective, opponentProfile)} healed for ${amount}`, 'heal');
            }
            break;
        case 'mechanic:focus':
            if(signal.payload.lost) appendActionMessage(`${nameOfAffected(perspective, opponentProfile)} lost focus and was unable to use ${capitalizeFirstLetter(lexicons[perspective][moveName as keyof MoveLexicon].label)}`);
            break;
        case 'mechanic:mania':
            if(signal.payload.manic) appendActionMessage(`${nameOfAffected(perspective, opponentProfile)} dodges swiftly. ${nameOfAffected(perspective, opponentProfile)} feels invigorated!`, 'mania')
            break;
        case 'status:prepare':
            switch(signal.payload.level) {
                case 1: appendActionMessage(`${nameOfAffected(perspective, opponentProfile)}'s vision narrows`, 'focus'); break;
                case 2: appendActionMessage(`${nameOfAffected(perspective, opponentProfile)} is ready for anything.`, 'focus'); break;
            }
            break;
    }
}