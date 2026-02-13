// TODO: CHANGE THIS TO A META GLOB INSTEAD OF 24 IMPORT LINES??!?!??!?!?!?!?!?!??!?!
import apprentice_icon_ex from '../assets/icons/runes/apprentice_ex.png'
import candle_icon_ex from '../assets/icons/runes/candle_ex.png'
import chain_icon_ex from '../assets/icons/runes/chain_ex.png'
import hourglass_icon_ex from '../assets/icons/runes/hourglass_ex.png'
import mage_icon_ex from '../assets/icons/runes/mage_ex.png'
import prae_icon_ex from '../assets/icons/runes/prae_ex.png'
import priestess_icon_ex from '../assets/icons/runes/priestess_ex.png'
import trickster_icon_ex from '../assets/icons/runes/trickster_ex.png'
import nothing_ex from '@/features/battle/assets/icons/runes/nothing_ex.png';

import candle_icon from '../assets/icons/runes/candle.png'
import apprentice_icon from '../assets/icons/runes/apprentice.png'
import chain_icon from '../assets/icons/runes/chains.png'
import hourglass_icon from '../assets/icons/runes/hourglass.png'
import mage_icon from '../assets/icons/runes/mage.png'
import prae_icon from '../assets/icons/runes/PRAETORIAN.png'
import priestess_icon from '../assets/icons/runes/priestess.png'
import trickster_icon from '../assets/icons/runes/trickster.png'
import lantern_icon from '@/features/battle/assets/icons/runes/lantern.png';
import lantern_icon_ex from '@/features/battle/assets/icons/runes/lantern_ex.png';

import stock_icon from "../assets/icons/runes/stock.png"
import stock_icon_ex from '../assets/icons/runes/stock_ex.png'

export const STOCK_MOVE_ICONS = {
    small: stock_icon,
    large: stock_icon_ex
} as const;

import { AssetURL, SuggestedString } from "@/shared/types/misc.types"
import { COMMON_PLANNED_MOVES } from '@/core/battle/moves/plannedMoves'

export type MoveDisplayEntry = { label: string; icon: AssetURL; largeIcon: AssetURL; lore?: string; description?: string };
export type MoveDisplayOverride = Partial<MoveDisplayEntry>;

/** Known Move/Plan names that are defined in the BASE_MOVE_LEXICON */
export type MoveLexeme = SuggestedString<keyof (typeof COMMON_PLANNED_MOVES)>;

// Don't make this one partial, I want to to guarantee at least the common moves are covered.
/** Mapping of a move by id to a MoveDisplayEntry (UI info such as the labels and icons) */
export type MoveLexicon = {
    [moveName in MoveLexeme]: MoveDisplayEntry
}

/**
 * Partial MoveLexicon which will be merged in to override Move Lexicon info
 */
export type MoveLexiconOverrides = Partial<{
    [moveName in MoveLexeme]: MoveDisplayOverride;
}>

export const FALLBACK_MOVE_DISPLAY_ENTRY: MoveDisplayEntry = {
    label: 'MISSINGENTRY',
    icon: stock_icon,
    largeIcon: stock_icon_ex,
}

export const COMMON_MOVE_LEXICON: MoveLexicon = {
    repeat: {
        label: "repeat",
        icon: apprentice_icon,
        largeIcon: apprentice_icon_ex,
        description: 'Repeat previous rune. Cannot be used first.'
    },

    evade: {
        label: "evade",
        icon: trickster_icon,
        largeIcon: trickster_icon_ex,
        description: 'Chance to negate all incoming damage. When successful, a followup attack will do extra damage.'
    },

    heal: {
        label: "heal",
        icon: priestess_icon,
        largeIcon: priestess_icon_ex,
        description: 'When not attacked, restore health.'
    },

    prepare: {
        label: "prepare",
        icon: hourglass_icon,
        largeIcon: hourglass_icon_ex,
        description: 'If not attacked, increase effectiveness of subsequent rune.'
    },

    defend: {
        label: "defend",
        icon: prae_icon,
        largeIcon: prae_icon_ex,
        description: 'Reduce incoming damage.'
    },

    attack: {
        label: "attack",
        icon: stock_icon,
        largeIcon: stock_icon_ex,
        description: 'Deal damage.'
    },

    overwhelm: {
        label: "overwhelm",
        icon: chain_icon,
        largeIcon: chain_icon_ex,
        description: 'Only does damage to Defensive/Evasive moves (negating their reduction). Makes user vulnerable on use.'
    },

    mirror: {
        label: "mirror",
        icon: mage_icon,
        largeIcon: mage_icon_ex,
        description: 'Perform same action as opponent.'
    },

    idle: {
        label: "idle",
        icon: stock_icon,
        largeIcon: stock_icon_ex,
        description: 'Do nothing.'
    },

    nothingMove: {
        label: "YOU SHOULD NOT SEE THIS LOL!!!!",
        icon: stock_icon,
        largeIcon: nothing_ex
    },

    observe: {
        label: 'observe',
        icon: lantern_icon,
        largeIcon: lantern_icon_ex,
        description: 'Makes opponent vulnerable.'
    }
}

export const PLAYER_MOVE_LEXICON: MoveLexicon = {

    ...COMMON_MOVE_LEXICON,

    repeat: {
        label: "apprentice",
        icon: apprentice_icon,
        largeIcon: apprentice_icon_ex,
        lore: `Like the flowers, knowledge comes from the rotting ones.`,
        description: 'Repeat previous rune. Cannot be used first.'
    },

    evade: {
        label: "trickster",
        icon: trickster_icon,
        largeIcon: trickster_icon_ex,
        lore: `Our first understanding of self comes from a two-faced fox.`,
        description: 'Chance to negate all incoming damage. When successful, a followup attack will do extra damage.'
    },

    heal: {
        label: "priestess",
        icon: priestess_icon,
        largeIcon: priestess_icon_ex,
        lore: `We only stay for the pretty music.`,
        description: 'When not attacked, restore health.'
    },

    prepare: {
        label: "hourglass",
        icon: hourglass_icon,
        largeIcon: hourglass_icon_ex,
        lore: `The sand is nauseous from your constant turmoil.`,
        description: 'If not attacked, increase effectiveness of subsequent rune.'
    },

    defend: {
        label: "praetorian",
        icon: prae_icon,
        largeIcon: prae_icon_ex,
        lore: `The bravest coward you'll ever meet.`,
        description: 'Reduce incoming damage.'
    },

    attack: {
        label: "candlelight",
        icon: candle_icon,
        largeIcon: candle_icon_ex,
        lore: `If moonlight heals, what does candlelight do?`,
        description: 'Deal damage.'
    },

    overwhelm: {
        label: "overwhelm",
        icon: chain_icon,
        largeIcon: chain_icon_ex,
        lore: `We are still ultimately animals.`,
        description: 'Only does damage to Defensive/Evasive moves (negating their reduction). Makes user vulnerable on use.'
    },

    mirror: {
        label: "mirror",
        icon: mage_icon,
        largeIcon: mage_icon_ex,
        lore: `Distorted truths cut like knives.`,
        description: 'Perform same action as opponent.'
    },
}