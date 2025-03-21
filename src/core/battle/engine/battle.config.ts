import ai_plain_icon from '@/assets/icons/battle-alerts/plain.png'
import ai_heal_icon from '@/assets/icons/battle-alerts/heal.png'
import ai_focus_icon from '@/assets/icons/battle-alerts/focus.png'
import ai_mania_icon from '@/assets/icons/battle-alerts/mania.png'

/** Delay between showing notifications/mults and dealing damage */
export const DAMAGE_DELAY = 500;

/** Delay between each move. */
export const MOVE_DELAY = 2000;

/** How long an action message is on screen before fading */
export const NOTIFICATION_LIFESPAN = 3500;

/** Delay before the round starts */ // <- REPLACE WITH ANIM STUFF
export const PREROUND_DELAY = 1000;

/** Player starting/max health - will likely be updated/linked to a global store. */
export const PLAYER_HEALTH_PLACEHOLDER = 10;

/** How many moves in a turn, aka the "sequence" */
export const SEQUENCE_LENGTH = 5;

export type ActionIconTable = Record<
    "default" | "heal" | "focus" | "mania", string
>
export const actionIcons: ActionIconTable = {
    "default": ai_plain_icon,
    "heal": ai_heal_icon,
    "focus": ai_focus_icon,
    "mania": ai_mania_icon
}