import { Orientation } from "@/extra.types";
import PlayerCam, { XYZ } from "./PlayerCam"
import { clamp, Scene } from "lume";
import {createSignal, onCleanup, onMount} from 'solid-js'

interface FreecamProps {
    sceneRef: Scene
}

const ROT_SPEED = 50;
const MAX_ROT = 90;
const MOVEMENT_SPEED = 3;

export default function Freecam(props: FreecamProps) {
    const [basePos, setBasePos] = createSignal<XYZ>([0, 0, 0]);
    const [baseOri, setBaseOri] = createSignal<Orientation>({ yaw: 0, pitch: 0 });

    // Hold keypress state with a simple set
    const keysdown = new Set<string>();
    function keydown(e: KeyboardEvent) { keysdown.add(e.key.toLowerCase()) }
    function keyup(e: KeyboardEvent) { keysdown.delete(e.key.toLowerCase()) }

    let rafID = 0;
    let last = performance.now();

    function step() {
        const now = performance.now();
        const dtSec = (now - last) / 1000;
        last = now;

        // Current target value
        const [x, y, z] = basePos();
        const { yaw, pitch } = baseOri();

        let moveSpeed = MOVEMENT_SPEED;
        let rotSpeed = ROT_SPEED;
        if (keysdown.has("shift")) {
            moveSpeed *= 5;
            rotSpeed *= 2;
        }


        let newYaw = yaw;
        let newPitch = pitch;
        if (keysdown.has("arrowleft")) newYaw += rotSpeed * dtSec;
        if (keysdown.has("arrowright")) newYaw -= rotSpeed * dtSec;
        if (keysdown.has("arrowup")) newPitch -= rotSpeed * dtSec;
        if (keysdown.has("arrowdown")) newPitch += rotSpeed * dtSec;

        // clamp pitch.
        newPitch = clamp(newPitch, -MAX_ROT, MAX_ROT);

        const yawRad = (newYaw * Math.PI) / 180;
        const forwardX = Math.sin(yawRad);
        const forwardZ = Math.cos(yawRad);
        const rightX = Math.cos(yawRad);
        const rightZ = -Math.sin(yawRad);

        let dx = 0, dy = 0, dz = 0;
        if (keysdown.has("w")) { dx -= forwardX * moveSpeed; dz -= forwardZ * moveSpeed; }
        if (keysdown.has("s")) { dx += forwardX * moveSpeed; dz += forwardZ * moveSpeed; }
        if (keysdown.has("a")) { dx -= rightX * moveSpeed; dz -= rightZ * moveSpeed; }
        if (keysdown.has("d")) { dx += rightX * moveSpeed; dz += rightZ * moveSpeed; }
        if (keysdown.has("e") || keysdown.has("v")) { dy += moveSpeed; }
        if (keysdown.has("q") || keysdown.has(" ")) { dy -= moveSpeed; }

        if (dx || dy || dz) setBasePos([x + dx, y + dy, z + dz]);
        if (newYaw !== yaw || newPitch !== pitch) setBaseOri({ yaw: newYaw, pitch: newPitch });

        rafID = requestAnimationFrame(step);

        if(keysdown.has("p")) {
            exportTransform();
        }
    }

    // Export preconfigured PlayerCam component to clipboard to paste right in :)
    function exportTransform() {
        const pos = basePos();
        const ori = baseOri();
        const config = {
            basePos: [Math.round(pos[0]), Math.round(pos[1]), Math.round(pos[2])] as XYZ,
            baseOri: { yaw: Math.round(ori.yaw), pitch: Math.round(ori.pitch) } as Orientation,
        };

        const snippet =
            `<PlayerCam
                basePos={[${config.basePos.join(", ")}]}
                baseOri={{ yaw: ${config.baseOri.yaw}, pitch: ${config.baseOri.pitch} }}
                maxYaw={30}
                maxPitch={20}
                animate={false}
                sceneRef={sceneRef!}
            />`;

        // clipboard + console
        const payload = snippet;
        navigator.clipboard?.writeText(payload).catch(() => {/* ignore */ });
        // eslint-disable-next-line no-console
        console.log("[Freecam export]", config, "\n\nSnippet:\n", snippet);
    }

      onMount(() => {
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    last = performance.now();
    rafID = requestAnimationFrame(step);
  });

    onCleanup(() => {
    cancelAnimationFrame(rafID);
    window.removeEventListener("keydown", keydown);
    window.removeEventListener("keyup", keyup);
  });

  return (
    <PlayerCam
        basePos={basePos()}
        baseOri={baseOri()}
        maxYaw={10}
        maxPitch={10}
        animate
        sceneRef={props.sceneRef}
    />
  )
}