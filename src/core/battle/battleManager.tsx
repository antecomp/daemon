import { BattleProps } from "@/components/layers/battle/Battle";
import { BattleOutcome, DVOpponentData } from "./engine/battle.types";
import { popUILayer, pushUILayer } from "@/components/layers/UILayerStore";
import { MainUILock } from "@/components/layers/ui-layers.types";
import Battle from "@/components/layers/battle/Battle";

let activeBattleID: string | null = null;

// Any other needed config can go here too.
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
        component: <Battle opponentData={opponentData} battleResultPromiseRef={resultRef} />
    })

    const result = await resultRef.current!;

    popUILayer(id);
    activeBattleID = null;

    return result;
}