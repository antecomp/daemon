import animateAsync from "@/shared/utils/animateAsync";

export async function animateOpponentDamageFlash(ref: HTMLElement | undefined) {
    if (!ref) return;

    await animateAsync(ref, [
        {opacity: 0},
        {opacity: 1}
    ],
        {
            duration: 100,
            iterations: 3
        }
    )    
}