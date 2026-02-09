import { Registry } from "@/shared/utils/refRegistry";
import { BattleRefNames } from "./uiAnimations/battleUIRefRegistry";
import { Setter } from "solid-js";
import { BattleUIState } from "../bridge/battleEngineBridge";
import animateAsync from "@/shared/utils/animateAsync";
import sleep from "@/shared/utils/sleep";

// Yes, I know this is a bit hacky and hands on, but its better than a bunch of CSS rules and it's properly promise-based.

const FADE_IN_KEYFRAMES = [{opacity: 0}, {opacity: 1}];

// TODO
export default async function battleOpeningAnimation(rr: Registry<BattleRefNames>, setBattleUIState: Setter<BattleUIState>) {
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
    // TODO: Might want to add a classname instead to make this more robust.
    const rbActionButtons = rr.actionBarLeft.querySelectorAll('img');

    const fchBar = rr.actionBarRight.querySelector('.fch-bar') as HTMLElement | null;
    const multbars = rr.actionBarRight.querySelector('.multbars') as HTMLElement | null;
    const oppIcon = rr.opponentStatusbar.querySelector('.opp-icon') as HTMLElement | null;
    const oppNametag = rr.opponentStatusbar.querySelector('.nametag') as HTMLElement | null;
    const oppStatbar = rr.opponentStatusbar.querySelector('.statbar') as HTMLElement | null;
    if (!(fchBar && multbars && oppIcon && oppNametag && oppStatbar)) return;

    // Setting this here causes no flash-in glitch from what I can tell.
    rr.battleView.style.opacity = '0';
    rr.actionBar.style.opacity = '0'
    rr.initMessage.style.opacity = '0';

    multbars.style.opacity = '0';

    rbRunes.forEach(rune => rune.style.opacity = '0');
    rbActionButtons.forEach(btn => btn.style.opacity = '0');

    // This part will likely be handed off to a different handler later, i.e player click instead.
    //await sleep(2000);
    await animateAsync(rr.initMessage, [
        { opacity: 0 }, { opacity: 1 }
    ],
        {
            fill: 'forwards',
            duration: 250,
            delay: 500,
            endDelay: 2000
        }
    )

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
        animateAsync(rr.battleView, [
            { opacity: 0 },
            { opacity: 1 }
        ],
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
        await animateAsync(rune, [
            { opacity: 0 }, { opacity: 1 }
        ],
            {
                fill: 'forwards',
                duration: 200
            }
        )
    }

    for (const actionButton of rbActionButtons) {
        await animateAsync(actionButton, [
            { opacity: 0 }, { opacity: 1 }
        ],
            {
                fill: 'forwards',
                duration: 200
            }
        )
    }

    // await animateAsync(oppIcon, FADE_IN_KEYFRAMES, {fill: 'forwards', duration: 300});
    // await animateAsync(oppNametag, FADE_IN_KEYFRAMES, {fill: 'forwards', duration: 300});
    // await animateAsync(oppStatbar, FADE_IN_KEYFRAMES, {fill: 'forwards', duration: 300});

    await Promise.all([
        animateAsync(fchBar, [{ opacity: 0 }, { opacity: 1 }], { fill: 'forwards', duration: 300 }),
        animateAsync(multbars, [{ opacity: 0 }, { opacity: 1 }], { fill: 'forwards', duration: 300, delay: 100 }),
        animateAsync(oppIcon, FADE_IN_KEYFRAMES, {fill: 'forwards', duration: 300})
            .then(_ => animateAsync(oppNametag, FADE_IN_KEYFRAMES, {fill: 'forwards', duration: 300}))
            .then(_ => animateAsync(oppStatbar, FADE_IN_KEYFRAMES, {fill: 'forwards', duration: 300}))
    ])

    fchBar.style.removeProperty('background-position');
    oppStatbar.style.removeProperty('background-position');
}