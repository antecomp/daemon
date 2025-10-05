import { MoveLexicon } from "./lexicon.types"

import apprentice_icon_ex from '../assets/icons/runes/apprentice_ex.png'
import candle_icon_ex from '../assets/icons/runes/candle_ex.png'
import chain_icon_ex from '../assets/icons/runes/chain_ex.png'
import hourglass_icon_ex from '../assets/icons/runes/hourglass_ex.png'
import mage_icon_ex from '../assets/icons/runes/mage_ex.png'
import prae_icon_ex from '../assets/icons/runes/prae_ex.png'
import priestess_icon_ex from '../assets/icons/runes/priestess_ex.png'
import trickster_icon_ex from '../assets/icons/runes/trickster_ex.png'

import candle_icon from '../assets/icons/runes/candle.png'
import apprentice_icon from '../assets/icons/runes/apprentice.png'
import chain_icon from '../assets/icons/runes/chains.png'
import hourglass_icon from '../assets/icons/runes/hourglass.png'
import mage_icon from '../assets/icons/runes/mage.png'
import prae_icon from '../assets/icons/runes/PRAETORIAN.png'
import priestess_icon from '../assets/icons/runes/priestess.png'
import trickster_icon from '../assets/icons/runes/trickster.png'
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

export const PLAYER_BASE_MOVE_LEXICON = {
    repeat: {
        label: "apprentice",
        icon: apprentice_icon,
        largeIcon: apprentice_icon_ex,
        lore: `Like the flowers, knowledge comes from the rotting ones. \n \n Maintain momentum. Repeats previous rune. \n Cannot be used first.`,        
    },

    evade: {
        label: "trickster",
        icon: trickster_icon,
        largeIcon: trickster_icon_ex,
        lore: `Our first understanding of self comes from a two-faced fox. \n\n Localized distortion of existence, chance to completely negate damage of incoming attacks.`
    },

    heal: {
        label: "priestess",
        icon: priestess_icon,
        largeIcon: priestess_icon_ex,
        lore: `We only stay for the pretty music. \n\n Focus on restoring a sense of reality. If not attacked, heal.`
    },

    prepare: {
        label: "hourglass",
        icon: hourglass_icon,
        largeIcon: hourglass_icon_ex,
        lore: `The sand is nauseous from your constant turmoil. \n\n Carefully calculate strategy. Increases effectiveness of subsequent rune.`
    },

    defend: {
        label: "praetorian",
        icon: prae_icon,
        largeIcon: prae_icon_ex,
        lore: `The bravest coward you'll ever meet. \n\n Cling to personal illusion. Reduce damage of incoming attacks.`
    },

    attack: {
        label: "candlelight",
        icon: candle_icon,
        largeIcon: candle_icon_ex,
        lore: `If moonlight heals, what does candlelight do? \n \n Directly challenge opponents' sense of reality. Deals damage.`
    },

    overwhelm: {
        label: "overwhelm",
        icon: chain_icon,
        largeIcon: chain_icon_ex,
        lore: `We are still ultimately animals. \n\n Anticipate opponent will cling to reality. Deals damage only on defensive moves.`
    },

    mirror: {
        label: "mirror",
        icon: mage_icon,
        largeIcon: mage_icon_ex,
        lore: `Distorted truths cut like knives. \n \n Perform the same action as opponent.`
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

Use this to have defaults (such as assets/icons/runes kept) for the moves, while shadowing other parts.
*/