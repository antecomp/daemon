import { DGDEV } from "@/devtools/dev";

import { ImprovedNoise } from "three/examples/jsm/Addons.js";

const noise = new ImprovedNoise();

export function flickerIn(el: HTMLElement | SVGElement, duration = 0.6, fps = 30) {
    return new Promise<void>(resolve => {
        const seed = Math.random() * 100;
        const start = performance.now();
        const frameTime = 1 / fps;

        function tick(now: number) {
            const elapsed = (now - start) / 1000;
            const t = Math.min(elapsed / duration, 1);

            // Snap elapsed to the nearest fake frame
            const snappedElapsed = Math.floor(elapsed / frameTime) * frameTime;

            const base = Math.pow(t, 0.6);
            const n1 = (noise.noise(snappedElapsed * 18, seed, 0) + 1) / 2 > 0.7 ? 1 : 0;
            const n2 = (noise.noise(snappedElapsed * 26, seed + 100, 0) + 1) / 2 > 0.6 ? 1 : 0;
            el.style.opacity = String(t > 0.85 ? 1 : (n1 * 0.5 + n2 * 0.3 + base * 0.2));

            t < 1 ? requestAnimationFrame(tick) : resolve();
        }

        requestAnimationFrame(tick);
    });
}

export function flickerOut(el: HTMLElement | SVGElement, duration = 0.6, fps = 24) {
  return new Promise<void>(resolve => {
    const seed = Math.random() * 100;
    const start = performance.now();
    const frameTime = 1 / fps;

    function tick(now: number) {
      const elapsed = (now - start) / 1000;
      const t = Math.min(elapsed / duration, 1);

      const snappedElapsed = Math.floor(elapsed / frameTime) * frameTime;

      const base = Math.pow(1 - t, 0.6);
      const n1 = (noise.noise(snappedElapsed * 18, seed, 0) + 1) / 2 > 0.7 ? 1 : 0;
      const n2 = (noise.noise(snappedElapsed * 26, seed + 100, 0) + 1) / 2 > 0.6 ? 1 : 0;
      el.style.opacity = String(t > 0.85 ? 0 : (n1 * 0.5 + n2 * 0.3 + base * 0.2));

      t < 1 ? requestAnimationFrame(tick) : resolve();
    }

    requestAnimationFrame(tick);
  });
}

DGDEV.attach(flickerIn, 'flckr');
DGDEV.attach(flickerOut, 'flckro');