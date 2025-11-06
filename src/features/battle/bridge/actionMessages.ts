import ai_plain_icon from '@/features/battle/assets/icons/battle-alerts/plain.png'
import ai_heal_icon from '@/features/battle/assets/icons/battle-alerts/heal.png'
import ai_focus_icon from '@/features/battle/assets/icons/battle-alerts/focus.png'
import ai_mania_icon from '@/features/battle/assets/icons/battle-alerts/mania.png'
import { oppositeSide, Sides } from '@/core/battle/utils/sides.utils'
import { MoveLexicon } from '../lexicon/moveLexicon'
import { BattleEventPayload } from '@/core/battle/model/battleReactions'
import { OpponentProfile } from './battleProfiles'
import { capitalizeFirstLetter, capitalizeWords } from '@/shared/utils/stringUtils'
import { MAIN_CHARACTER_NAME } from '@/config/init.config'

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

/** Helper that maps some move emission to a related action message. Use this (in combination with new move emission declarations) to add new 'notifications' for certain move behaviors. */
// TODO - I STILL THINK THIS IS REALLY GROSS AND HARD TO EXTEND. CONSIDER OVERHAULING HOW WE HANDLE THE MOVE EMISSIONS!!!!!
// I think switching to a pattern that is like the UI side effect stuff (or even incorporated into that) would be a much smarter play.
export function generateActionMessageFromMoveEmission(data: BattleEventPayload['MoveEmission'], opponentProfile: OpponentProfile, lexicons: Sides<MoveLexicon>, appendActionMessage: ActionMessageAppender) {
    const {moveName, signal, perspective} = data;

    // Opponent has their own handler for a move emission. Will return true if they want to skip the default handler.
    const opponentMoveEmissionHandler = opponentProfile.display.behaviors?.moveEmissionHandler;
    if(opponentMoveEmissionHandler && opponentMoveEmissionHandler(data, opponentProfile, lexicons, appendActionMessage)) return;

    const nameOfAffected = (flip?: true) => {
        const p = flip ? oppositeSide(perspective) : perspective;
        return p == 'player'
            ? MAIN_CHARACTER_NAME
            : capitalizeWords(opponentProfile.display.name);
    }

    switch(signal.type) {
        case 'effect:heal':
            const {amount, capped} = signal.payload
            if(capped) {
                appendActionMessage(`${nameOfAffected()}'s health is maxxed out!`, 'heal');
            } else {
                appendActionMessage(`${nameOfAffected()} healed for ${amount}`, 'heal');
            }
            break;
        case 'mechanic:focus':
            if(signal.payload.lost) appendActionMessage(`${nameOfAffected()} lost focus and was unable to use ${capitalizeFirstLetter(lexicons[perspective][moveName as keyof MoveLexicon].label)}`);
            break;
        case 'mechanic:mania':
            if(signal.payload.manic) appendActionMessage(`${nameOfAffected()} dodges swiftly. ${nameOfAffected()} feels invigorated!`, 'mania')
            break;
        case 'status:prepare':
            switch(signal.payload.level) {
                case 1: appendActionMessage(`${nameOfAffected()}'s vision narrows`, 'focus'); break;
                case 2: appendActionMessage(`${nameOfAffected()} is ready for anything.`, 'focus'); break;
            }
            break;
        // I THINK THE TIMING OF THIS WILL BE OFF. THESE PLAY AT THE END -- CONSIDER MOVING TO BE A MOVE UI SIDE EFFECT!
        case 'mechanic:observe':
            appendActionMessage(`${nameOfAffected()} stares down ${nameOfAffected(true)}`)
    }
}