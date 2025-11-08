import ai_plain_icon from '@/features/battle/assets/icons/battle-alerts/plain.png'
import ai_heal_icon from '@/features/battle/assets/icons/battle-alerts/heal.png'
import ai_focus_icon from '@/features/battle/assets/icons/battle-alerts/focus.png'
import ai_mania_icon from '@/features/battle/assets/icons/battle-alerts/mania.png'

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