import { AssetURL } from '@/extra.types';
import { Howl } from 'howler';
import { createEffect, onCleanup, onMount } from 'solid-js';

type AmbientSound = {
    src: AssetURL;
    volume?: number;
}

const FADE_DURATION = 1000;

// This is extremely rudimentary, one ambience per scene. 
// Ofc we will need to be smarter if we have more specialized systems. Good enough for now.
export function useAmbienceManager(ambience: AmbientSound | null) {
    if (!ambience) return;
  
    const { src, volume = 0.5 } = ambience;
    const howl = new Howl({
      src: [src],
      loop: true,
      volume: 0,
    });
  
    onMount(() => {
      howl.play();
      howl.fade(0, volume, FADE_DURATION);
    });
  
    onCleanup(() => {
      howl.fade(howl.volume(), 0, FADE_DURATION);
      setTimeout(() => howl.stop(), FADE_DURATION);
    });
}

// Used in conjunction with createMutable. If you wrap the audioConfig input in mutable, then
// changing src will fire a crossfade between tracks.
export function useReactiveAmbienceManager(audioConfig: AmbientSound) {
  let currentHowl: Howl | null = null;
  let currentSrc: string | null = null;

  createEffect(() => {
    const src = audioConfig.src;
    const volume = audioConfig.volume ?? 0.5;

    // Only update volume
    if (src === currentSrc && currentHowl) {
      currentHowl.fade(currentHowl.volume(), volume, FADE_DURATION);
      return;
    }

    // Crossfade to new track
    const oldHowl = currentHowl;
    currentHowl = new Howl({ src: [src], loop: true, volume: 0 });
    currentHowl.play();
    currentHowl.fade(0, volume, FADE_DURATION);
    currentSrc = src;

    if (oldHowl) {
      oldHowl.fade(oldHowl.volume(), 0, FADE_DURATION);
      setTimeout(() => oldHowl.stop(), FADE_DURATION);
    }
  });

  onCleanup(() => {
    if (currentHowl) {
      currentHowl.fade(currentHowl.volume(), 0, FADE_DURATION);
      const toStop = currentHowl;
      setTimeout(() => toStop.stop(), FADE_DURATION);
    }
  });
}