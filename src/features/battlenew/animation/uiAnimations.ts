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