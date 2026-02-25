import { Combatant } from "@/core/battle/model/combatant";
import { AssetURL } from "@/shared/types/misc.types";
import { STATUS_LEXICON } from "../lexicon/statusLexicon";
import { PlannedMove } from "@/core/battle/model/plannedMove";
import { FALLBACK_MOVE_DISPLAY_ENTRY, MoveLexicon, MoveLexiconOverrides } from "../lexicon/moveLexicon";

const HINT_AMOUNT = 3;

export const generateHint = (seq: PlannedMove[]): (string | null)[] => {
    const indices = new Set<number>;

    while (indices.size < HINT_AMOUNT) {
        indices.add(Math.floor(Math.random() * seq.length));
    }

    return seq.map((plannedMove, index) => indices.has(index) ? null : plannedMove.name);
};

export function getStatusIconsOfCombatant(combatant: Combatant): (AssetURL | undefined)[] {
    return combatant.activeStatuses.map(([status]) => STATUS_LEXICON?.[status.name]?.icon);
}

export function extendLexicon(base: MoveLexicon, extending: MoveLexiconOverrides) {
    const out: Partial<MoveLexicon> = {};

    // Merge
    for(const moveKey in base) {
        if (!Object.prototype.hasOwnProperty.call(base, moveKey)) continue;
        const inner = base[moveKey];
        const overlay = extending[moveKey];
        out[moveKey] = overlay ? {...inner, ...overlay} : inner;
    }

    // Add new. New entries are a merge on top of the fallback.
    for (const moveKey in extending) {
        if (!Object.prototype.hasOwnProperty.call(extending, moveKey)) continue;
        if (!Object.prototype.hasOwnProperty.call(base, moveKey)) out[moveKey] = {...FALLBACK_MOVE_DISPLAY_ENTRY, ...extending[moveKey]};
    }

    return out as MoveLexicon;
}