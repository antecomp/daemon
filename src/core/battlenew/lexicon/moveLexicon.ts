import { MoveLexicon } from "./lexicon.types"

import apprentice_icon_ex from '../icons/apprentice_ex.png'
import candle_icon_ex from '../icons/candle_ex.png'
import chain_icon_ex from '../icons/chain_ex.png'
import hourglass_icon_ex from '../icons/hourglass_ex.png'
import mage_icon_ex from '../icons/mage_ex.png'
import prae_icon_ex from '../icons/prae_ex.png'
import priestess_icon_ex from '../icons/priestess_ex.png'
import trickster_icon_ex from '../icons/trickster_ex.png'

import candle_icon from '../icons/candle.png'
import apprentice_icon from '../icons/apprentice.png'
import chain_icon from '../icons/chains.png'
import hourglass_icon from '../icons/hourglass.png'
import mage_icon from '../icons/mage.png'
import prae_icon from '../icons/PRAETORIAN.png'
import priestess_icon from '../icons/priestess.png'
import trickster_icon from '../icons/trickster.png'
import stock_icon from "@/features/battle/assets/placeholder_move_icon.png"

// map planned moves by ID to their associated UI fallback data.
export const BASE_MOVE_LEXICON: MoveLexicon = {
    repeat: {
        label: "repeat",
        icon: apprentice_icon,
        largeIcon: apprentice_icon_ex
    },

    evade: {
        label: "evade",
        icon: trickster_icon,
        largeIcon: trickster_icon_ex
    },

    heal: {
        label: "heal",
        icon: priestess_icon,
        largeIcon: priestess_icon_ex
    },

    prepare: {
        label: "prepare",
        icon: hourglass_icon,
        largeIcon: hourglass_icon_ex
    },

    defend: {
        label: "defend",
        icon: prae_icon,
        largeIcon: prae_icon_ex
    },

    attack: {
        label: "attack",
        icon: candle_icon,
        largeIcon: candle_icon_ex
    },

    overwhelm: {
        label: "overwhelm",
        icon: chain_icon,
        largeIcon: chain_icon_ex
    },

    mirror: {
        label: "mirror",
        icon: mage_icon,
        largeIcon: mage_icon_ex
    },

    idle: {
        label: "idle",
        icon: stock_icon,
    },
}

// Reminder;
/* *
const merged = { ...a, ...b };
First, all properties from a are copied into the new object.

Then, all properties from b are copied in.

If b has the same property key as a, it overwrites the value from a.

Use this to have defaults (such as icons kept) for the moves, while shadowing other parts.
*/