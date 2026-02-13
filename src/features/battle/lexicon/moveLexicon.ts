import { AssetURL, SuggestedString } from "@/shared/types/misc.types"
import { COMMON_PLANNED_MOVES } from '@/core/battle/moves/plannedMoves'

const ICONS_IMPORT = import.meta.glob<string>('../assets/icons/runes/*.png', {
    eager: true,
    query: '?url',
    import: 'default'
}) as Record<string, AssetURL>;

export const BATTLE_RUNE_IMGS = Object.fromEntries(
    Object.entries(ICONS_IMPORT).map(([path, icon]) => {
        const key = path.split('/').pop()!.replace('.png', '').toLowerCase();
        return [key, icon];
    })
) as Record<string, AssetURL>;

export const STOCK_MOVE_ICONS = {
    small: BATTLE_RUNE_IMGS.stock,
    large: BATTLE_RUNE_IMGS.stock_ex
} as const;

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
    icon: BATTLE_RUNE_IMGS.stock,
    largeIcon: BATTLE_RUNE_IMGS.stock_ex,
}

export const COMMON_MOVE_LEXICON: MoveLexicon = {
    repeat: {
        label: "repeat",
        icon: BATTLE_RUNE_IMGS.apprentice,
        largeIcon: BATTLE_RUNE_IMGS.apprentice_ex,
        description: 'Repeat previous rune. Cannot be used first.'
    },

    evade: {
        label: "evade",
        icon: BATTLE_RUNE_IMGS.trickster,
        largeIcon: BATTLE_RUNE_IMGS.trickster_ex,
        description: 'Chance to negate all incoming damage. When successful, a followup attack will do extra damage.'
    },

    heal: {
        label: "heal",
        icon: BATTLE_RUNE_IMGS.priestess,
        largeIcon: BATTLE_RUNE_IMGS.priestess_ex,
        description: 'When not attacked, restore health.'
    },

    prepare: {
        label: "prepare",
        icon: BATTLE_RUNE_IMGS.hourglass,
        largeIcon: BATTLE_RUNE_IMGS.hourglass_ex,
        description: 'If not attacked, increase effectiveness of subsequent rune.'
    },

    defend: {
        label: "defend",
        icon: BATTLE_RUNE_IMGS.prae,
        largeIcon: BATTLE_RUNE_IMGS.prae_ex,
        description: 'Reduce incoming damage.'
    },

    attack: {
        label: "attack",
        icon: BATTLE_RUNE_IMGS.stock,
        largeIcon: BATTLE_RUNE_IMGS.stock_ex,
        description: 'Deal damage.'
    },

    overwhelm: {
        label: "overwhelm",
        icon: BATTLE_RUNE_IMGS.chains,
        largeIcon: BATTLE_RUNE_IMGS.chain_ex,
        description: 'Only does damage to Defensive/Evasive moves (negating their reduction). Makes user vulnerable on use.'
    },

    mirror: {
        label: "mirror",
        icon: BATTLE_RUNE_IMGS.mage,
        largeIcon: BATTLE_RUNE_IMGS.mage_ex,
        description: 'Perform same action as opponent.'
    },

    idle: {
        label: "idle",
        icon: BATTLE_RUNE_IMGS.stock,
        largeIcon: BATTLE_RUNE_IMGS.stock_ex,
        description: 'Do nothing.'
    },

    nothingMove: {
        label: "__NOTHING__",
        icon: BATTLE_RUNE_IMGS.stock,
        largeIcon: BATTLE_RUNE_IMGS.nothing_ex
    },

    observe: {
        label: 'observe',
        icon: BATTLE_RUNE_IMGS.lantern,
        largeIcon: BATTLE_RUNE_IMGS.lantern_ex,
        description: 'Makes opponent vulnerable.'
    }
}

export const PLAYER_MOVE_LEXICON: MoveLexicon = {

    ...COMMON_MOVE_LEXICON,

    repeat: {
        label: "apprentice",
        icon: BATTLE_RUNE_IMGS.apprentice,
        largeIcon: BATTLE_RUNE_IMGS.apprentice_ex,
        lore: `Like the flowers, knowledge comes from the rotting ones.`,
        description: 'Repeat previous rune. Cannot be used first.'
    },

    evade: {
        label: "trickster",
        icon: BATTLE_RUNE_IMGS.trickster,
        largeIcon: BATTLE_RUNE_IMGS.trickster_ex,
        lore: `Our first understanding of self comes from a two-faced fox.`,
        description: 'Chance to negate all incoming damage. When successful, a followup attack will do extra damage.'
    },

    heal: {
        label: "priestess",
        icon: BATTLE_RUNE_IMGS.priestess,
        largeIcon: BATTLE_RUNE_IMGS.priestess_ex,
        lore: `We only stay for the pretty music.`,
        description: 'When not attacked, restore health.'
    },

    prepare: {
        label: "hourglass",
        icon: BATTLE_RUNE_IMGS.hourglass,
        largeIcon: BATTLE_RUNE_IMGS.hourglass_ex,
        lore: `The sand is nauseous from your constant turmoil.`,
        description: 'If not attacked, increase effectiveness of subsequent rune.'
    },

    defend: {
        label: "praetorian",
        icon: BATTLE_RUNE_IMGS.prae,
        largeIcon: BATTLE_RUNE_IMGS.prae_ex,
        lore: `The bravest coward you'll ever meet.`,
        description: 'Reduce incoming damage.'
    },

    attack: {
        label: "candlelight",
        icon: BATTLE_RUNE_IMGS.candle,
        largeIcon: BATTLE_RUNE_IMGS.candle_ex,
        lore: `If moonlight heals, what does candlelight do?`,
        description: 'Deal damage.'
    },

    overwhelm: {
        label: "overwhelm",
        icon: BATTLE_RUNE_IMGS.chains,
        largeIcon: BATTLE_RUNE_IMGS.chain_ex,
        lore: `We are still ultimately animals.`,
        description: 'Only does damage to Defensive/Evasive moves (negating their reduction). Makes user vulnerable on use.'
    },

    mirror: {
        label: "mirror",
        icon: BATTLE_RUNE_IMGS.mage,
        largeIcon: BATTLE_RUNE_IMGS.mage_ex,
        lore: `Distorted truths cut like knives.`,
        description: 'Perform same action as opponent.'
    },
}
