export async function playSound(src: string, volume?: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const audio = new Audio(src);
        if(volume) audio.volume = volume;
        audio.addEventListener("ended", () => resolve(), {once: true});
        audio.addEventListener("error", () => reject(), {once: true});
        audio.play().catch(reject);
    })
}