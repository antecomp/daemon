import vuln_icon from "@/features/battle/assets/icons/statuses/vuln.png"
import prep_icon from "@/features/battle/assets/icons/statuses/prep.png"
import mania_icon from "@/features/battle/assets/icons/statuses/mania.png"
import { StatusLexicon } from "./lexicon.types"

export const STATUS_LEXICON: StatusLexicon = {
    prepared: {
        icon: prep_icon
    },

    vulnerable: {
        icon: vuln_icon
    },

    mania: {
        icon: mania_icon
    }
}