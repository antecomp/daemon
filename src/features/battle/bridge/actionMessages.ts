import ai_plain_icon from '@/features/battle/assets/icons/battle-alerts/plain.png'
import ai_heal_icon from '@/features/battle/assets/icons/battle-alerts/heal.png'
import ai_focus_icon from '@/features/battle/assets/icons/battle-alerts/focus.png'
import ai_mania_icon from '@/features/battle/assets/icons/battle-alerts/mania.png'
import { Side, Sides } from '@/core/battle/utils/sides.utils'
import { MoveLexicon } from '../lexicon/moveLexicon'
import { BattleEventPayload } from '@/core/battle/model/battleReactions'
import { OpponentProfile } from './battleProfiles'
import { capitalizeFirstLetter, capitalizeWords } from '@/shared/utils/stringUtils'

/** Mapping of a action message icon by name to it's AssetURL */
export const actionIcons = {
    "default": ai_plain_icon,
    "heal": ai_heal_icon,
    "focus": ai_focus_icon,
    "mania": ai_mania_icon
}

/**
 * Narrowed set of icon identifiers that can be referenced by action messages.
 */
type AvailableActionIcons = keyof typeof actionIcons;

/** A single "Action Message" (battle notification). Has some text and can be decorated with an icon (@ref AvailableActtionIcons) */
export interface ActionMessage {
    iconName?: AvailableActionIcons
    text: string
}

/** Function signature for appending a new action message. Used as appendActionMessage is passed between many components. */
export type ActionMessageAppender = (text: string, iconName?: AvailableActionIcons) => void;

// Helper to resolve and format a display name of the opponent/player for action messages.
function nameOfAffected(perspective: Side, profile: OpponentProfile) {
    return perspective == 'player' ? 'Arda' : capitalizeWords(profile.display.name);
}

/** Helper that maps some move emission to a related action message. Use this (in combination with new move emission declarations) to add new 'notifications' for certain move behaviors. */
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