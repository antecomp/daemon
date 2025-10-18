import ai_plain_icon from '@/features/battle/assets/icons/battle-alerts/plain.png'
import ai_heal_icon from '@/features/battle/assets/icons/battle-alerts/heal.png'
import ai_focus_icon from '@/features/battle/assets/icons/battle-alerts/focus.png'
import ai_mania_icon from '@/features/battle/assets/icons/battle-alerts/mania.png'
import { AssetURL } from '@/shared/types/misc.types'

export interface ActionMessage {
    iconName?: string
    text: string
}
export type ActionMessageAppender = (text: string, iconName?: string) => void;

export const actionIcons: Record<string, AssetURL | undefined> = {
    "default": ai_plain_icon,
    "heal": ai_heal_icon,
    "focus": ai_focus_icon,
    "mania": ai_mania_icon
}