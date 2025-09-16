import { getBattleUIRef } from "@/features/battle/ui/refRegistry";
import animateAsync from "@/utils/animateAsync";

// Naming Convention: animateTargetEffect

export function animateMoveHighlight(moveIndex: number) {
    const playerSeqUIElement = getBattleUIRef('sequenceViewPlayer');
    const opponentSeqUIElement = getBattleUIRef('sequenceViewOpponent');

    // Returns animation objects for pausing and stopping.
    return {
        playerSeqAnim: playerSeqUIElement?.children[moveIndex].animate([{ opacity: 1 }, {opacity: 0.33}, { opacity: 1 }], { duration: 500, iterations: Infinity }),
        oppSeqAnim: opponentSeqUIElement?.children[moveIndex].animate([{ opacity: 1 }, {opacity: 0.33}, { opacity: 1 }], { duration: 500, iterations: Infinity })
    };
}

export function stopMoveHighlight(animations: { playerSeqAnim: Animation | undefined, oppSeqAnim: Animation | undefined }) {
    animations.playerSeqAnim?.cancel();
    animations.oppSeqAnim?.cancel();
}

export async function animateOpponentDamageFlash() {
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

export async function animateOpponentDeathFade() {
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

export async function animateOpponentSequenceRoll() {
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

export async function animatePlayerSequenceRoll() {
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
export async function animateOpponentSequenceSwish() {
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

export async function animatePlayerSequenceSwish() {
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

export async function animateOpponentSequenceFadeOut() {
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

export async function animateOpponentSequenceFadeIn() {
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

export async function animatePlayerSequenceFadeOut() {
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

export async function animateMainUIFadeOut() {
    const mainBattleUI = getBattleUIRef("mainUI");
    if (!mainBattleUI) return;

    await animateAsync(mainBattleUI, [
        {
            opacity: 1
        },
        {
            opacity: 0
        }
    ], {
        duration: 2000,
        fill: "forwards"
    })
}