import vuln_icon from "@/features/battle/assets/icons/statuses/vuln.png"
import prep_icon from "@/features/battle/assets/icons/statuses/prep.png"
import mania_icon from "@/features/battle/assets/icons/statuses/mania.png"

import { AssetURL } from "@/shared/types/misc.types"

export type StatusDisplayEntry = { icon?: AssetURL; }; // may add label/lore here also, for status tooltips/labels?

export const STATUS_LEXICON = {
    prepared: {
        icon: prep_icon
    },

    vulnerable: {
        icon: vuln_icon
    },

    mania: {
        icon: mania_icon
    }
} as Record<string, StatusDisplayEntry> // Do not narrow this type or suffer the consequences.