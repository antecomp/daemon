import { AssetURL } from "@/extra.types"
import { nanoid } from "nanoid";
import { createEffect, createSignal } from "solid-js"
import { createMutable } from "solid-js/store";
import { Howl } from "howler";

export type MusicTrackEntry = {
    id: string,
    src: AssetURL,
    volume?: number,
}

const [stack, setStack] = createSignal<MusicTrackEntry[]>([]);
const FADE_DURATION = 1000;
const DEFAULT_VOLUME = 0.5;

let currentHowl: Howl | null = null;
let currentID: string | null = null;

createEffect(() => {
    const top = stack()[stack().length - 1];
    if (!top) {
        if (currentHowl) {
          const toFade = currentHowl;
          toFade.fade(toFade.volume(), 0, FADE_DURATION);
          setTimeout(() => {
            toFade.stop();
            if (currentHowl === toFade) currentHowl = null;
          }, FADE_DURATION);
        }
        return;
    }

    const {src, volume} = top;

    // Change in state of the entry itself, but same entry
    if(currentID === top.id && currentHowl) {
        console.log("I am eating rocks and shitting them out")
        // fade to new volume
        currentHowl.fade(currentHowl.volume(), volume ?? DEFAULT_VOLUME, FADE_DURATION);
        //@ts-expect-error - ._src not in types file, but it exists.
        if(currentHowl._src !== src) { // src changed, fade to new song.
            currentHowl.fade(currentHowl.volume(), 0, FADE_DURATION);
            setTimeout(() => {
                currentHowl?.stop();
                const h = new Howl({src: [src], loop: true, volume: 0});
                h.play();
                h.fade(0, volume ?? DEFAULT_VOLUME, FADE_DURATION);
                currentHowl = h;
            }, FADE_DURATION);
        }
        return;
    }

    console.log("kill me");

    const oldHowl = currentHowl;
    const newHowl = new Howl({src: [src], loop: true, volume: 0});

    newHowl.play();
    newHowl.fade(0, volume ?? DEFAULT_VOLUME, FADE_DURATION);
    currentHowl = newHowl;
    currentID = top.id;

    if(oldHowl) {
        oldHowl.fade(oldHowl.volume(), 0, FADE_DURATION);
        setTimeout(() => oldHowl.stop(), FADE_DURATION);
    }
});


export const MusicManager = {

    // Wrap it mutable and return it so we can reactively update track if desired.
    pushTrack(entry: Omit<MusicTrackEntry, 'id'>): MusicTrackEntry {
        const id = nanoid();
        const track = createMutable({id, ...entry});
        setStack(s => [...s, track]);
        return track;
    },

    removeTrack(id: string) {
        setStack(s => s.filter(t => t.id !== id));
    },

    wipeTracks() {
        setStack([]);
    },

    $debug_pop() {
        setStack(s => s.slice(0, s.length - 1))
    },

    get stack() {
        return stack;
    },

    get currentTrack() {
        return stack()[stack().length - 1] ?? null;
    }
}