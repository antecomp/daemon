import { BattleOutcome } from "@/core/battle/model/battle";
import { DialogueRuntime } from "@/core/dialogue/dialogue.types";
import { OpponentProfile } from "./bridge/battleProfiles";
import { startBattle } from "./startBattle";

type BattleYieldOptions = {
    // Resolve start behavior from the dialogue's :YIELD value.
    onStart?: (value: string | undefined) => (() => void) | undefined;
    advance?: boolean;
};

/** Runs a scene-selected battle and stores its outcome for dialogue branches. */
export function createBattleYieldHandler(opponent: OpponentProfile, options: BattleYieldOptions = {}) {
    return async (value: string | undefined, runtime: DialogueRuntime) => {
        const outcome = await startBattle(opponent, options.onStart?.(value));
        runtime.memory.set('outcome', BattleOutcome[outcome]);
        if (options.advance) return { advance: true as const };
    };
}
