import ai_plain_icon from '@/features/battle/assets/icons/battle-alerts/plain.png'
import ai_heal_icon from '@/features/battle/assets/icons/battle-alerts/heal.png'
import ai_focus_icon from '@/features/battle/assets/icons/battle-alerts/focus.png'
import ai_mania_icon from '@/features/battle/assets/icons/battle-alerts/mania.png'

export type ActionIconTable = Record<
    "default" | "heal" | "focus" | "mania", 
    string
>

export interface ActionMessage {
    icon?: keyof ActionIconTable
    text: string
}
export type ActionMessageAppender = (text: string, icon?: keyof ActionIconTable) => void;

export const actionIcons: ActionIconTable = {
    "default": ai_plain_icon,
    "heal": ai_heal_icon,
    "focus": ai_focus_icon,
    "mania": ai_mania_icon
}