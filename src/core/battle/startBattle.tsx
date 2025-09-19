import { BattleProps } from "@/features/battle/Battle";
import { BattleOutcome, DVOpponentData } from "./engine/battle.types";
import { pushUILayer } from "@/app/shell/layers/UILayerManager";
import Battle from "@/features/battle/Battle";

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


    // this is a ref hack so the component (<Battle>) can bind a promise when it loads,
    // then code on this level can properly await it.
    const resultRef: BattleProps['battleResultPromiseRef'] = {current: undefined}

    const {popLayer: popBattleLayer} = pushUILayer({
        lock: 'all',
        blockBehind: true,
        style: {
            background: "black",
            opacity: 0,
            animation: "fadeIn 0.5s forwards"
        },
        component: () => <Battle opponentData={opponentData} battleResultPromiseRef={resultRef} />
    })

    const result = await resultRef.current!;
    popBattleLayer();

    // In the future we will likely attach some (optional?) default behavior for battle results (namely loss/eject) so callers only have to check for win and handle accordingly.

    return result;
}