export async function playSound(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const audio = new Audio(src);
        audio.addEventListener("ended", () => resolve(), {once: true});
        audio.addEventListener("error", () => reject(), {once: true});
        audio.play().catch(reject);
    })
}