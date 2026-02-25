import { AssetURL } from "../types/misc.types";

/** Simple playSound that best-effort loads, plays, then destroys an audio instance.
 * Consider using playSound from audio.ts for repeated sounds or sounds that should be buffered.
 * @returns A Promise that resolves when the sound *ends*
 */
export async function playSoundOnce(src: AssetURL, volume?: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const audio = new Audio(src);
        if(volume) audio.volume = volume;
        audio.addEventListener("ended", () => resolve(), {once: true});
        audio.addEventListener("error", () => reject(), {once: true});
        audio.play().catch(reject);
    })
}
/** Simple playSound that best-effort loads, plays, then destroys an audio instance.
 * Consider using playSound from audio.ts for repeated sounds or sounds that should be buffered.
 * @returns A Promise that resolves when the sound *starts*
 */
export async function playSoundOnceOnReady(src: AssetURL, volume?: number): Promise<void> {
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
