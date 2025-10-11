import animateAsync from "@/shared/utils/animateAsync";

export async function animateOpponentDamageFlash(spriteRef: HTMLElement | undefined) {
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

export async function animateOpponentDeathFade(spriteRef: HTMLElement | undefined) {
    if (!spriteRef) return;

    await animateAsync(spriteRef, 
        [{ filter: `brightness(1)`, opacity: `1` },
        { filter: `brightness(0)`, opacity: `1` },
        { filter: `brightness(0)`, opacity: `0` }],
        { duration: 450, fill: "forwards" }
    )
}

// TODO: Extract these magic numbers!
export async function fadeElementOut(ref: HTMLElement | undefined) {
    if (!ref) return;

    await animateAsync(ref,
        [ { opacity: '1' }, { opacity: '0' }, ],
        { duration: 300, endDelay: 150, fill: "forwards" }
    )
}

export async function fadeElementIn(ref: HTMLElement | undefined) {
    if (!ref) return;

    await animateAsync(ref, 
        [ { opacity: '0' }, { opacity: '1' }, ],
        { duration: 500, endDelay: 250, fill: "forwards" }
    )
}