import { getBattleUIRef } from "@/components/views/battle/ui/refRegistry";
import animateAsync from "@/util/animateAsync";

export function highlightMovesAtIndex(moveIndex: number) {
    const playerSeqUIElement = getBattleUIRef('sequenceViewPlayer');
    const opponentSeqUIElement = getBattleUIRef('sequenceViewOpponent');

    // Returns animation objects for pausing and stopping.
    return {
        playerSeqAnim: playerSeqUIElement?.children[moveIndex].animate([{ opacity: 1 }, {opacity: 0}, { opacity: 1 }], { duration: 500, iterations: Infinity }),
        oppSeqAnim: opponentSeqUIElement?.children[moveIndex + 1].animate([{ opacity: 1 }, {opacity: 0}, { opacity: 1 }], { duration: 500, iterations: Infinity })
    };
}

export function stopHighlightingMovesAtIndex(animations: { playerSeqAnim: Animation | undefined, oppSeqAnim: Animation | undefined }) {
    animations.playerSeqAnim?.cancel();
    animations.oppSeqAnim?.cancel();
}

export function damageFlashOpponent() {
    const opponentSprite = getBattleUIRef('opponentSprite');
    if (!opponentSprite) return;

    opponentSprite.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }], { duration: 100, iterations: 3 })
        // .onfinish = () => {
        //     opponentSprite.style.opacity = '1';
        // }
}

export async function opponentDeathFade() {
    const opponentSprite = getBattleUIRef('opponentSprite');
    if (!opponentSprite) return;

    await animateAsync(opponentSprite, [
        {
            filter: `brightness(1)`,
            opacity: `1`
        },
        {
            filter: `brightness(0)`,
            opacity: `1`
        },
        {
            filter: `brightness(0)`,
            opacity: `0`
        }
    ],
    {
     duration: 450   
    }
    )
}