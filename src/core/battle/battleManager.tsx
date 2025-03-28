import { BattleProps } from "@/components/layers/battle/Battle";
import { BattleOutcome, DVOpponentData } from "./engine/battle.types";
import { popUILayer, pushUILayer } from "@/core/ui/UILayerStore";
import { MainUILock } from "@/core/ui/ui-layers.types";
import Battle from "@/components/layers/battle/Battle";

let activeBattleID: string | null = null;

/**
 * Starts a battle with the given opponent data. If a battle is already active, it will log an error and reject the promise.
 * @param opponentData - The data of the opponent to battle against.
 * @returns A promise that resolves with the battle outcome.
 * @throws An error if a battle is already active.
 * @example
 * startBattle(opponentData).then(outcome => {
 *     // Handle the battle outcome
 * })
 * @see BattleProps for the properties of the battle component.
 * @see DVOpponentData for the structure of the opponent data.
 * @see BattleOutcome for the possible outcomes of the battle.
 */
export async function startBattle(opponentData: DVOpponentData): Promise<BattleOutcome> {
    if(activeBattleID) {
        console.error("[startBattle] Battle already active!");
        return Promise.reject();
    }

    const id = `battle-${Date.now()}`;
    activeBattleID = id;

    const resultRef: BattleProps['battleResultPromiseRef'] = {current: undefined}

    pushUILayer({
        id,
        lock: MainUILock.All,
        blockBehind: true,
        component: () => <Battle opponentData={opponentData} battleResultPromiseRef={resultRef} />
    })

    const result = await resultRef.current!;

    popUILayer(id);
    activeBattleID = null;

    return result;
}