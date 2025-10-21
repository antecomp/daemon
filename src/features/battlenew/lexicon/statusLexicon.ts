import vuln_icon from "@/features/battlenew/assets/icons/statuses/vuln.png"
import prep_icon from "@/features/battlenew/assets/icons/statuses/prep.png"
import mania_icon from "@/features/battlenew/assets/icons/statuses/mania.png"
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

