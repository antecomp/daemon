import { AssetURL } from '@/extra.types';
import { Howl } from 'howler';
import { createEffect, onCleanup, onMount } from 'solid-js';

type AmbientSound = {
    src: AssetURL;
    volume?: number;
}

const FADE_DURATION = 1000;

/** Creates a single ambient audio track that fades in on component mount and fades out on unmount
 * @param audioConfig - An object specifying the audio source and optional volume level (volume defaults to 0.5).
 * 
 * @example
 * createAmbientAudio({ src: 'path/to/sound.mp3', volume: 0.6 });
*/
export function createAmbientAudio(audioConfig: AmbientSound | null) {
    if (!audioConfig) return;
  
    const { src, volume = 0.5 } = audioConfig;
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

/**
 * Reactively manages ambient audio playback, supporting crossfading between different tracks.
 * To be used with a mutable-wrapped object
 * - @ref createMutable - https://docs.solidjs.com/reference/store-utilities/create-mutable
 * Listens to changes in audioConfig.src and will crossfade between audio sources
 * Also listens to changes in audioConfig.volume and will fade between volume levels 
 */
export function createReactiveAmbientAudio(audioConfig: AmbientSound) {
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