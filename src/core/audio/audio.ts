import attachToConsole from "@/devtools/attachToConsole";
import { onCleanup } from "solid-js";

const context = new AudioContext();
const cache = new Map<string, AudioBuffer>();

async function loadBuffer(src: string): Promise<AudioBuffer> {
  if (cache.has(src)) return cache.get(src)!;

  const response = await fetch(src);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await context.decodeAudioData(arrayBuffer);
  cache.set(src, audioBuffer);
  return audioBuffer;
}

attachToConsole(cache, "AUDIO_CACHE");

/** TODO: Document */
export function playSound(
  src: string,
  volume = 1
): [ready: Promise<void>, ended: Promise<void>] {
  const { promise: ready, resolve: resolveReady, reject: rejectReady } = Promise.withResolvers<void>();
  const { promise: ended, resolve: resolveEnded, reject: rejectEnded } = Promise.withResolvers<void>();

  loadBuffer(src)
    .then((buffer) => {
      const source = context.createBufferSource();
      const gainNode = context.createGain();

      source.buffer = buffer;
      gainNode.gain.value = volume;
      source.connect(gainNode);
      gainNode.connect(context.destination);

      source.addEventListener("ended", () => resolveEnded(), { once: true });

      source.start();
      resolveReady();
    })
    .catch((e) => {
      rejectReady(e);
      rejectEnded(e);
    });

  return [ready, ended];
}

export function useSound(preload: string[] = []) {
  const loadedSrcs = new Set<string>();

  function load(src: string) {
    loadedSrcs.add(src);
    return loadBuffer(src);
  }

  function play(src: string, volume?: number) {
    loadedSrcs.add(src);
    return playSound(src, volume);
  }

  // Kick off preloads immediately on mount, errors are intentionally swallowed
  // since these are best-effort — playSound will retry if a preload failed
  for (const src of preload) {
    load(src).catch(() => {});
  }

  onCleanup(() => {
    for (const src of loadedSrcs) {
      cache.delete(src);
    }
    loadedSrcs.clear();
  });

  return { playSound: play, loadSound: load };
}