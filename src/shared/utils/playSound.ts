import { AssetURL } from "../types/misc.types";

export async function playSound(src: AssetURL, volume?: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const audio = new Audio(src);
        if(volume) audio.volume = volume;
        audio.addEventListener("ended", () => resolve(), {once: true});
        audio.addEventListener("error", () => reject(), {once: true});
        audio.play().catch(reject);
    })
}

export async function playSoundOnReady(src: AssetURL, volume?: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const audio = new Audio(src);
        if(volume) audio.volume = volume;

        const startPlayback = () => {
            resolve();
            audio.play().catch(reject);
        };

        if(audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
            startPlayback();
            return;
        }

        audio.addEventListener("canplaythrough", startPlayback, {once: true});
        audio.addEventListener("error", () => reject(), {once: true});
        audio.load();
    })
}
