import { nothingMove } from "@/core/battlenew/data/basemoves";
import { Combatant } from "@/core/battlenew/types/combatant";
import { PlannedMove } from "@/core/battlenew/types/move";
import { OpponentAI } from "@/core/battlenew/types/opponentProfile";
import { describe, it, expect } from "vitest";

const NothingMove: PlannedMove = {
    name: 'nothing',
    instantiate: () => nothingMove
}

function generateSampleOpponent(plan?: PlannedMove[]): OpponentAI {
    return {
        getSequence:  (_me, _player) => plan ?? [NothingMove, NothingMove, NothingMove, NothingMove, NothingMove]
    }
}

