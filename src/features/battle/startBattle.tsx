import { BattleOutcome } from "@/core/battle/model/battle";
import { OpponentProfile, PlayerProfile } from "./bridge/battleProfiles";
import { pushUILayer } from "@/app/shell/layers/UILayerManager";
import Battle from "./Battle";


const plyr: PlayerProfile = {
    display: {
        lexicon: {}
    }
}

export async function startBattle(opponentProfile: OpponentProfile) {
    const {promise: battleEndPromise, resolve: resolveBattle} = Promise.withResolvers<BattleOutcome>();

    const {popLayer} = pushUILayer({
        lock: 'all',
        blockBehind: true,
        style: {
            background: "black",
            opacity: 0,
            animation: 'fadeIn 0.5s forwards' // Replace with cool overlay thing and custom anim later
        },
        component: () => <Battle opponentProfile={opponentProfile} playerProfile={plyr} onEnd={resolveBattle}/>
    });

    const result = await battleEndPromise;
    popLayer();

    return result;
}