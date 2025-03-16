import { getBattleUIRef } from "@/components/views/battle/ui/refRegistry";
import animateAsync from "@/util/animateAsync";

// TODO: Maybe rename these to have some sort of convention
// to indicate these are animation functions.


export function highlightMovesAtIndex(moveIndex: number) {
    const playerSeqUIElement = getBattleUIRef('sequenceViewPlayer');
    const opponentSeqUIElement = getBattleUIRef('sequenceViewOpponent');

    // Returns animation objects for pausing and stopping.
    return {
        playerSeqAnim: playerSeqUIElement?.children[moveIndex].animate([{ opacity: 1 }, {opacity: 0.33}, { opacity: 1 }], { duration: 500, iterations: Infinity }),
        oppSeqAnim: opponentSeqUIElement?.children[moveIndex].animate([{ opacity: 1 }, {opacity: 0.33}, { opacity: 1 }], { duration: 500, iterations: Infinity })
    };
}

export function stopHighlightingMovesAtIndex(animations: { playerSeqAnim: Animation | undefined, oppSeqAnim: Animation | undefined }) {
    animations.playerSeqAnim?.cancel();
    animations.oppSeqAnim?.cancel();
}

export async function damageFlashOpponent() {
    const opponentSprite = getBattleUIRef('opponentSprite');
    if (!opponentSprite) return;

    // opponentSprite.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }], { duration: 100, iterations: 3 })
    await animateAsync(opponentSprite, [
        {opacity: 0},
        {opacity: 1}
    ],
        {
            duration: 100,
            iterations: 3
        }
    )
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
     duration: 450, 
     fill: "forwards"
    }
    )
}

const ROLL_DURATION = 125;
const ROLL_PAUSE = 25;

export async function opponentSequenceRoll() {
    const sequenceViewOpponent = getBattleUIRef("sequenceViewOpponent");
    if (!sequenceViewOpponent) return;

    for (const [_index, el] of Array.from(sequenceViewOpponent.querySelectorAll("span.opp-hint")).entries()) {
        await animateAsync(el as HTMLElement, [
            { transform: "translateY(0px) translateX(0px)" },
            { transform: `translateY(${3}px) translateX(${-3}px)` },
            { transform: "translateY(0px) translateX(0px)" },
        ], {
            duration: ROLL_DURATION,
            endDelay: ROLL_PAUSE
        });
    }
}

export async function playerSequenceRoll() {
    const sequenceViewPlayer = getBattleUIRef("sequenceViewPlayer");
    if (!sequenceViewPlayer) return;

    for (const [_index, el] of Array.from(sequenceViewPlayer.querySelectorAll("span.player-move")).entries()) {
        await animateAsync(el as HTMLElement, [
            { transform: "translateY(0px) translateX(0px)" },
            { transform: `translateY(${-3}px) translateX(${-3}px)` },
            { transform: "translateY(0px) translateX(0px)" },
        ], {
            duration: ROLL_DURATION,
            endDelay: ROLL_PAUSE
        });
    }
}


const FADE_DURATION = 200;
export async function opponentSequenceSwish() {
    const sequenceViewOpponent = getBattleUIRef("sequenceViewOpponent");
    if (!sequenceViewOpponent) return;

    for (const [_index, el] of Array.from(sequenceViewOpponent.querySelectorAll("span.opp-hint")).entries()) {
        await animateAsync(el as HTMLElement, [
            { opacity: 1 }, {opacity: 0.33}, { opacity: 1 }
        ], {
            duration: FADE_DURATION,
            //endDelay: ROLL_PAUSE
        });
    }
}

export async function playerSequenceSwish() {
    const sequenceViewPlayer = getBattleUIRef("sequenceViewPlayer");
    if (!sequenceViewPlayer) return;

    for (const [_index, el] of Array.from(sequenceViewPlayer.querySelectorAll("span.player-move")).entries()) {
        await animateAsync(el as HTMLElement, [
            { opacity: 1 }, {opacity: 0.33}, { opacity: 1 }
        ], {
            duration: FADE_DURATION,
            //endDelay: ROLL_PAUSE
        });
    }
}

export async function fadeOutOppSeq() {
    const sequenceViewOpponent = getBattleUIRef("sequenceViewOpponent");
    if (!sequenceViewOpponent) return;

    await animateAsync(sequenceViewOpponent, [
        {
            opacity: '1'
        },
        {
            opacity: '0'
        },
    ],
        {
            duration: 300,
            endDelay: 150,
            fill: "forwards"
        }
    )
}

export async function fadeInOppSeq() {
    const sequenceViewOpponent = getBattleUIRef("sequenceViewOpponent");
    if (!sequenceViewOpponent) return;

    await animateAsync(sequenceViewOpponent, [
        {
            opacity: '0'
        },
        {
            opacity: '1'
        },
    ],
        {
            duration: 500,
            endDelay: 250,
            fill: "forwards"
        }
    )
}

export async function fadeOutPlayerSeq() {
    const sequenceViewPlayer = getBattleUIRef("sequenceViewPlayer");
    if(!sequenceViewPlayer) return;

    await animateAsync(sequenceViewPlayer, [
        {
            opacity: 1
        },
        {
            opacity: 0
        }
    ],
    {
        duration: 300,
        // Not forwards, will snap to being visible again for preview.
    }
    )
}