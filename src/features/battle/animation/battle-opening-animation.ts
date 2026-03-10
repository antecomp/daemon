import { RefRegistry } from "@/shared/utils/refRegistry";
import { BattleRefNames } from "./uiAnimations/battleUIRefRegistry";
import { Setter } from "solid-js";
import { BattleUIState } from "../bridge/battleUIState";
import animateAsync from "@/shared/utils/animateAsync";
import sleep from "@/shared/utils/sleep";

// Yes, I know this is a bit hacky and hands on, but its better than a bunch of CSS rules and it's properly promise-based.

const FADE_IN_KEYFRAMES = [{ opacity: 0 }, { opacity: 1 }];

/** Reads the battle ref registry and performs various animate calls for a "bootup" animation sequence. */
export default async function battleOpeningAnimation(rr: RefRegistry<BattleRefNames>, setBattleUIState: Setter<BattleUIState>) {
    // Guard clause for everything. Let's just fail the animation if we're missing anything.
    if (!(
        rr.battleView
        && rr.actionBar
        && rr.initMessage
        && rr.runeBuilder
        && rr.actionBarLeft
        && rr.actionBarRight
        && rr.opponentStatusbar
        // ... add more as you need them.
    )) return;

    const rbRunes = rr.runeBuilder.querySelectorAll('.rb-rune') as NodeListOf<SVGElement>;

    // FLAG: Careful with this if you change the layout!
    const rbActionButtons = rr.actionBarLeft.querySelectorAll('img');

    const fchBar = rr.actionBarRight.querySelector('.fch-bar') as HTMLElement | null;
    const multbars = rr.actionBarRight.querySelector('.multbars') as HTMLElement | null;
    const oppIcon = rr.opponentStatusbar.querySelector('.opp-icon') as HTMLElement | null;
    const oppNametag = rr.opponentStatusbar.querySelector('.nametag') as HTMLElement | null;
    const oppStatbar = rr.opponentStatusbar.querySelector('.statbar') as HTMLElement | null;
    if (!(fchBar && multbars && oppIcon && oppNametag && oppStatbar)) return;

    const initMessageBottom = rr.initMessage.querySelector('.battle-init-bottom') as HTMLElement | null;
    const initMessageText = rr.initMessage.querySelector('span');
    if (!(initMessageBottom && initMessageText)) return;

    // Setting this here causes no flash-in glitch from what I can tell.
    rr.battleView.style.opacity = '0';
    rr.actionBar.style.opacity = '0';
    rr.initMessage.style.opacity = '0';
    initMessageBottom.style.opacity = '0';
    multbars.style.opacity = '0';
    initMessageText.style.maxWidth = '0px';

    rbRunes.forEach(rune => rune.style.opacity = '0');
    rbActionButtons.forEach(btn => btn.style.opacity = '0');

    /////////////////////////////////////////////////////////////////////

    await sleep(500);

    await Promise.all([
        animateAsync(rr.initMessage, FADE_IN_KEYFRAMES,
            {
                fill: 'forwards',
                duration: 500,
            }
        ),
        animateAsync(initMessageText, [{ 'maxWidth': '0px' }, { 'maxWidth': '500px' }], {
            fill: 'forwards',
            duration: 750
        })
    ])

    await animateAsync(initMessageBottom, FADE_IN_KEYFRAMES, {
        fill: 'forwards', duration: 250
    })

    await sleep(1500);

    await animateAsync(rr.initMessage, [{ opacity: 1 }, { opacity: 0 }], {
        fill: 'forwards',
        duration: 500,
    })


    // This UI state closes the init prompt and indicates the opening animation has started.
    setBattleUIState(BattleUIState.OPENING);

    // Some weird state change is causing this to get deleted when we change battleUI state. Just doing a lazy fix for now.
    fchBar.style.opacity = '0';
    // Initialize the fch-bars offset position to 100%. Removing this property later will revert to --level based state, animating naturally.
    fchBar.style.backgroundPosition = '100%';

    oppIcon.style.opacity = '0';
    oppNametag.style.opacity = '0';
    oppStatbar.style.opacity = '0';
    oppStatbar.style.backgroundPosition = '100%';

    // Fade in base UI.
    await Promise.all([
        animateAsync(rr.battleView, FADE_IN_KEYFRAMES,
            {
                fill: 'forwards',
                duration: 1000
            }
        ),
        animateAsync(rr.actionBar, [
            { opacity: 0 }, { opacity: 1 }
        ],
            {
                fill: 'forwards',
                duration: 1000
            }
        )
    ]);

    for (const rune of rbRunes) {
        await animateAsync(rune, FADE_IN_KEYFRAMES,
            {
                fill: 'forwards',
                duration: 150
            }
        )
    }

    for (const actionButton of rbActionButtons) {
        await animateAsync(actionButton, FADE_IN_KEYFRAMES,
            {
                fill: 'forwards',
                duration: 200
            }
        )
    }

    await Promise.all([
        animateAsync(fchBar, FADE_IN_KEYFRAMES, { fill: 'forwards', duration: 300 }),
        animateAsync(multbars, FADE_IN_KEYFRAMES, { fill: 'forwards', duration: 300, delay: 100 }),
        animateAsync(oppIcon, FADE_IN_KEYFRAMES, { fill: 'forwards', duration: 300 })
            .then(_ => animateAsync(oppNametag, FADE_IN_KEYFRAMES, { fill: 'forwards', duration: 300 }))
            .then(_ => animateAsync(oppStatbar, FADE_IN_KEYFRAMES, { fill: 'forwards', duration: 300 }))
    ])

    fchBar.style.removeProperty('background-position');
    oppStatbar.style.removeProperty('background-position');
}