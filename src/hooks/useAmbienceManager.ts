import { AssetURL } from '@/extra.types';
import { Howl } from 'howler';
import { onCleanup, onMount } from 'solid-js';

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