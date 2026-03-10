import animateAsync from "@/shared/utils/animateAsync";

async function damageFlash(spriteRef: HTMLElement | SVGElement | undefined) {
    if (!spriteRef) return;

    await animateAsync(spriteRef, [
        {opacity: 0},
        {opacity: 1}
    ],
        {
            duration: 100,
            iterations: 3
        }
    )    
}

async function fadeToBlackAndTransparent(spriteRef: HTMLElement | SVGElement | undefined) {
    if (!spriteRef) return;

    await animateAsync(spriteRef, 
        [{ filter: `brightness(1)`, opacity: `1` },
        { filter: `brightness(0)`, opacity: `1` },
        { filter: `brightness(0)`, opacity: `0` }],
        { duration: 450, fill: "forwards" }
    )
}

async function fadeElementOut(ref: HTMLElement | SVGElement | undefined) {
    if (!ref) return;

    await animateAsync(ref,
        [ { opacity: '1' }, { opacity: '0' }, ],
        { duration: 300, endDelay: 150, fill: "forwards" }
    )
}

async function fadeElementIn(ref: HTMLElement | SVGElement | undefined) {
    if (!ref) return;

    await animateAsync(ref, 
        [ { opacity: '0' }, { opacity: '1' }, ],
        { duration: 500, endDelay: 250, fill: "forwards" }
    )
}

/** Collection of asynchronous animations that are used to animate the battle UI. */
export default {
    /** Takes in a ref to some Element and plays a damage flash/flicker animation for it */
    damageFlash, 
    fadeToBlackAndTransparent, 
    fadeElementIn, 
    fadeElementOut
} as const