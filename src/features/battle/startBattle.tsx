import { BattleOutcome } from "@/core/battle/model/battle";
import { OpponentProfile, PlayerProfile } from "./bridge/battleProfiles";
import { pushUILayer } from "@/app/shell/layers/UILayerManager";
import Battle from "./Battle";
import TransitionVideo from "@/shared/ui/primitives/TransitionVideo";
import battle_transition_video from '@/assets/ui/misc/battle transition.webm'
import sleep from "@/shared/utils/sleep";
import { MAIN_CHARACTER_NAME } from "@/config/init.config";

// May be replaced with something reactive or updating as the game goes on later.
const DEFAULT_PLAYER: PlayerProfile = {
    display: {
        name: MAIN_CHARACTER_NAME,
        lexicon: {}
    },
    logic: {
        stats: { maxHealth: 10 }
    }
}

/**
 * Initializes a new battle and adds it as a UI layer.
 * @param opponentProfile - OpponentProfile representing the opponent for this battle.
 * @param onStart - Runs once the battle starts
 * @returns a promise of the battle result (to properly await and respond to battle completion)
 */
export async function startBattle(opponentProfile: OpponentProfile, onStart?: () => void) {

    const { promise: transitionPromise, resolve: endTransition } = Promise.withResolvers<void>();
    const { popLayer: popAnimLayer } = pushUILayer({
        component: () =>
            <TransitionVideo
                src={battle_transition_video}
                onFinished={endTransition}
                style={{ 'filter': 'contrast(10)' }} // Darken to hide compression artifacts.
            />,
        blockBehind: true,
        lock: 'all',
        style: {
            'mix-blend-mode': 'darken',
            'translate': '0px -1px' // idk
        }
    })

    await transitionPromise;
    sleep(1000).then(popAnimLayer);

    const { promise: battleEndPromise, resolve: resolveBattle } = Promise.withResolvers<BattleOutcome>();

    const { popLayer } = pushUILayer({
        lock: 'all',
        blockBehind: true,
        style: {
            background: "black",
            opacity: 0,
            animation: 'fadeIn 0.5s forwards' // Replace with cool overlay thing and custom anim later
        },
        component: () => <Battle opponentProfile={opponentProfile} playerProfile={DEFAULT_PLAYER} onEnd={resolveBattle} onStart={onStart} />
    });

    const result = await battleEndPromise;
    popLayer();

    return result;
}