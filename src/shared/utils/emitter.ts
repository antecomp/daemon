import { createSignal, createEffect, untrack } from "solid-js";

/**
 * Creates a simple event emitter using Solid.js signals.
 * @returns An object with `emit` and `listen` methods for pub/sub pattern.
 */
export function createEmitter() {
  const [tick, setTick] = createSignal(0);

  return {
    emit: () => setTick((t) => t + 1),
    listen: (fn: () => void) =>
      createEffect(() => {
        tick();     // subscribe
        untrack(fn);
      })
  };
}

/**
 * Creates an event emitter that can carry payload data using Solid.js signals.
 * @returns An object with `emit` and `listen` methods for pub/sub pattern with data.
 */
export function createPayloadEmitter<T>() {
  const [event, setEvent] = createSignal<{data: T, ts: number}>();

  return {
    // ts to ensure uniqueness.
    emit: (data: T) => setEvent({ data, ts: performance.now() }),
    listen: (fn: (data: T) => void) =>
      createEffect(() => {
        const ev = event();
        /* 
          createEffect does not care about call depth!
          We need to untrack the function to prevent accidentally 
          tracking things within the function body!
        */
        if (ev) untrack(() => fn(ev.data));
      })
  };
}

/* usage
const emitter = createEmitter();

emitter.listen(() => console.log("Event fired"));

emitter.emit();
*/