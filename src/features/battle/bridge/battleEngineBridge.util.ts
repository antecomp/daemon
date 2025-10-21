import { Combatant } from "@/core/battle/model/combatant";
import { AssetURL } from "@/shared/types/misc.types";
import { STATUS_LEXICON } from "../lexicon/statusLexicon";
import { PlannedMove } from "@/core/battle/model/plannedmove";
import { KnownStatusName } from "../lexicon/lexicon.types";

const HINT_AMOUNT = 3;

export const generateHint = (seq: PlannedMove[]): (string | null)[] => {
    const indices = new Set<number>;

    while (indices.size < HINT_AMOUNT) {
        indices.add(Math.floor(Math.random() * seq.length));
    }

    return seq.map((plannedMove, index) => indices.has(index) ? null : plannedMove.name);
};

export function getStatusIconsOfCombatant(combatant: Combatant): AssetURL[] {
    return combatant.activeStatuses.map(([status]) => STATUS_LEXICON[status.name as KnownStatusName].icon!)
}